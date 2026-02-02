import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { QuestionBankService } from "./question-bank.service";
import { Roles as RoleConstants } from "@nursequest/shared";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("question-bank")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleConstants.Admin, RoleConstants.Educator)
export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  @Post()
  create(
    @Request() req: { user: { userId: string } },
    @Body() body: { prompt: string; answers: any[]; hints?: any[]; explanation?: string; topic?: string; tags?: string[] }
  ) {
    return this.questionBankService.create({
      ownerId: req.user.userId,
      prompt: body.prompt,
      topic: body.topic,
      tags: body.tags ?? [],
      answers: body.answers,
      hints: body.hints ?? [],
      explanation: body.explanation
    });
  }

  @Get()
  findAll(@Request() req: { user: { userId: string; role: string } }) {
    if (req.user.role === RoleConstants.Admin) {
      return this.questionBankService.findAll();
    }
    return this.questionBankService.findByOwner(req.user.userId);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: Partial<{ prompt: string; answers: any[]; hints: any[]; explanation: string }>) {
    return this.questionBankService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.questionBankService.remove(id);
  }
}
