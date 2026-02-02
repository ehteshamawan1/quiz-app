const { exec } = require("child_process");

const dbPassword = process.env.DATABASE_PASSWORD || "FZrSJq7579827";
const dbName = process.env.DATABASE_NAME || "nursequest";

async function createDatabase() {
  return new Promise((resolve, reject) => {
    const cmd = `psql -U postgres -h localhost -c "CREATE DATABASE ${dbName};" postgres`;
    console.log(`🔧 Creating database: ${dbName}...`);

    const childProcess = exec(cmd, { env: { ...process.env, PGPASSWORD: dbPassword } }, (error, stdout, stderr) => {
      if (error) {
        // Check if database already exists
        if (stderr.includes("already exists") || error.message.includes("already exists")) {
          console.log(`ℹ️  Database '${dbName}' already exists, skipping creation.`);
          return resolve();
        }
        console.error(`❌ Error creating database:`, stderr || error.message);
        return reject(error);
      }
      console.log(`✅ Database '${dbName}' created successfully!`);
      resolve();
    });
  });
}

createDatabase().catch((error) => {
  console.error("❌ Failed to create database:", error.message);
  process.exit(1);
});
