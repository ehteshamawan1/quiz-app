import "reflect-metadata";
import { DataSource } from "typeorm";
import { randomUUID } from "crypto";
import * as bcrypt from "bcrypt";
import { databaseConfig } from "../src/config/database.config";
import { User } from "../src/modules/users/entities/user.entity";
import { College } from "../src/modules/colleges/entities/college.entity";

const AppDataSource = new DataSource({
  ...databaseConfig,
  entities: [User, College]
});

async function seed() {
  console.log("🌱 Starting database seeding...\n");

  await AppDataSource.initialize();
  console.log("✅ Database connected\n");

  const collegeRepo = AppDataSource.getRepository(College);
  const userRepo = AppDataSource.getRepository(User);

  console.log("📝 Seeding colleges...");
  const colleges = await collegeRepo.save([
    { id: randomUUID(), name: "NurseQuest Demo College", isActive: true },
    { id: randomUUID(), name: "Metro Health Nursing Institute", isActive: true }
  ]);
  console.log(`✅ Created ${colleges.length} colleges\n`);

  console.log("📝 Seeding users...");
  const passwordHash = await bcrypt.hash("admin123", 10);

  const users = await userRepo.save([
    {
      id: randomUUID(),
      username: "admin",
      email: "admin@nursequest.local",
      passwordHash,
      role: "admin",
      isActive: true
    },
    {
      id: randomUUID(),
      username: "educator1",
      email: "educator1@nursequest.local",
      passwordHash: await bcrypt.hash("educator123", 10),
      role: "educator",
      collegeId: colleges[0].id,
      isActive: true
    },
    {
      id: randomUUID(),
      username: "student1",
      email: "student1@nursequest.local",
      passwordHash: await bcrypt.hash("student123", 10),
      role: "student",
      collegeId: colleges[0].id,
      isActive: true
    }
  ]);
  console.log(`✅ Created ${users.length} users\n`);

  console.log("✅ Database seeding completed!");
  console.log("\n📌 Default credentials:");
  console.log("   Admin: username=admin, password=admin123");
  console.log("   Educator: username=educator1, password=educator123");
  console.log("   Student: username=student1, password=student123\n");

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
