import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { CollegesModule } from "./modules/colleges/colleges.module";
import { databaseConfig } from "./config/database.config";
import { User } from "./modules/users/entities/user.entity";
import { College } from "./modules/colleges/entities/college.entity";
import { PasswordReset } from "./modules/auth/entities/password-reset.entity";
import { TemplatesModule } from "./modules/templates/templates.module";
import { Template } from "./modules/templates/entities/template.entity";
import { GamesModule } from "./modules/games/games.module";
import { Game } from "./modules/games/entities/game.entity";
import { GameQuestion } from "./modules/games/entities/game-question.entity";
import { GameAnswer } from "./modules/games/entities/game-answer.entity";
import { GameHint } from "./modules/games/entities/game-hint.entity";
import { GameAssignment } from "./modules/games/entities/game-assignment.entity";
import { GroupsModule } from "./modules/groups/groups.module";
import { Group } from "./modules/groups/entities/group.entity";
import { QuestionBankModule } from "./modules/question-bank/question-bank.module";
import { QuestionBankItem } from "./modules/question-bank/entities/question-bank.entity";
import { SettingsModule } from "./modules/settings/settings.module";
import { SystemSetting } from "./modules/settings/entities/system-setting.entity";
import { AdminModule } from "./modules/admin/admin.module";
import { EducatorModule } from "./modules/educator/educator.module";
import { GameplayModule } from "./modules/gameplay/gameplay.module";
import { StudentModule } from "./modules/student/student.module";
import { GameSession } from "./modules/gameplay/entities/game-session.entity";
import { QuestionAttempt } from "./modules/gameplay/entities/question-attempt.entity";
import { HintUsage } from "./modules/gameplay/entities/hint-usage.entity";
import { UserGroupMembership } from "./modules/gameplay/entities/user-group-membership.entity";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { ExportModule } from "./modules/export/export.module";
import { UploadsModule } from "./modules/uploads/uploads.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...databaseConfig,
      entities: [
        User,
        College,
        PasswordReset,
        Template,
        Game,
        GameQuestion,
        GameAnswer,
        GameHint,
        GameAssignment,
        Group,
        QuestionBankItem,
        SystemSetting,
        GameSession,
        QuestionAttempt,
        HintUsage,
        UserGroupMembership
      ]
    }),
    AuthModule,
    UsersModule,
    CollegesModule,
    TemplatesModule,
    GamesModule,
    GroupsModule,
    QuestionBankModule,
    SettingsModule,
    AdminModule,
    EducatorModule,
    GameplayModule,
    StudentModule,
    AnalyticsModule,
    ExportModule,
    UploadsModule
  ]
})
export class AppModule {}
