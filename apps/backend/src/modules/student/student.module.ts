import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StudentController } from "./student.controller";
import { StudentService } from "./student.service";
import { UserGroupMembership } from "../gameplay/entities/user-group-membership.entity";
import { GameAssignment } from "../games/entities/game-assignment.entity";
import { GameSession } from "../gameplay/entities/game-session.entity";
import { Game } from "../games/entities/game.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserGroupMembership,
      GameAssignment,
      GameSession,
      Game
    ])
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService]
})
export class StudentModule {}
