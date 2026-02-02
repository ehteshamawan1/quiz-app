import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { GameSession } from "../gameplay/entities/game-session.entity";
import { QuestionAttempt } from "../gameplay/entities/question-attempt.entity";
import { HintUsage } from "../gameplay/entities/hint-usage.entity";
import { Game } from "../games/entities/game.entity";
import { GameQuestion } from "../games/entities/game-question.entity";
import { GameAssignment } from "../games/entities/game-assignment.entity";
import { User } from "../users/entities/user.entity";
import { UserGroupMembership } from "../gameplay/entities/user-group-membership.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GameSession,
      QuestionAttempt,
      HintUsage,
      Game,
      GameQuestion,
      GameAssignment,
      User,
      UserGroupMembership
    ])
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService]
})
export class AnalyticsModule {}
