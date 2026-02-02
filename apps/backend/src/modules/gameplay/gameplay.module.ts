import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { GameplayController } from "./gameplay.controller";
import { GameplayService } from "./gameplay.service";
import { GameSession } from "./entities/game-session.entity";
import { QuestionAttempt } from "./entities/question-attempt.entity";
import { HintUsage } from "./entities/hint-usage.entity";
import { UserGroupMembership } from "./entities/user-group-membership.entity";
import { Game } from "../games/entities/game.entity";
import { GameQuestion } from "../games/entities/game-question.entity";
import { GameAnswer } from "../games/entities/game-answer.entity";
import { GameHint } from "../games/entities/game-hint.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GameSession,
      QuestionAttempt,
      HintUsage,
      UserGroupMembership,
      Game,
      GameQuestion,
      GameAnswer,
      GameHint
    ])
  ],
  controllers: [GameplayController],
  providers: [GameplayService],
  exports: [GameplayService]
})
export class GameplayModule {}
