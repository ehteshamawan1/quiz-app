const baseConfig = {
  type: "postgres" as const,
  synchronize: false,
  logging: false
};

const databaseUrl = process.env.DATABASE_URL;
const databaseHost = process.env.DATABASE_HOST;
const databasePort = process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : undefined;
const databaseUser = process.env.DATABASE_USER;
const databasePassword = process.env.DATABASE_PASSWORD;
const databaseName = process.env.DATABASE_NAME;

export const databaseConfig = databaseUrl
  ? {
      ...baseConfig,
      url: databaseUrl
    }
  : {
      ...baseConfig,
      host: databaseHost,
      port: databasePort,
      username: databaseUser,
      password: databasePassword,
      database: databaseName
    };
