import { Controller, Get, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Roles as RoleConstants } from "@nursequest/shared";
import { User } from "../users/entities/user.entity";
import { College } from "../colleges/entities/college.entity";
import { Template } from "../templates/entities/template.entity";
import { Game } from "../games/entities/game.entity";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleConstants.Admin)
export class AdminController {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(College) private readonly collegesRepo: Repository<College>,
    @InjectRepository(Template) private readonly templatesRepo: Repository<Template>,
    @InjectRepository(Game) private readonly gamesRepo: Repository<Game>
  ) {}

  @Get("overview")
  async overview() {
    const [users, colleges, templates, games] = await Promise.all([
      this.usersRepo.count(),
      this.collegesRepo.count(),
      this.templatesRepo.count(),
      this.gamesRepo.count()
    ]);
    return { users, colleges, templates, games };
  }
}
