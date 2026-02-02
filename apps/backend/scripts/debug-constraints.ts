import "reflect-metadata";
import { DataSource } from "typeorm";
import { databaseConfig } from "../src/config/database.config";

const config = {
  ...databaseConfig,
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "FZrSJq7579827",
  database: "nursequest"
};

const AppDataSource = new DataSource(config as any);

async function checkConstraints() {
  await AppDataSource.initialize();
  const runner = AppDataSource.createQueryRunner();
  const table = await runner.getTable("templates");
  console.log("Indices on 'templates':");
  table?.indices.forEach(idx => {
    console.log(`- ${idx.name} (${idx.columnNames.join(", ")}): Unique=${idx.isUnique}`);
  });
  console.log("Uniques on 'templates':");
  table?.uniques.forEach(uq => {
    console.log(`- ${uq.name} (${uq.columnNames.join(", ")})`);
  });
  await AppDataSource.destroy();
}

checkConstraints().catch(console.error);
