const { exec } = require("child_process");

const dbPassword = process.env.DATABASE_PASSWORD || "FZrSJq7579827";

async function verifyPostgresConnection() {
  return new Promise((resolve) => {
    const cmd = `psql -U postgres -h localhost -c "SELECT version();" postgres`;
    console.log("🔍 Verifying PostgreSQL connection...");

    exec(cmd, { env: { ...process.env, PGPASSWORD: dbPassword } }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Cannot connect to PostgreSQL:`, stderr || error.message);
        console.log("\n📌 Make sure PostgreSQL is running:");
        console.log("   - Check Windows Services for PostgreSQL");
        console.log("   - Or run: pg_ctl status\n");
        return resolve(false);
      }
      console.log(`✅ PostgreSQL connection verified!`);
      resolve(true);
    });
  });
}

async function checkDatabaseExists() {
  return new Promise((resolve) => {
    const cmd = `psql -U postgres -h localhost -c "SELECT 1 FROM pg_database WHERE datname='nursequest';" postgres`;

    exec(cmd, { env: { ...process.env, PGPASSWORD: dbPassword } }, (error, stdout) => {
      if (error || !stdout.includes("1 row")) {
        console.log("ℹ️  Database 'nursequest' does not exist yet.");
        return resolve(false);
      }
      console.log("✅ Database 'nursequest' exists.");
      resolve(true);
    });
  });
}

async function main() {
  console.log("🚀 NurseQuest Database Setup Verification\n");

  const connected = await verifyPostgresConnection();
  if (!connected) {
    console.log("\n❌ Setup cannot continue without PostgreSQL connection.");
    console.log("   Please ensure PostgreSQL is running with password: FZrSJq7579827\n");
    process.exit(1);
  }

  const dbExists = await checkDatabaseExists();

  console.log("\n✅ Verification complete!");
  console.log("\n📌 Next steps:");
  if (!dbExists) {
    console.log("   Run: npm run db:setup");
  } else {
    console.log("   Database exists. Run: npm run dev");
  }
  console.log("");
}

main();
