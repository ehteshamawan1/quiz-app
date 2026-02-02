import "reflect-metadata";
import { DataSource } from "typeorm";
import { databaseConfig } from "../src/config/database.config";
import { Game } from "../src/modules/games/entities/game.entity";
import { GameQuestion } from "../src/modules/games/entities/game-question.entity";

const config = {
  ...databaseConfig,
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "FZrSJq7579827",
  database: "nursequest",
  entities: [] // Empty entities list for raw SQL
};

const AppDataSource = new DataSource(config as any);

async function checkGame() {
  await AppDataSource.initialize();
  const id = "1e9aebc6-467f-494f-9db2-1f46ca668b88";
  
  const result = await AppDataSource.query(`SELECT id, title, background_image_url FROM games WHERE id = $1`, [id]);
  
  if (result.length > 0) {
    console.log("Game Found:", result[0]);
  } else {
    console.log("Game not found");
  }

  await AppDataSource.destroy();
}

checkGame().catch(console.error);
