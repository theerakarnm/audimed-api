import { drizzle } from "drizzle-orm/node-postgres"
import 'dotenv/config';

const db = drizzle(process.env.DATABASE_URL!, {
  logger: true
});

export { db };