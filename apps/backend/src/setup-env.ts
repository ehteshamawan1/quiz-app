import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.development for local development
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  const envPath = path.resolve(process.cwd(), '.env.development');
  dotenv.config({ path: envPath });
  console.log(`[setup-env] Loaded environment from ${envPath}`);
}
