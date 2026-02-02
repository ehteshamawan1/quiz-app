import { Body, Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { GameplayService } from "./gameplay.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Roles as RoleConstants } from "@nursequest/shared";
import { StartSessionDto } from "./dto/start-session.dto";
import { SubmitAnswerDto } from "./dto/submit-answer.dto";
import { RevealHintDto } from "./dto/reveal-hint.dto";
import { CompleteSessionDto } from "./dto/complete-session.dto";

@Controller("gameplay")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleConstants.Student)
export class GameplayController {
  constructor(private readonly gameplayService: GameplayService) {}

  @Post("sessions/start")
  async startSession(
    @Request() req: { user: { userId: string } },
    @Body() dto: StartSessionDto
  ) {
    return this.gameplayService.startSession(
      req.user.userId,
      dto.gameId,
      dto.assignmentId
    );
  }

  @Get("sessions/:id")
  async getSession(
    @Request() req: { user: { userId: string } },
    @Param("id") sessionId: string
  ) {
    return this.gameplayService.getSession(sessionId, req.user.userId);
  }

  @Get("sessions/:id/game")
  async getGameForSession(
    @Request() req: { user: { userId: string } },
    @Param("id") sessionId: string
  ) {
    return this.gameplayService.getGameForSession(sessionId, req.user.userId);
  }

  @Get("sessions/:id/current-question")
  async getCurrentQuestion(
    @Request() req: { user: { userId: string } },
    @Param("id") sessionId: string
  ) {
    return this.gameplayService.getCurrentQuestion(sessionId, req.user.userId);
  }

  @Post("hints/reveal")
  async revealHint(
    @Request() req: { user: { userId: string } },
    @Body() dto: RevealHintDto
  ) {
    return this.gameplayService.revealHint(
      dto.sessionId,
      dto.questionId,
      dto.hintId,
      req.user.userId
    );
  }

  @Post("answers/submit")
  async submitAnswer(
    @Request() req: { user: { userId: string } },
    @Body() dto: SubmitAnswerDto
  ) {
    return this.gameplayService.submitAnswer(
      dto.sessionId,
      dto.questionId,
      dto.selectedAnswerIds,
      dto.timeSpentSeconds,
      req.user.userId
    );
  }

  @Post("sessions/complete")
  async completeSession(
    @Request() req: { user: { userId: string } },
    @Body() dto: CompleteSessionDto
  ) {
    return this.gameplayService.completeSession(
      dto.sessionId,
      dto.totalTimeSpentSeconds,
      req.user.userId
    );
  }

  @Get("sessions/:id/results")
  async getResults(
    @Request() req: { user: { userId: string } },
    @Param("id") sessionId: string
  ) {
    return this.gameplayService.getSessionResults(sessionId, req.user.userId);
  }
}
