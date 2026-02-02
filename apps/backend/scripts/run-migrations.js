const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const migrationsDir = path.join(__dirname, "../src/database/migrations");
const dbPassword = process.env.DATABASE_PASSWORD || "FZrSJq7579827";
const dbName = process.env.DATABASE_NAME || "nursequest";
const dbUrl = process.env.DATABASE_URL || `postgres://postgres:${dbPassword}@localhost:5432/${dbName}`;

const migrations = [
  "001_create_core_tables.sql",
  "002_phase2_tables.sql",
  "003_question_bank.sql",
  "004_system_settings.sql",
  "006_phase2_alterations.sql",
  "007_game_question_multi.sql",
  "008_phase3_gameplay.sql",
  "009_template_types_data.sql",
  "010_drag_drop_fields.sql",
  "011_word_cross_fields.sql",
  "012_flashcard_fields.sql",
  "013_add_background_images.sql",
  "014_add_unique_constraint_templates.sql"
];

async function runMigration(filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(migrationsDir, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${filename} (file not found)`);
      return resolve();
    }
    const cmd = `psql "${dbUrl}" -f "${filePath}"`;
    console.log(`📝 Running migration: ${filename}`);
    exec(cmd, { env: { ...process.env, PGPASSWORD: dbPassword } }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error in ${filename}:`, stderr || error.message);
        return reject(error);
      }
      console.log(`✅ Completed: ${filename}`);
      resolve();
    });
  });
}

async function runAllMigrations() {
  console.log("🚀 Starting database migrations...\n");
  for (const migration of migrations) {
    try {
      await runMigration(migration);
    } catch (error) {
      console.error(`\n❌ Migration failed at: ${migration}`);
      process.exit(1);
    }
  }
  console.log("\n✅ All migrations completed successfully!");
}

runAllMigrations();
