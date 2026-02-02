import { Controller, Get, Param, Query, UseGuards, Request } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Roles as RoleConstants } from "@nursequest/shared";
import { AnalyticsService } from "./analytics.service";
import { GameAnalyticsDto, DateRangeDto } from "./dto/game-analytics.dto";
import { StudentAnalyticsDto } from "./dto/student-analytics.dto";

@Controller("analytics")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleConstants.Educator, RoleConstants.Admin)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("games/:gameId")
  async getGameAnalytics(
    @Param("gameId") gameId: string,
    @Query() dateRange: DateRangeDto,
    @Request() req: any
  ) {
    return this.analyticsService.getGameAnalytics(gameId, req.user.userId, dateRange);
  }

  @Get("students/:studentId")
  async getStudentPerformance(
    @Param("studentId") studentId: string,
    @Query() dateRange: DateRangeDto,
    @Request() req: any
  ) {
    return this.analyticsService.getStudentPerformance(studentId, req.user.userId, dateRange);
  }

  @Get("questions/:gameId/difficulty")
  async getQuestionDifficulty(
    @Param("gameId") gameId: string,
    @Request() req: any
  ) {
    return this.analyticsService.getQuestionDifficulty(gameId, req.user.userId);
  }

  @Get("overview")
  async getEducatorOverview(@Request() req: any) {
    return this.analyticsService.getEducatorOverview(req.user.userId);
  }

  @Get("trends/:gameId")
  async getScoreTrends(
    @Param("gameId") gameId: string,
    @Query() dateRange: DateRangeDto,
    @Request() req: any
  ) {
    return this.analyticsService.getScoreTrends(gameId, req.user.userId, dateRange);
  }

  @Get("assignments/:assignmentId")
  async getAssignmentAnalytics(
    @Param("assignmentId") assignmentId: string,
    @Request() req: any
  ) {
    return this.analyticsService.getAssignmentAnalytics(assignmentId, req.user.userId);
  }
}
