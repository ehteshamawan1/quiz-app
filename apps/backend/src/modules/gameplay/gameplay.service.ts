import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomUUID } from "crypto";
import { GameSession, GameSessionStatus } from "./entities/game-session.entity";
import { QuestionAttempt } from "./entities/question-attempt.entity";
import { HintUsage } from "./entities/hint-usage.entity";
import { Game } from "../games/entities/game.entity";
import { GameQuestion } from "../games/entities/game-question.entity";
import { GameAnswer } from "../games/entities/game-answer.entity";
import { GameHint } from "../games/entities/game-hint.entity";
import { calculateScore } from "@nursequest/game-engine";
import { TemplateTypes } from "@nursequest/shared";

@Injectable()
export class GameplayService {
  constructor(
    @InjectRepository(GameSession)
    private readonly sessionRepo: Repository<GameSession>,
    @InjectRepository(QuestionAttempt)
    private readonly attemptRepo: Repository<QuestionAttempt>,
    @InjectRepository(HintUsage)
    private readonly hintUsageRepo: Repository<HintUsage>,
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,
    @InjectRepository(GameQuestion)
    private readonly questionRepo: Repository<GameQuestion>,
    @InjectRepository(GameHint)
    private readonly hintRepo: Repository<GameHint>,
    @InjectRepository(GameAnswer)
    private readonly answerRepo: Repository<GameAnswer>
  ) {}

  async startSession(studentId: string, gameId: string, assignmentId?: string): Promise<GameSession> {
    // Validate game exists
    const game = await this.gameRepo.findOne({ where: { id: gameId } });
    if (!game) {
      throw new NotFoundException("Game not found");
    }

    // Validate attempt limit (max 3 attempts)
    await this.validateAttemptLimit(studentId, gameId, assignmentId);

    // Count existing attempts to determine attempt number
    const where: any = { studentId, gameId };
    if (assignmentId) {
      where.assignmentId = assignmentId;
    }

    const existingAttempts = await this.sessionRepo.count({ where });

    // Create new session
    const session = this.sessionRepo.create({
      id: randomUUID(),
      studentId,
      gameId,
      assignmentId,
      status: GameSessionStatus.IN_PROGRESS,
      currentQuestionIndex: 0,
      totalScore: 0,
      percentageScore: 0,
      attemptNumber: existingAttempts + 1,
      isBestAttempt: false,
      timeSpentSeconds: 0
    });

    return this.sessionRepo.save(session);
  }

  async validateAttemptLimit(studentId: string, gameId: string, assignmentId?: string): Promise<void> {
    const where: any = { studentId, gameId };
    if (assignmentId) {
      where.assignmentId = assignmentId;
    }

    const attempts = await this.sessionRepo.count({ where });

    if (attempts >= 3) {
      throw new BadRequestException("Maximum 3 attempts allowed per game");
    }
  }

  async getSession(sessionId: string, studentId: string): Promise<GameSession> {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, studentId },
      relations: ["game", "questionAttempts", "hintUsages"]
    });

    if (!session) {
      throw new ForbiddenException("Session not found or access denied");
    }

    return session;
  }

  async getGameForSession(sessionId: string, studentId: string): Promise<Game> {
    const session = await this.getSession(sessionId, studentId);
    
    const game = await this.gameRepo.findOne({
      where: { id: session.gameId },
      relations: ["template", "questions", "questions.answers", "questions.hints"],
      order: { questions: { points: "ASC" } } // or any order
    });

    if (!game) {
      throw new NotFoundException("Game not found");
    }

    return game;
  }

  async getCurrentQuestion(sessionId: string, studentId: string) {
    const session = await this.getSession(sessionId, studentId);

    if (session.status !== GameSessionStatus.IN_PROGRESS) {
      throw new BadRequestException("Session is not in progress");
    }

    // Get all questions for the game
    const questions = await this.questionRepo.find({
      where: { gameId: session.gameId },
      relations: ["answers", "hints"],
      order: { points: "ASC" }
    });

    if (session.currentQuestionIndex >= questions.length) {
      throw new BadRequestException("No more questions available");
    }

    const currentQuestion = questions[session.currentQuestionIndex];

    // Get revealed hints for this question in this session
    const revealedHints = await this.hintUsageRepo.find({
      where: { sessionId, questionId: currentQuestion.id },
      relations: ["hint"]
    });

    // Return question with answers (hide correctness) and hints (mark revealed)
    return {
      question: {
        id: currentQuestion.id,
        prompt: currentQuestion.prompt,
        points: currentQuestion.points,
        allowMultiple: currentQuestion.allowMultiple,
        answers: currentQuestion.answers.map(a => ({
          id: a.id,
          text: a.text
          // Note: isCorrect is intentionally hidden
        })),
        hints: currentQuestion.hints.map(h => {
          const revealed = revealedHints.find(rh => rh.hintId === h.id);
          return {
            id: h.id,
            text: revealed ? h.text : undefined, // Only show text if revealed
            penalty: h.penalty,
            isRevealed: !!revealed
          };
        })
      },
      questionIndex: session.currentQuestionIndex,
      totalQuestions: questions.length,
      revealedHintIds: revealedHints.map(rh => rh.hintId)
    };
  }

  async revealHint(sessionId: string, questionId: string, hintId: string, studentId: string) {
    const session = await this.getSession(sessionId, studentId);

    if (session.status !== GameSessionStatus.IN_PROGRESS) {
      throw new BadRequestException("Session is not in progress");
    }

    // Check if hint exists
    const hint = await this.hintRepo.findOne({ where: { id: hintId, questionId } });
    if (!hint) {
      throw new NotFoundException("Hint not found");
    }

    // Check if already revealed
    const existing = await this.hintUsageRepo.findOne({
      where: { sessionId, questionId, hintId }
    });

    if (existing) {
      throw new BadRequestException("Hint already revealed");
    }

    // Check if question has already been answered
    const existingAttempt = await this.attemptRepo.findOne({
      where: { sessionId, questionId }
    });

    if (existingAttempt) {
      throw new BadRequestException("Cannot reveal hints after answering question");
    }

    // Create hint usage record
    const hintUsage = this.hintUsageRepo.create({
      id: randomUUID(),
      sessionId: session.id,
      questionId,
      hintId,
      session,
      question: { id: questionId } as any,
      hint: { id: hintId } as any
    });

    await this.hintUsageRepo.save(hintUsage);

    return { hint: { id: hint.id, text: hint.text, penalty: hint.penalty } };
  }

  async submitAnswer(
    sessionId: string,
    questionId: string,
    selectedAnswerIds: any,
    timeSpentSeconds: number,
    studentId: string
  ) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, studentId }
    });

    if (!session) {
      throw new ForbiddenException("Session not found or access denied");
    }

    if (session.status !== GameSessionStatus.IN_PROGRESS) {
      throw new BadRequestException("Session is not in progress");
    }

    // Check if already answered
    const existingAttempt = await this.attemptRepo.findOne({
      where: { sessionId, questionId }
    });

    if (existingAttempt) {
      throw new BadRequestException("Question already answered");
    }

    // Get question with answers
    const question = await this.questionRepo.findOne({
      where: { id: questionId },
      relations: ["answers", "hints"]
    });

    if (!question) {
      throw new NotFoundException("Question not found");
    }

    // Validate answer
    const { isCorrect, correctAnswerIds } = this.validateAnswer(
      question,
      selectedAnswerIds
    );

    // Get hint usage count for this question
    const hintsUsed = await this.hintUsageRepo.count({
      where: { sessionId, questionId }
    });

    // Calculate total hint penalty
    const hintRecords = await this.hintUsageRepo.find({
      where: { sessionId, questionId },
      relations: ["hint"]
    });
    const totalHintPenalty = hintRecords.reduce((sum, record) => sum + record.hint.penalty, 0);

    // Calculate points earned
    const pointsEarned = calculateScore({
      correct: isCorrect,
      hintsUsed,
      basePoints: question.points,
      hintPenalty: totalHintPenalty / Math.max(hintsUsed, 1) // Average penalty per hint
    });

    // Save attempt
    const attempt = this.attemptRepo.create({
      id: randomUUID(),
      sessionId: session.id,
      questionId: question.id,
      session,
      question,
      selectedAnswerIds,
      isCorrect,
      pointsEarned,
      hintsUsed,
      timeSpentSeconds
    });

    await this.attemptRepo.save(attempt);

    // Update session score and move to next question
    session.totalScore += pointsEarned;
    session.currentQuestionIndex += 1;
    await this.sessionRepo.save(session);

    return {
      isCorrect,
      pointsEarned,
      correctAnswerIds,
      explanation: question.explanation
    };
  }

  private validateAnswer(question: GameQuestion, answer: any): { isCorrect: boolean; correctAnswerIds: string[] } {
    const correctAnswers = question.answers ? question.answers.filter(a => a.isCorrect) : [];
    const correctAnswerIds = correctAnswers.map(a => a.id);

    // Drag & Drop
    if (question.dragItems && question.dropZones) {
      const placement = answer || {};
      let isCorrect = true;
      
      for (const zone of question.dropZones) {
        // answer is { itemId: zoneId }, we need to find itemId for this zoneId
        const placedItemId = Object.keys(placement).find(itemId => placement[itemId] === zone.id);
        
        if (zone.correctItemIds && zone.correctItemIds.length > 0) {
          if (!placedItemId || !zone.correctItemIds.includes(placedItemId)) {
            isCorrect = false;
            break;
          }
        }
      }
      return { isCorrect, correctAnswerIds: [] };
    }

    // Word Cross
    if (question.crosswordGrid) {
      const grid = question.crosswordGrid;
      const userGrid = answer || {};
      let isCorrect = true;

      if (grid.cells) {
        for (const cell of grid.cells) {
          if (!cell.isBlack) {
            const key = `${cell.row}-${cell.col}`;
            const userLetter = userGrid[key];
            if ((userLetter || "").toUpperCase() !== (cell.letter || "").toUpperCase()) {
              isCorrect = false;
              break;
            }
          }
        }
      }
      return { isCorrect, correctAnswerIds: [] };
    }

    // Standard MCQ / Hint Discovery
    const selectedAnswerIds = Array.isArray(answer) ? answer : [];

    if (question.allowMultiple) {
      // Multiple choice: all correct selected, no incorrect selected
      const isCorrect =
        selectedAnswerIds.length === correctAnswerIds.length &&
        selectedAnswerIds.every(id => correctAnswerIds.includes(id));
      return { isCorrect, correctAnswerIds };
    } else {
      // Single choice: selected answer must be the only correct one
      const isCorrect =
        selectedAnswerIds.length === 1 &&
        correctAnswerIds.includes(selectedAnswerIds[0]);
      return { isCorrect, correctAnswerIds };
    }
  }

  async completeSession(sessionId: string, totalTimeSpentSeconds: number, studentId: string) {
    const session = await this.getSession(sessionId, studentId);

    if (session.status !== GameSessionStatus.IN_PROGRESS) {
      throw new BadRequestException("Session is not in progress");
    }

    // Fetch game to check template type
    const game = await this.gameRepo.findOne({
      where: { id: session.gameId },
      relations: ["template"]
    });

    // Get total possible score
    const questions = await this.questionRepo.find({
      where: { gameId: session.gameId }
    });

    const totalPossibleScore = questions.reduce((sum, q) => sum + q.points, 0);

    // Calculate percentage
    let percentageScore = 0;
    
    // For Flashcards, force 100% on completion
    if (game?.template?.type === TemplateTypes.FLASHCARDS) {
      percentageScore = 100;
    } else {
      // For scored games, calculate normally
      // If total possible score is 0 (unusual for non-flashcards), prevent div by zero
      percentageScore = totalPossibleScore > 0
        ? (session.totalScore / totalPossibleScore) * 100
        : 100;
    }

    // Update session
    session.status = GameSessionStatus.COMPLETED;
    session.timeSpentSeconds = totalTimeSpentSeconds;
    session.percentageScore = Math.round(percentageScore * 100) / 100; // Round to 2 decimals
    session.completedAt = new Date();

    await this.sessionRepo.save(session);

    // Update best attempt
    await this.updateBestAttempt(studentId, session.gameId);

    return session;
  }

  async updateBestAttempt(studentId: string, gameId: string): Promise<void> {
    // Get all sessions for this student and game
    const sessions = await this.sessionRepo.find({
      where: { studentId, gameId, status: GameSessionStatus.COMPLETED },
      order: { percentageScore: "DESC" }
    });

    if (sessions.length === 0) return;

    // Reset all to not best
    await this.sessionRepo.update(
      { studentId, gameId },
      { isBestAttempt: false }
    );

    // Mark the highest scoring session as best
    await this.sessionRepo.update(
      { id: sessions[0].id },
      { isBestAttempt: true }
    );
  }

  async getSessionResults(sessionId: string, studentId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, studentId },
      relations: ["game", "questionAttempts", "questionAttempts.question", "questionAttempts.question.answers"]
    });

    if (!session) {
      throw new ForbiddenException("Session not found or access denied");
    }

    if (session.status !== GameSessionStatus.COMPLETED) {
      throw new BadRequestException("Session is not completed yet");
    }

    // Get detailed results for each question
    const questionResults = await Promise.all(
      session.questionAttempts.map(async (attempt) => {
        const question = await this.questionRepo.findOne({
          where: { id: attempt.questionId },
          relations: ["answers"]
        });

        return {
          questionId: attempt.questionId,
          prompt: question?.prompt,
          selectedAnswerIds: attempt.selectedAnswerIds,
          correctAnswerIds: question?.answers.filter(a => a.isCorrect).map(a => a.id) || [],
          isCorrect: attempt.isCorrect,
          pointsEarned: attempt.pointsEarned,
          explanation: question?.explanation,
          answers: question?.answers.map(a => ({
            id: a.id,
            text: a.text,
            isCorrect: a.isCorrect
          }))
        };
      })
    );

    return {
      sessionId: session.id,
      gameId: session.gameId,
      gameTitle: session.game.title,
      totalScore: session.totalScore,
      percentageScore: session.percentageScore,
      timeSpentSeconds: session.timeSpentSeconds,
      attemptNumber: session.attemptNumber,
      isBestAttempt: session.isBestAttempt,
      passed: session.percentageScore >= 70,
      completedAt: session.completedAt,
      questionResults
    };
  }
}
