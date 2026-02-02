import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Roles as RoleConstants } from "@nursequest/shared";
import { Game } from "../games/entities/game.entity";
import { Group } from "../groups/entities/group.entity";
import { GameAssignment } from "../games/entities/game-assignment.entity";
import { UsersService } from "../users/users.service";

@Controller("educator")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleConstants.Educator, RoleConstants.Admin)
export class EducatorController {
  constructor(
    @InjectRepository(Game) private readonly gamesRepo: Repository<Game>,
    @InjectRepository(Group) private readonly groupsRepo: Repository<Group>,
    @InjectRepository(GameAssignment) private readonly assignmentsRepo: Repository<GameAssignment>,
    private readonly usersService: UsersService
  ) {}

  @Get("overview")
  async overview(@Request() req: { user: { userId: string } }) {
    const user = await this.usersService.findById(req.user.userId);
    const games = await this.gamesRepo.count({ where: { ownerId: req.user.userId } });
    const groups = user?.collegeId
      ? await this.groupsRepo.count({ where: { collegeId: user.collegeId } })
      : 0;
    const assignments = await this.assignmentsRepo
      .createQueryBuilder("assignment")
      .innerJoin(Game, "game", "game.id = assignment.game_id")
      .where("game.owner_id = :ownerId", { ownerId: req.user.userId })
      .getCount();

    return { games, groups, assignments };
  }
}
