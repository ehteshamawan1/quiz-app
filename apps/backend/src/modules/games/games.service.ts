import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { randomUUID } from "crypto";
import { Game } from "./entities/game.entity";
import { GameQuestion } from "./entities/game-question.entity";
import { GameAnswer } from "./entities/game-answer.entity";
import { GameHint } from "./entities/game-hint.entity";
import { GameAssignment } from "./entities/game-assignment.entity";
import { TemplateTypes } from "@nursequest/shared";

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gamesRepo: Repository<Game>,
    @InjectRepository(GameAssignment)
    private readonly assignmentsRepo: Repository<GameAssignment>
  ) {}

  private validateTemplateConfig(templateType: string, questions: any[]): void {
    switch (templateType) {
      case TemplateTypes.FLASHCARDS:
        questions.forEach((q, index) => {
          if (!q.front && !q.cardFront && !q.prompt) {
            throw new BadRequestException(`Card ${index + 1} is missing front content`);
          }
          if (!q.back && !q.cardBack && !q.explanation) {
            throw new BadRequestException(`Card ${index + 1} is missing back content`);
          }
        });
        break;

      case TemplateTypes.HINT_DISCOVERY:
        questions.forEach((q, index) => {
          if (!q.prompt) {
            throw new BadRequestException(`Question ${index + 1} is missing a prompt`);
          }
          if (!q.answers || q.answers.length < 2) {
            throw new BadRequestException(`Question ${index + 1} must have at least 2 answers`);
          }
          if (!q.answers.some((a: any) => a.isCorrect)) {
            throw new BadRequestException(`Question ${index + 1} must have a correct answer`);
          }
          if (!q.hints || q.hints.length === 0) {
            throw new BadRequestException(`Question ${index + 1} must have at least one hint for hint discovery template`);
          }
        });
        break;

      case TemplateTypes.TIMED_QUIZ:
        questions.forEach((q, index) => {
          if (!q.prompt) {
            throw new BadRequestException(`Question ${index + 1} is missing a prompt`);
          }
          if (!q.answers || q.answers.length < 2) {
            throw new BadRequestException(`Question ${index + 1} must have at least 2 answers`);
          }
          const correctCount = q.answers.filter((a: any) => a.isCorrect).length;
          if (correctCount !== 1) {
            throw new BadRequestException(`Question ${index + 1} must have exactly one correct answer for timed quiz`);
          }
        });
        break;

      case TemplateTypes.DRAG_DROP:
        questions.forEach((q, index) => {
          if (!q.prompt) {
            throw new BadRequestException(`Question ${index + 1} is missing a prompt`);
          }
          if (!q.dragItems || q.dragItems.length === 0) {
            throw new BadRequestException(`Question ${index + 1} must have draggable items`);
          }
          if (!q.dropZones || q.dropZones.length === 0) {
            throw new BadRequestException(`Question ${index + 1} must have drop zones`);
          }
          q.dropZones.forEach((zone: any) => {
            if (!zone.correctItemIds || zone.correctItemIds.length === 0) {
              throw new BadRequestException(`Question ${index + 1}: Each drop zone must have at least one correct item`);
            }
          });
        });
        break;

      case TemplateTypes.WORD_CROSS:
        questions.forEach((q, index) => {
          if (!q.words || q.words.length < 3) {
            throw new BadRequestException(`Crossword ${index + 1} must have at least 3 words`);
          }
          q.words.forEach((word: any, wIndex: number) => {
            if (!word.answer || word.answer.length === 0) {
              throw new BadRequestException(`Crossword ${index + 1}, Word ${wIndex + 1}: Must have an answer`);
            }
            if (!word.clue) {
              throw new BadRequestException(`Crossword ${index + 1}, Word ${wIndex + 1}: Must have a clue`);
            }
          });
        });
        break;

      case TemplateTypes.MCQ:
      default:
        // Standard MCQ validation
        questions.forEach((q, index) => {
          if (!q.prompt) {
            throw new BadRequestException(`Question ${index + 1} is missing a prompt`);
          }
          if (!q.answers || q.answers.length < 2) {
            throw new BadRequestException(`Question ${index + 1} must have at least 2 answers`);
          }
          const correctCount = q.answers.filter((a: any) => a.isCorrect).length;
          if (correctCount === 0) {
            throw new BadRequestException(`Question ${index + 1} must have a correct answer`);
          }
          if (!q.allowMultiple && correctCount > 1) {
            throw new BadRequestException(`Question ${index + 1} must have only one correct answer`);
          }
        });
        break;
    }
  }

  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  create(data: {
    templateId: string;
    ownerId: string;
    title: string;
    description?: string;
    templateType?: string;
    settings?: Record<string, unknown>;
    questions?: Array<any>;
    backgroundImageUrl?: string;
  }) {
    if (!data.templateId || !data.ownerId || !data.title) {
      throw new BadRequestException("Missing required game fields");
    }
    if (!data.questions || data.questions.length === 0) {
      throw new BadRequestException("At least one question is required");
    }
    if (data.questions.length > 50) {
      throw new BadRequestException("A game can have up to 50 questions");
    }

    // Validate template-specific configuration
    const templateType = data.templateType || TemplateTypes.MCQ;
    this.validateTemplateConfig(templateType, data.questions);

    const game = this.gamesRepo.create({
      templateId: data.templateId,
      ownerId: data.ownerId,
      title: data.title,
      description: data.description,
      settings: data.settings ?? {},
      isPublished: true,
      backgroundImageUrl: data.backgroundImageUrl,
      questions: (data.questions ?? []).map((question) => {
        const q = new GameQuestion();
        q.id = this.isValidUUID(question.id) ? question.id : randomUUID();
        q.prompt = question.prompt;
        q.explanation = question.explanation;
        q.points = question.points ?? 10;
        q.allowMultiple = question.allowMultiple ?? false;
        
        q.dragItems = question.dragItems;
        q.dropZones = question.dropZones;
        q.crosswordGrid = question.crosswordGrid;
        q.clues = question.clues;
        q.imageUrl = question.imageUrl;
        q.cardFront = question.cardFront;
        q.cardBack = question.cardBack;
        q.backgroundImageUrl = question.backgroundImageUrl;

        q.answers = (question.answers || []).map((answer: any) => {
          const a = new GameAnswer();
          a.id = this.isValidUUID(answer.id) ? answer.id : randomUUID();
          a.text = answer.text;
          a.isCorrect = answer.isCorrect;
          return a;
        });
        q.hints = (question.hints ?? []).map((hint: any) => {
          const h = new GameHint();
          h.id = this.isValidUUID(hint.id) ? hint.id : randomUUID();
          h.text = hint.text;
          h.penalty = hint.penalty ?? 2;
          return h;
        });
        return q;
      })
    });
    return this.gamesRepo.save(game);
  }

  findAll(ownerId?: string) {
    const where = ownerId ? { ownerId } : {};
    return this.gamesRepo.find({ where, relations: ["questions", "questions.answers", "questions.hints"], order: { createdAt: "DESC" } });
  }

  async findOne(id: string) {
    const game = await this.gamesRepo.findOne({
      where: { id },
      relations: ["questions", "questions.answers", "questions.hints"]
    });
    if (!game) throw new NotFoundException("Game not found");
    return game;
  }

  async update(id: string, data: any) {
    if (data.questions) {
      // 1. Fetch existing game with all nested relations
      const existingGame = await this.gamesRepo.findOne({
        where: { id },
        relations: ["questions", "questions.answers", "questions.hints"]
      });
      
      if (!existingGame) throw new NotFoundException("Game not found");

      // 2. Identify and delete orphans manually
      // Questions
      const incomingQuestionIds = data.questions.filter((q: any) => this.isValidUUID(q.id)).map((q: any) => q.id);
      const questionsToDelete = existingGame.questions.filter(q => !incomingQuestionIds.includes(q.id));
      
      if (questionsToDelete.length > 0) {
        const qIds = questionsToDelete.map(q => q.id);
        // Delete answers and hints for these questions first
        await this.gamesRepo.manager.delete(GameAnswer, { question: { id: In(qIds) } });
        await this.gamesRepo.manager.delete(GameHint, { question: { id: In(qIds) } });
        await this.gamesRepo.manager.delete(GameQuestion, { id: In(qIds) });
      }

      // Answers and Hints for kept questions
      for (const qData of data.questions) {
        if (!this.isValidUUID(qData.id)) continue; // New question, no existing orphans
        
        const existingQuestion = existingGame.questions.find(q => q.id === qData.id);
        if (!existingQuestion) continue;

        // Answers
        if (qData.answers) {
          const incomingAnswerIds = qData.answers.filter((a: any) => this.isValidUUID(a.id)).map((a: any) => a.id);
          const answersToDelete = existingQuestion.answers.filter(a => !incomingAnswerIds.includes(a.id));
          if (answersToDelete.length > 0) {
            await this.gamesRepo.manager.delete(GameAnswer, { id: In(answersToDelete.map(a => a.id)) });
          }
        }

        // Hints
        if (qData.hints) {
          const incomingHintIds = qData.hints.filter((h: any) => this.isValidUUID(h.id)).map((h: any) => h.id);
          const hintsToDelete = existingQuestion.hints.filter(h => !incomingHintIds.includes(h.id));
          if (hintsToDelete.length > 0) {
            await this.gamesRepo.manager.delete(GameHint, { id: In(hintsToDelete.map(h => h.id)) });
          }
        }
      }

      // 3. Map new data for save
      const questions = data.questions.map((qData: any) => {
        const q = new GameQuestion();
        q.id = this.isValidUUID(qData.id) ? qData.id : randomUUID();
        q.prompt = qData.prompt;
        q.explanation = qData.explanation;
        q.points = qData.points ?? 10;
        q.allowMultiple = qData.allowMultiple ?? false;

        // Map new fields
        q.dragItems = qData.dragItems;
        q.dropZones = qData.dropZones;
        q.crosswordGrid = qData.crosswordGrid;
        q.clues = qData.clues;
        q.imageUrl = qData.imageUrl;
        q.cardFront = qData.cardFront;
        q.cardBack = qData.cardBack;
        q.backgroundImageUrl = qData.backgroundImageUrl;

        if (qData.answers) {
          q.answers = qData.answers.map((aData: any) => {
            const a = new GameAnswer();
            a.id = this.isValidUUID(aData.id) ? aData.id : randomUUID();
            a.text = aData.text;
            a.isCorrect = aData.isCorrect;
            return a;
          });
        }

        if (qData.hints) {
          q.hints = qData.hints.map((hData: any) => {
            const h = new GameHint();
            h.id = this.isValidUUID(hData.id) ? hData.id : randomUUID();
            h.text = hData.text;
            h.penalty = hData.penalty ?? 2;
            return h;
          });
        }

        return q;
      });

      const game = await this.gamesRepo.preload({
        id,
        ...data,
        questions
      });

      if (!game) throw new NotFoundException("Game not found");
      return this.gamesRepo.save(game);
    }

    await this.gamesRepo.update({ id }, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.gamesRepo.delete({ id });
    return { success: true };
  }

  async duplicate(id: string, title?: string) {
    const game = await this.findOne(id);
    const copy = this.gamesRepo.create({
      templateId: game.templateId,
      ownerId: game.ownerId,
      title: title ?? `${game.title} (Copy)`,
      description: game.description,
      settings: game.settings,
      isPublished: false,
      questions: game.questions.map((question) => {
        const q = new GameQuestion();
        q.prompt = question.prompt;
        q.explanation = question.explanation;
        q.points = question.points;
        q.answers = question.answers.map((answer) => {
          const a = new GameAnswer();
          a.text = answer.text;
          a.isCorrect = answer.isCorrect;
          return a;
        });
        q.hints = question.hints.map((hint) => {
          const h = new GameHint();
          h.text = hint.text;
          h.penalty = hint.penalty;
          return h;
        });
        return q;
      })
    });
    return this.gamesRepo.save(copy);
  }

  assign(data: { gameId: string; groupId: string; startsAt?: string; dueAt?: string }) {
    const assignment = this.assignmentsRepo.create({
      id: randomUUID(),
      gameId: data.gameId,
      groupId: data.groupId,
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      dueAt: data.dueAt ? new Date(data.dueAt) : undefined
    });
    return this.assignmentsRepo.save(assignment);
  }

  async removeAssignment(id: string) {
    const result = await this.assignmentsRepo.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException("Assignment not found");
    }
    return { success: true };
  }
}
