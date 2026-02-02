import "reflect-metadata";
import { DataSource, In } from "typeorm";
import { databaseConfig } from "../src/config/database.config";
import { Template } from "../src/modules/templates/entities/template.entity";
import { Game } from "../src/modules/games/entities/game.entity";
import { GameQuestion } from "../src/modules/games/entities/game-question.entity";
import { GameAnswer } from "../src/modules/games/entities/game-answer.entity";
import { GameHint } from "../src/modules/games/entities/game-hint.entity";
import { GameAssignment } from "../src/modules/games/entities/game-assignment.entity";
import { User } from "../src/modules/users/entities/user.entity";
import { College } from "../src/modules/colleges/entities/college.entity";
import { PasswordReset } from "../src/modules/auth/entities/password-reset.entity";
import { Group } from "../src/modules/groups/entities/group.entity";
import { QuestionBankItem } from "../src/modules/question-bank/entities/question-bank.entity";
import { SystemSetting } from "../src/modules/settings/entities/system-setting.entity";
import { GameSession } from "../src/modules/gameplay/entities/game-session.entity";
import { QuestionAttempt } from "../src/modules/gameplay/entities/question-attempt.entity";
import { HintUsage } from "../src/modules/gameplay/entities/hint-usage.entity";
import { UserGroupMembership } from "../src/modules/gameplay/entities/user-group-membership.entity";
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.development for local development
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  const envPath = path.resolve(__dirname, '../../.env.development'); // Adjusted path
  dotenv.config({ path: envPath });
  console.log(`[cleanup] Loaded environment from ${envPath}`);
}

const config = {
  ...databaseConfig,
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "FZrSJq7579827",
  database: "nursequest",
  entities: [
    Template,
    Game,
    GameQuestion,
    GameAnswer,
    GameHint,
    GameAssignment,
    User,
    College,
    PasswordReset,
    Group,
    QuestionBankItem,
    SystemSetting,
    GameSession,
    QuestionAttempt,
    HintUsage,
    UserGroupMembership
  ]
};

const AppDataSource = new DataSource(config as any);

async function cleanup() {
  console.log("🧹 Starting database cleanup for duplicates...");

  await AppDataSource.initialize();
  console.log("✅ Database connected");

  const templateRepo = AppDataSource.getRepository(Template);
  const gameRepo = AppDataSource.getRepository(Game);

  // 1. Fetch all templates
  const allTemplates = await templateRepo.find();
  console.log(`Found ${allTemplates.length} templates in total.`);

  // 2. Group by type
  const templatesByType: Record<string, Template[]> = {};
  allTemplates.forEach(t => {
    if (!templatesByType[t.type]) {
      templatesByType[t.type] = [];
    }
    templatesByType[t.type].push(t);
  });

  // 3. Identify duplicates
  let deletedTemplatesCount = 0;
  let deletedGamesCount = 0;

  for (const type in templatesByType) {
    const templates = templatesByType[type];
    if (templates.length > 1) {
      console.log(`Found ${templates.length} templates of type '${type}'. Keeping the first one.`);
      
      // Keep the first one, delete the rest
      const [keep, ...duplicates] = templates;
      
      const duplicateIds = duplicates.map(d => d.id);
      
      // Find games associated with duplicates
      const gamesToDelete = await gameRepo.find({
        where: { templateId: In(duplicateIds) }
      });
      
      if (gamesToDelete.length > 0) {
        console.log(`  Deleting ${gamesToDelete.length} games associated with duplicate templates...`);
        const gameIds = gamesToDelete.map(g => g.id);

        // Delete Assignments
        await AppDataSource.getRepository(GameAssignment).delete({ gameId: In(gameIds) });

        // Find Questions to get their IDs for deeper cleanup
        const questions = await AppDataSource.getRepository(GameQuestion).find({ where: { gameId: In(gameIds) } });
        const questionIds = questions.map(q => q.id);

        if (questionIds.length > 0) {
           // Delete Answers & Hints
           await AppDataSource.getRepository(GameAnswer).delete({ question: { id: In(questionIds) } });
           await AppDataSource.getRepository(GameHint).delete({ question: { id: In(questionIds) } });
           // Delete Questions
           await AppDataSource.getRepository(GameQuestion).delete({ id: In(questionIds) });
        }

        // Finally delete Games
        await gameRepo.remove(gamesToDelete);
        deletedGamesCount += gamesToDelete.length;
      }

      console.log(`  Deleting ${duplicates.length} duplicate templates...`);
      await templateRepo.remove(duplicates);
      deletedTemplatesCount += duplicates.length;
    }
  }

  console.log("------------------------------------------------");
  console.log(`🎉 Cleanup complete!`);
  console.log(`Removed ${deletedTemplatesCount} duplicate templates.`);
  console.log(`Removed ${deletedGamesCount} duplicate games.`);
  
  const finalTemplateCount = await templateRepo.count();
  const finalGameCount = await gameRepo.count();
  console.log(`Final Counts -> Templates: ${finalTemplateCount}, Games: ${finalGameCount}`);

  await AppDataSource.destroy();
}

cleanup().catch((error) => {
  console.error("❌ Cleanup failed:", error);
  process.exit(1);
});
