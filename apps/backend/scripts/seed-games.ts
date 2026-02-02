import "reflect-metadata";
import { DataSource } from "typeorm";
import { randomUUID } from "crypto";
import { databaseConfig } from "../src/config/database.config";
import { Template } from "../src/modules/templates/entities/template.entity";
import { Game } from "../src/modules/games/entities/game.entity";
import { GameQuestion } from "../src/modules/games/entities/game-question.entity";
import { GameAnswer } from "../src/modules/games/entities/game-answer.entity";
import { GameHint } from "../src/modules/games/entities/game-hint.entity";
import { GameAssignment } from "../src/modules/games/entities/game-assignment.entity";
import { User } from "../src/modules/users/entities/user.entity";

const config = {
  ...databaseConfig,
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "FZrSJq7579827",
  database: "nursequest",
  entities: [Template, Game, GameQuestion, GameAnswer, GameHint, GameAssignment, User]
};

const AppDataSource = new DataSource(config as any);

async function seed() {
  console.log("🌱 Starting game seeding...");

  await AppDataSource.initialize();
  console.log("✅ Database connected");

  const templateRepo = AppDataSource.getRepository(Template);
  const gameRepo = AppDataSource.getRepository(Game);
  const userRepo = AppDataSource.getRepository(User);

  const templates = await templateRepo.find();
  if (templates.length === 0) {
    console.error("❌ No templates found. Please run template seeding first.");
    await AppDataSource.destroy();
    return;
  }

  const educator = await userRepo.findOne({ where: { username: "educator1" } });
  if (!educator) {
    console.error("❌ Educator user not found. Please run user seeding first.");
    await AppDataSource.destroy();
    return;
  }

  for (const template of templates) {
    const gameTitle = `Demo ${template.name}`;
    const existingGame = await gameRepo.findOne({ where: { title: gameTitle, ownerId: educator.id } });
    
    if (existingGame) {
      console.log(`Game exists: ${gameTitle}`);
      continue;
    }

    console.log(`Creating game: ${gameTitle}`);
    const game = new Game();
    game.id = randomUUID();
    game.templateId = template.id;
    game.ownerId = educator.id;
    game.title = gameTitle;
    game.description = `A sample game using the ${template.name} template.`;
    game.isPublished = true;
    game.settings = {
      timeLimitMinutes: 10,
      passingScore: 70,
      randomizeQuestions: true,
      randomizeAnswers: true,
      reviewAfterSubmission: true
    };
    
    // Create sample questions based on template type
    const question = new GameQuestion();
    question.id = randomUUID();
    question.gameId = game.id;
    question.prompt = "Sample Question 1";
    question.points = 10;
    
    // Add dummy answers/config based on type just so it's valid
    const answer1 = new GameAnswer();
    answer1.id = randomUUID();
    answer1.text = "Answer A";
    answer1.isCorrect = true;
    
    const answer2 = new GameAnswer();
    answer2.id = randomUUID();
    answer2.text = "Answer B";
    answer2.isCorrect = false;

    question.answers = [answer1, answer2];
    
    game.questions = [question];
    await gameRepo.save(game);
  }

  console.log("✅ Game seeding complete");

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
