import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { sql } from "./utils/db.js";

async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS opensource_projects (
        project_id       SERIAL PRIMARY KEY,
        title            VARCHAR(200) NOT NULL,
        description      TEXT,
        github_url       TEXT NOT NULL,
        tech_stack       TEXT[] DEFAULT '{}',
        difficulty       VARCHAR(20) NOT NULL DEFAULT 'Beginner' CHECK (difficulty IN ('Beginner','Intermediate','Advanced')),
        stars            INTEGER DEFAULT 0,
        forks            INTEGER DEFAULT 0,
        open_issues      INTEGER DEFAULT 0,
        contributor_id   INTEGER NOT NULL,
        contributor_name VARCHAR(150) NOT NULL,
        created_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_os_projects_difficulty ON opensource_projects(difficulty)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_os_projects_contributor ON opensource_projects(contributor_id)`;
    console.log("✅ OpenSource DB tables ready");
  } catch (error) {
    console.error("❌ OpenSource DB init failed", error);
    process.exit(1);
  }
}

initDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`OpenSource service running on http://localhost:${process.env.PORT}`);
  });
});
