import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GamesController } from "./games.controller";
import { GamesService } from "./games.service";
import { Game } from "./entities/game.entity";
import { GameQuestion } from "./entities/game-question.entity";
import { GameAnswer } from "./entities/game-answer.entity";
import { GameHint } from "./entities/game-hint.entity";
import { GameAssignment } from "./entities/game-assignment.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Game, GameQuestion, GameAnswer, GameHint, GameAssignment])],
  controllers: [GamesController],
  providers: [GamesService]
})
export class GamesModule {}
