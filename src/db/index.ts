import env from "@/env";
import schema from "@/routes/index.schema";

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

export default db;
