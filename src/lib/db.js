import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT, 10) : 5432,
  ssl: {
    rejectUnauthorized: false, // ✅ Required for AWS RDS
  },
});

export default pool;
