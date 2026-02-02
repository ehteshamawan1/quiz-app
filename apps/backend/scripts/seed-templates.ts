import "reflect-metadata";
import { DataSource } from "typeorm";
import { randomUUID } from "crypto";
import { databaseConfig } from "../src/config/database.config";
import { Template } from "../src/modules/templates/entities/template.entity";

const config = {
  ...databaseConfig,
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "FZrSJq7579827",
  database: "nursequest",
  entities: [Template]
};

const AppDataSource = new DataSource(config as any);

async function seed() {
  console.log("🌱 Starting template seeding...");

  await AppDataSource.initialize();
  console.log("✅ Database connected");

  const templateRepo = AppDataSource.getRepository(Template);
  const templates = [
    {
      name: "Multiple Choice Quiz",
      type: "mcq",
      description: "Standard multiple choice questions with one correct answer.",
      isPublished: true,
      isFeatured: true,
      category: "Assessment",
      difficulty: "All Levels"
    },
    {
      name: "Hint Discovery",
      type: "hint_discovery",
      description: "Players reveal hints to answer questions. Fewer hints = more points.",
      isPublished: true,
      isFeatured: true,
      category: "Gamified",
      difficulty: "Intermediate"
    },
    {
      name: "Timed Challenge",
      type: "timed_quiz",
      description: "Answer as many questions as possible within the time limit.",
      isPublished: true,
      isFeatured: false,
      category: "Speed",
      difficulty: "Advanced"
    },
    {
      name: "Flashcards",
      type: "flashcards",
      description: "Study tool for memorization and quick review.",
      isPublished: true,
      isFeatured: true,
      category: "Study",
      difficulty: "Beginner"
    },
    {
      name: "Drag & Drop",
      type: "drag_drop",
      description: "Match items or order sequences visually.",
      isPublished: true,
      isFeatured: true,
      category: "Interactive",
      difficulty: "Intermediate"
    },
    {
      name: "Word Cross",
      type: "word_cross",
      description: "Solve crossword puzzles with medical terminology.",
      isPublished: true,
      isFeatured: false,
      category: "Vocabulary",
      difficulty: "Advanced"
    }
  ];

  for (const tpl of templates) {
    const existing = await templateRepo.findOne({ where: { type: tpl.type } });
    if (!existing) {
      console.log(`Creating template: ${tpl.name}`);
      await templateRepo.save({ ...tpl, id: randomUUID() });
    } else {
      console.log(`Template exists: ${tpl.name}`);
    }
  }

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
