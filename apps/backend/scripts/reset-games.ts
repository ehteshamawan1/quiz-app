import "reflect-metadata";
import { DataSource } from "typeorm";
import { databaseConfig } from "../src/config/database.config";
import { Game } from "../src/modules/games/entities/game.entity";
import { GameQuestion } from "../src/modules/games/entities/game-question.entity";
import { GameAnswer } from "../src/modules/games/entities/game-answer.entity";
import { GameHint } from "../src/modules/games/entities/game-hint.entity";
import { GameAssignment } from "../src/modules/games/entities/game-assignment.entity";

const AppDataSource = new DataSource({
  ...databaseConfig,
  entities: [Game, GameQuestion, GameAnswer, GameHint, GameAssignment]
});

async function reset() {
  console.log("🗑️ Resetting games...");

  await AppDataSource.initialize();
  console.log("✅ Database connected");

  const gameRepo = AppDataSource.getRepository(Game);
  
  // Due to foreign keys, we might need to delete in order or use cascade.
  // Game entity has cascade: true for questions, so deleting game should remove questions, answers, hints.
  // Assignments might restrict deletion if not cascaded.
  // Let's try deleting all games.

  const answerRepo = AppDataSource.getRepository(GameAnswer);
  const hintRepo = AppDataSource.getRepository(GameHint);
  const questionRepo = AppDataSource.getRepository(GameQuestion);
  const assignmentRepo = AppDataSource.getRepository(GameAssignment);
  
  console.log("Deleting answers...");
  await answerRepo.createQueryBuilder().delete().execute();
  
  console.log("Deleting hints...");
  await hintRepo.createQueryBuilder().delete().execute();
  
  console.log("Deleting questions...");
  await questionRepo.createQueryBuilder().delete().execute();
  
  console.log("Deleting assignments...");
  await assignmentRepo.createQueryBuilder().delete().execute();

  console.log("Deleting games...");
  await gameRepo.createQueryBuilder().delete().execute();
  
  console.log("✅ All games deleted");

  await AppDataSource.destroy();
}

reset().catch((error) => {
  console.error("❌ Reset failed:", error);
  process.exit(1);
});
