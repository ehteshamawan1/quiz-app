import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { GamesService } from "./games.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Roles as RoleConstants } from "@nursequest/shared";

@Controller("games")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleConstants.Admin, RoleConstants.Educator)
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post()
  create(@Request() req: { user: { userId: string } }, @Body() body: any) {
    return this.gamesService.create({ ...body, ownerId: req.user.userId });
  }

  @Get()
  findAll(@Request() req: { user: { userId: string; role: string } }) {
    if (req.user.role === RoleConstants.Admin) return this.gamesService.findAll();
    return this.gamesService.findAll(req.user.userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.gamesService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: any) {
    return this.gamesService.update(id, body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.gamesService.remove(id);
  }

  @Post("assign")
  assign(@Body() body: { gameId: string; groupId: string; startsAt?: string; dueAt?: string }) {
    return this.gamesService.assign(body);
  }

  @Delete("assignments/:id")
  removeAssignment(@Param("id") id: string) {
    return this.gamesService.removeAssignment(id);
  }

  @Post(":id/duplicate")
  duplicate(@Param("id") id: string, @Body() body: { title?: string }) {
    return this.gamesService.duplicate(id, body.title);
  }
}
