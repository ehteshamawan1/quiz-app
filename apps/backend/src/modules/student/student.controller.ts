import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { StudentService } from "./student.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Roles as RoleConstants } from "@nursequest/shared";

@Controller("student")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleConstants.Student)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get("dashboard")
  async getDashboard(@Request() req: { user: { userId: string } }) {
    return this.studentService.getDashboardOverview(req.user.userId);
  }

  @Get("assigned-games")
  async getAssignedGames(@Request() req: { user: { userId: string } }) {
    return this.studentService.getAssignedGames(req.user.userId);
  }

  @Get("profile")
  async getProfile(@Request() req: { user: { userId: string } }) {
    return this.studentService.getProfile(req.user.userId);
  }

  @Get("score-history")
  async getScoreHistory(@Request() req: { user: { userId: string } }) {
    return this.studentService.getScoreHistory(req.user.userId);
  }
}
