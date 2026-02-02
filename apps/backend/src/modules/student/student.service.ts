import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserGroupMembership } from "../gameplay/entities/user-group-membership.entity";
import { GameAssignment } from "../games/entities/game-assignment.entity";
import { GameSession, GameSessionStatus } from "../gameplay/entities/game-session.entity";
import { Game } from "../games/entities/game.entity";

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(UserGroupMembership)
    private readonly membershipRepo: Repository<UserGroupMembership>,
    @InjectRepository(GameAssignment)
    private readonly assignmentRepo: Repository<GameAssignment>,
    @InjectRepository(GameSession)
    private readonly sessionRepo: Repository<GameSession>,
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>
  ) {}

  async getAssignedGames(studentId: string) {
    // Get student's group memberships
    const memberships = await this.membershipRepo.find({
      where: { studentId },
      relations: ["group"]
    });

    const groupIds = memberships.map(m => m.groupId);

    if (groupIds.length === 0) {
      return [];
    }

    // Get assignments for these groups
    const assignments = await this.assignmentRepo
      .createQueryBuilder("assignment")
      .leftJoinAndSelect("assignment.game", "game")
      .leftJoinAndSelect("game.questions", "questions")
      .where("assignment.groupId IN (:...groupIds)", { groupIds })
      .orderBy("assignment.dueAt", "ASC", "NULLS LAST")
      .addOrderBy("assignment.createdAt", "DESC")
      .getMany();

    // Get progress for each game
    const gamesWithProgress = await Promise.all(
      assignments.map(async (assignment) => {
        const gameProgress = await this.getGameProgress(studentId, assignment.game.id, assignment.id);

        return {
          gameId: assignment.game.id,
          assignmentId: assignment.id,
          title: assignment.game.title,
          description: assignment.game.description,
          questionCount: assignment.game.questions?.length || 0,
          startsAt: assignment.startsAt,
          dueAt: assignment.dueAt,
          ...gameProgress
        };
      })
    );

    return gamesWithProgress;
  }

  async getGameProgress(studentId: string, gameId: string, assignmentId?: string) {
    const where: any = { studentId, gameId };
    if (assignmentId) {
      where.assignmentId = assignmentId;
    }

    const sessions = await this.sessionRepo.find({
      where,
      order: { createdAt: "DESC" }
    });

    const completedSessions = sessions.filter(s => s.status === GameSessionStatus.COMPLETED);
    const bestSession = sessions.find(s => s.isBestAttempt);
    const inProgressSession = sessions.find(s => s.status === GameSessionStatus.IN_PROGRESS);

    let status: "not_started" | "in_progress" | "completed" = "not_started";

    if (inProgressSession) {
      status = "in_progress";
    } else if (completedSessions.length > 0) {
      status = "completed";
    }

    return {
      status,
      attemptCount: sessions.length,
      bestScore: bestSession?.percentageScore || null,
      bestAttemptNumber: bestSession?.attemptNumber || null,
      lastAttemptDate: sessions[0]?.createdAt || null,
      canRetake: sessions.length < 3,
      inProgressSessionId: inProgressSession?.id || null
    };
  }

  async getDashboardOverview(studentId: string) {
    const assignedGames = await this.getAssignedGames(studentId);

    const notStarted = assignedGames.filter(g => g.status === "not_started");
    const inProgress = assignedGames.filter(g => g.status === "in_progress");
    const completed = assignedGames.filter(g => g.status === "completed");

    // Calculate average score from completed games
    const completedScores = completed
      .filter(g => g.bestScore !== null)
      .map(g => g.bestScore as number);

    const averageScore = completedScores.length > 0
      ? completedScores.reduce((sum, score) => sum + score, 0) / completedScores.length
      : 0;

    // Get recent activity (last 5 completed sessions across all games)
    const recentSessions = await this.sessionRepo.find({
      where: { studentId, status: GameSessionStatus.COMPLETED },
      relations: ["game"],
      order: { completedAt: "DESC" },
      take: 5
    });

    const recentActivity = recentSessions.map(session => ({
      gameId: session.gameId,
      gameTitle: session.game.title,
      score: session.percentageScore,
      completedAt: session.completedAt,
      passed: session.percentageScore >= 70
    }));

    // Get upcoming due dates
    const upcomingDue = assignedGames
      .filter(g => g.dueAt && new Date(g.dueAt) > new Date() && g.status !== "completed")
      .sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime())
      .slice(0, 5)
      .map(g => ({
        gameId: g.gameId,
        title: g.title,
        dueAt: g.dueAt,
        status: g.status
      }));

    return {
      stats: {
        assignedCount: assignedGames.length,
        completedCount: completed.length,
        inProgressCount: inProgress.length,
        averageScore: Math.round(averageScore * 100) / 100
      },
      recentActivity,
      upcomingDue
    };
  }

  async getScoreHistory(studentId: string) {
    const sessions = await this.sessionRepo.find({
      where: { studentId, status: GameSessionStatus.COMPLETED },
      relations: ["game"],
      order: { completedAt: "DESC" }
    });

    return sessions.map(session => ({
      sessionId: session.id,
      gameId: session.gameId,
      gameTitle: session.game.title,
      score: session.percentageScore,
      totalScore: session.totalScore,
      attemptNumber: session.attemptNumber,
      isBestAttempt: session.isBestAttempt,
      passed: session.percentageScore >= 70,
      completedAt: session.completedAt,
      timeSpentSeconds: session.timeSpentSeconds
    }));
  }

  async getProfile(studentId: string) {
    const overview = await this.getDashboardOverview(studentId);
    const scoreHistory = await this.getScoreHistory(studentId);

    // Calculate total time spent
    const totalTimeSpent = scoreHistory.reduce((sum, s) => sum + (s.timeSpentSeconds || 0), 0);

    // Calculate pass rate
    const passedCount = scoreHistory.filter(s => s.passed).length;
    const passRate = scoreHistory.length > 0
      ? (passedCount / scoreHistory.length) * 100
      : 0;

    return {
      studentId,
      stats: {
        ...overview.stats,
        totalTimeSpent,
        passRate: Math.round(passRate * 100) / 100,
        totalAttempts: scoreHistory.length
      },
      scoreHistory
    };
  }
}
