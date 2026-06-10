import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/user.js";
import cors from "cors";
import { sql } from "./utils/db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/user", userRoutes);

async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS skill_endorsements (
        endorsement_id   SERIAL PRIMARY KEY,
        endorsed_user_id INTEGER NOT NULL,
        endorser_id      INTEGER NOT NULL,
        endorser_name    VARCHAR(150) NOT NULL,
        skill_name       VARCHAR(100) NOT NULL,
        created_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(endorsed_user_id, endorser_id, skill_name)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_endorsements_user ON skill_endorsements(endorsed_user_id)`;
    console.log("✅ User DB tables ready");
  } catch (error) {
    console.error("❌ User DB init failed", error);
    process.exit(1);
  }
}

initDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`User service is running on http://localhost:${process.env.PORT}`);
  });
});
