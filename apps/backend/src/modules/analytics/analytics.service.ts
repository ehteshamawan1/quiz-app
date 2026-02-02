import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GameSession, GameSessionStatus } from "../gameplay/entities/game-session.entity";
import { QuestionAttempt } from "../gameplay/entities/question-attempt.entity";
import { HintUsage } from "../gameplay/entities/hint-usage.entity";
import { Game } from "../games/entities/game.entity";
import { GameQuestion } from "../games/entities/game-question.entity";
import { GameAssignment } from "../games/entities/game-assignment.entity";
import { User } from "../users/entities/user.entity";
import { UserGroupMembership } from "../gameplay/entities/user-group-membership.entity";
import { DateRangeDto } from "./dto/game-analytics.dto";

export interface GameAnalytics {
  gameId: string;
  gameName: string;
  completionRate: number;
  averageScore: number;
  averageTime: number;
  totalAttempts: number;
  uniqueStudents: number;
  attemptDistribution: Array<{ range: string; count: number }>;
  passRate: number;
  topPerformers: Array<{ studentId: string; studentName: string; score: number }>;
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  gamesCompleted: number;
  averageScore: number;
  passRate: number;
  totalTimeSpent: number;
  scoreHistory: Array<{ gameId: string; gameName: string; score: number; completedAt: Date }>;
  recentGames: Array<{ gameId: string; gameName: string; score: number; completedAt: Date }>;
}

export interface GroupAnalytics {
  groupId: string;
  groupName: string;
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  averageScore: number;
  topPerformers: Array<{ studentId: string; studentName: string; averageScore: number }>;
  strugglingStudents: Array<{ studentId: string; studentName: string; averageScore: number }>;
}

export interface AssignmentAnalytics {
  assignmentId: string;
  gameId: string;
  gameName: string;
  totalStudents: number;
  submitted: number;
  pending: number;
  averageScore: number;
  dueDate: Date;
  completionTrend: Array<{ date: string; count: number }>;
  studentResults: Array<{ studentId: string; studentName: string; score: number; status: string }>;
}

export interface QuestionDifficulty {
  questionId: string;
  prompt: string;
  errorRate: number;
  averageTime: number;
  totalAttempts: number;
  correctAttempts: number;
  mostCommonWrongAnswer?: string;
}

export interface EducatorOverview {
  activeGames: number;
  totalStudents: number;
  averageClassScore: number;
  totalSessions: number;
  recentActivity: Array<{ type: string; description: string; timestamp: Date }>;
}

export interface TrendData {
  gameId: string;
  gameName: string;
  dataPoints: Array<{ date: string; averageScore: number; sessionCount: number }>;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(GameSession)
    private readonly sessionRepo: Repository<GameSession>,
    @InjectRepository(QuestionAttempt)
    private readonly attemptRepo: Repository<QuestionAttempt>,
    @InjectRepository(HintUsage)
    private readonly hintRepo: Repository<HintUsage>,
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
    @InjectRepository(GameQuestion)
    private readonly questionRepo: Repository<GameQuestion>,
    @InjectRepository(GameAssignment)
    private readonly assignmentRepo: Repository<GameAssignment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserGroupMembership)
    private readonly membershipRepo: Repository<UserGroupMembership>
  ) {}

  private async validateGameOwnership(gameId: string, educatorId: string): Promise<void> {
    const game = await this.gameRepo.findOne({ where: { id: gameId } });
    if (!game) {
      throw new NotFoundException("Game not found");
    }
    if (game.ownerId !== educatorId) {
      throw new ForbiddenException("You do not have access to this game's analytics");
    }
  }

  async getGameAnalytics(gameId: string, educatorId: string, dateRange?: DateRangeDto): Promise<GameAnalytics> {
    let gameTitle = "All Games";

    // Build query with optional date range
    let queryBuilder = this.sessionRepo
      .createQueryBuilder("session")
      .andWhere("session.status = :status", { status: GameSessionStatus.COMPLETED });

    if (gameId === 'all') {
      queryBuilder = queryBuilder
        .innerJoin("session.game", "game")
        .andWhere("game.owner_id = :educatorId", { educatorId });
    } else {
      await this.validateGameOwnership(gameId, educatorId);
      const game = await this.gameRepo.findOne({ where: { id: gameId } });
      if (!game) {
        throw new NotFoundException("Game not found");
      }
      gameTitle = game.title;
      queryBuilder = queryBuilder.andWhere("session.game_id = :gameId", { gameId });
    }

    if (dateRange?.startDate) {
      queryBuilder = queryBuilder.andWhere("session.completed_at >= :startDate", { startDate: dateRange.startDate });
    }
    if (dateRange?.endDate) {
      queryBuilder = queryBuilder.andWhere("session.completed_at <= :endDate", { endDate: dateRange.endDate });
    }

    const sessions = await queryBuilder.getMany();

    if (sessions.length === 0) {
      return {
        gameId,
        gameName: gameTitle,
        completionRate: 0,
        averageScore: 0,
        averageTime: 0,
        totalAttempts: 0,
        uniqueStudents: 0,
        attemptDistribution: [],
        passRate: 0,
        topPerformers: []
      };
    }

    // Calculate metrics
    const totalAttempts = sessions.length;
    const uniqueStudents = new Set(sessions.map(s => s.studentId)).size;
    const averageScore = sessions.reduce((sum, s) => sum + Number(s.percentageScore), 0) / sessions.length;
    const averageTime = sessions.reduce((sum, s) => sum + s.timeSpentSeconds, 0) / sessions.length;
    const passRate = (sessions.filter(s => Number(s.percentageScore) >= 60).length / sessions.length) * 100;

    // Attempt distribution (score ranges)
    const distribution = [
      { range: "0-20", count: 0 },
      { range: "21-40", count: 0 },
      { range: "41-60", count: 0 },
      { range: "61-80", count: 0 },
      { range: "81-100", count: 0 }
    ];

    sessions.forEach(session => {
      const score = Number(session.percentageScore);
      if (score <= 20) distribution[0].count++;
      else if (score <= 40) distribution[1].count++;
      else if (score <= 60) distribution[2].count++;
      else if (score <= 80) distribution[3].count++;
      else distribution[4].count++;
    });

    // Top performers (best attempt per student)
    let bestAttemptsQuery = this.sessionRepo
      .createQueryBuilder("session")
      .andWhere("session.is_best_attempt = :isBest", { isBest: true })
      .orderBy("session.percentage_score", "DESC")
      .limit(5);

    if (gameId === 'all') {
      bestAttemptsQuery = bestAttemptsQuery
        .innerJoin("session.game", "game")
        .andWhere("game.owner_id = :educatorId", { educatorId });
    } else {
      bestAttemptsQuery = bestAttemptsQuery.andWhere("session.game_id = :gameId", { gameId });
    }

    const bestAttempts = await bestAttemptsQuery.getMany();

    const topPerformers = await Promise.all(
      bestAttempts.map(async (session) => {
        const student = await this.userRepo.findOne({ where: { id: session.studentId } });
        return {
          studentId: session.studentId,
          studentName: student ? student.username : "Unknown",
          score: Number(session.percentageScore)
        };
      })
    );

    // Completion rate (students who completed vs assigned)
    const completionRate = 100; // For now, 100% of sessions are completed sessions

    return {
      gameId,
      gameName: gameTitle,
      completionRate,
      averageScore,
      averageTime,
      totalAttempts,
      uniqueStudents,
      attemptDistribution: distribution,
      passRate,
      topPerformers
    };
  }

  async getStudentPerformance(studentId: string, educatorId: string, dateRange?: DateRangeDto): Promise<StudentPerformance> {
    const student = await this.userRepo.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    // Build query
    let queryBuilder = this.sessionRepo
      .createQueryBuilder("session")
      .innerJoinAndSelect("session.game", "game")
      .where("session.student_id = :studentId", { studentId })
      .andWhere("session.status = :status", { status: GameSessionStatus.COMPLETED })
      .andWhere("game.owner_id = :educatorId", { educatorId });

    if (dateRange?.startDate) {
      queryBuilder = queryBuilder.andWhere("session.completed_at >= :startDate", { startDate: dateRange.startDate });
    }
    if (dateRange?.endDate) {
      queryBuilder = queryBuilder.andWhere("session.completed_at <= :endDate", { endDate: dateRange.endDate });
    }

    const sessions = await queryBuilder.getMany();

    if (sessions.length === 0) {
      return {
        studentId,
        studentName: student.username,
        gamesCompleted: 0,
        averageScore: 0,
        passRate: 0,
        totalTimeSpent: 0,
        scoreHistory: [],
        recentGames: []
      };
    }

    const gamesCompleted = new Set(sessions.map(s => s.gameId)).size;
    const averageScore = sessions.reduce((sum, s) => sum + Number(s.percentageScore), 0) / sessions.length;
    const passRate = (sessions.filter(s => Number(s.percentageScore) >= 60).length / sessions.length) * 100;
    const totalTimeSpent = sessions.reduce((sum, s) => sum + s.timeSpentSeconds, 0);

    const scoreHistory = sessions.map(session => ({
      gameId: session.gameId,
      gameName: session.game.title,
      score: Number(session.percentageScore),
      completedAt: session.completedAt!
    }));

    const recentGames = scoreHistory
      .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
      .slice(0, 5);

    return {
      studentId,
      studentName: student.username,
      gamesCompleted,
      averageScore,
      passRate,
      totalTimeSpent,
      scoreHistory,
      recentGames
    };
  }

  async getQuestionDifficulty(gameId: string, educatorId: string): Promise<QuestionDifficulty[]> {
    let questionsQuery = this.questionRepo.createQueryBuilder("question");

    if (gameId === 'all') {
      questionsQuery = questionsQuery
        .innerJoin("question.game", "game")
        .where("game.owner_id = :educatorId", { educatorId });
    } else {
      await this.validateGameOwnership(gameId, educatorId);
      questionsQuery = questionsQuery.where("question.game_id = :gameId", { gameId });
    }

    const questions = await questionsQuery.orderBy("question.points", "ASC").getMany();

    const difficulties: QuestionDifficulty[] = [];

    for (const question of questions) {
      const attempts = await this.attemptRepo.find({
        where: { questionId: question.id }
      });

      if (attempts.length === 0) {
        difficulties.push({
          questionId: question.id,
          prompt: question.prompt,
          errorRate: 0,
          averageTime: 0,
          totalAttempts: 0,
          correctAttempts: 0
        });
        continue;
      }

      const totalAttempts = attempts.length;
      const correctAttempts = attempts.filter(a => a.isCorrect).length;
      const errorRate = ((totalAttempts - correctAttempts) / totalAttempts) * 100;
      const averageTime = attempts.reduce((sum, a) => sum + a.timeSpentSeconds, 0) / totalAttempts;

      difficulties.push({
        questionId: question.id,
        prompt: question.prompt,
        errorRate,
        averageTime,
        totalAttempts,
        correctAttempts
      });
    }

    // Limit to top 20 most difficult if 'all' to avoid massive list
    const sorted = difficulties.sort((a, b) => b.errorRate - a.errorRate);
    if (gameId === 'all') {
      return sorted.slice(0, 20);
    }
    return sorted;
  }

  async getEducatorOverview(educatorId: string): Promise<EducatorOverview> {
    // Active games
    const activeGames = await this.gameRepo.count({
      where: { ownerId: educatorId, isPublished: true }
    });

    // Total unique students
    const sessions = await this.sessionRepo
      .createQueryBuilder("session")
      .innerJoin("session.game", "game")
      .where("game.owner_id = :educatorId", { educatorId })
      .select("DISTINCT session.student_id", "studentId")
      .getRawMany();

    const totalStudents = sessions.length;

    // Average class score
    const completedSessions = await this.sessionRepo
      .createQueryBuilder("session")
      .innerJoin("session.game", "game")
      .where("game.owner_id = :educatorId", { educatorId })
      .andWhere("session.status = :status", { status: GameSessionStatus.COMPLETED })
      .getMany();

    const averageClassScore = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + Number(s.percentageScore), 0) / completedSessions.length
      : 0;

    const totalSessions = completedSessions.length;

    // Recent activity
    const recentSessions = await this.sessionRepo
      .createQueryBuilder("session")
      .innerJoinAndSelect("session.game", "game")
      .where("game.owner_id = :educatorId", { educatorId })
      .orderBy("session.completed_at", "DESC")
      .limit(5)
      .getMany();

    const recentActivity = await Promise.all(
      recentSessions.map(async (session) => {
        const student = await this.userRepo.findOne({ where: { id: session.studentId } });
        return {
          type: "game_completed",
          description: `${student?.username || "Student"} completed ${session.game.title}`,
          timestamp: session.completedAt || session.updatedAt
        };
      })
    );

    return {
      activeGames,
      totalStudents,
      averageClassScore,
      totalSessions,
      recentActivity
    };
  }

  async getScoreTrends(gameId: string, educatorId: string, dateRange?: DateRangeDto): Promise<TrendData> {
    let gameName = "All Games";
    let queryBuilder = this.sessionRepo
      .createQueryBuilder("session")
      .andWhere("session.status = :status", { status: GameSessionStatus.COMPLETED });

    if (gameId === 'all') {
      queryBuilder = queryBuilder
        .innerJoin("session.game", "game")
        .andWhere("game.owner_id = :educatorId", { educatorId });
    } else {
      await this.validateGameOwnership(gameId, educatorId);
      const game = await this.gameRepo.findOne({ where: { id: gameId } });
      if (!game) {
        throw new NotFoundException("Game not found");
      }
      gameName = game.title;
      queryBuilder = queryBuilder.andWhere("session.game_id = :gameId", { gameId });
    }

    if (dateRange?.startDate) {
      queryBuilder = queryBuilder.andWhere("session.completed_at >= :startDate", { startDate: dateRange.startDate });
    }
    if (dateRange?.endDate) {
      queryBuilder = queryBuilder.andWhere("session.completed_at <= :endDate", { endDate: dateRange.endDate });
    }

    const sessions = await queryBuilder
      .orderBy("session.completed_at", "ASC")
      .getMany();

    // Group by date
    const dataByDate = new Map<string, { scores: number[]; count: number }>();

    sessions.forEach(session => {
      if (!session.completedAt) return;
      const dateKey = session.completedAt.toISOString().split("T")[0];
      if (!dataByDate.has(dateKey)) {
        dataByDate.set(dateKey, { scores: [], count: 0 });
      }
      const data = dataByDate.get(dateKey)!;
      data.scores.push(Number(session.percentageScore));
      data.count++;
    });

    const dataPoints = Array.from(dataByDate.entries()).map(([date, data]) => ({
      date,
      averageScore: data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length,
      sessionCount: data.count
    }));

    return {
      gameId,
      gameName,
      dataPoints
    };
  }

  async getAssignmentAnalytics(assignmentId: string, educatorId: string): Promise<AssignmentAnalytics> {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ["game", "group"]
    });

    if (!assignment) {
      throw new NotFoundException("Assignment not found");
    }

    await this.validateGameOwnership(assignment.gameId, educatorId);

    // Get all students in the group
    const totalStudents = await this.membershipRepo.count({ where: { groupId: assignment.group.id } });

    // Get submissions
    const sessions = await this.sessionRepo.find({
      where: {
        assignmentId,
        status: GameSessionStatus.COMPLETED
      }
    });

    const submitted = new Set(sessions.map(s => s.studentId)).size;
    const pending = totalStudents - submitted;

    const averageScore = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + Number(s.percentageScore), 0) / sessions.length
      : 0;

    // Completion trend (by date)
    const trendMap = new Map<string, number>();
    sessions.forEach(session => {
      if (!session.completedAt) return;
      const dateKey = session.completedAt.toISOString().split("T")[0];
      trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + 1);
    });

    const completionTrend = Array.from(trendMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Student results
    const studentResults = await Promise.all(
      sessions.map(async (session) => {
        const student = await this.userRepo.findOne({ where: { id: session.studentId } });
        return {
          studentId: session.studentId,
          studentName: student ? student.username : "Unknown",
          score: Number(session.percentageScore),
          status: session.status
        };
      })
    );

    return {
      assignmentId,
      gameId: assignment.gameId,
      gameName: assignment.game.title,
      totalStudents,
      submitted,
      pending,
      averageScore,
      dueDate: assignment.dueAt!,
      completionTrend,
      studentResults
    };
  }
}
