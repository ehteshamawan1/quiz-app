import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EducatorController } from "./educator.controller";
import { Game } from "../games/entities/game.entity";
import { Group } from "../groups/entities/group.entity";
import { GameAssignment } from "../games/entities/game-assignment.entity";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [TypeOrmModule.forFeature([Game, Group, GameAssignment]), UsersModule],
  controllers: [EducatorController]
})
export class EducatorModule {}
