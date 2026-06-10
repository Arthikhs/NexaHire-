import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { sql } from "./utils/db.js";

async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS interview_questions (
        question_id  SERIAL PRIMARY KEY,
        title        TEXT NOT NULL,
        content      TEXT NOT NULL,
        category     VARCHAR(50) NOT NULL,
        difficulty   VARCHAR(20) NOT NULL CHECK (difficulty IN ('Easy','Medium','Hard')),
        answer       TEXT,
        companies    TEXT[] DEFAULT '{}',
        tags         TEXT[] DEFAULT '{}',
        created_by   INTEGER,
        created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_questions_category ON interview_questions(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON interview_questions(difficulty)`;

    await sql`
      CREATE TABLE IF NOT EXISTS question_votes (
        vote_id     SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES interview_questions(question_id) ON DELETE CASCADE,
        user_id     INTEGER NOT NULL,
        vote        VARCHAR(4) NOT NULL CHECK (vote IN ('up','down')),
        UNIQUE(question_id, user_id)
      )
    `;
    console.log("✅ Questions DB tables ready");
  } catch (error) {
    console.error("❌ Questions DB init failed", error);
    process.exit(1);
  }
}

initDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Questions service running on http://localhost:${process.env.PORT}`);
  });
});
