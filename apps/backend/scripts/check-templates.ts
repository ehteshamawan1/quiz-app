import "reflect-metadata";
import { DataSource } from "typeorm";
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

async function check() {
  await AppDataSource.initialize();
  const templates = await AppDataSource.getRepository(Template).find();
  console.log("Current Templates:");
  templates.forEach(t => console.log(`- ${t.name} (${t.type})`));
  await AppDataSource.destroy();
}

check().catch(console.error);
