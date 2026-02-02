import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminController } from "./admin.controller";
import { User } from "../users/entities/user.entity";
import { College } from "../colleges/entities/college.entity";
import { Template } from "../templates/entities/template.entity";
import { Game } from "../games/entities/game.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, College, Template, Game])],
  controllers: [AdminController]
})
export class AdminModule {}
