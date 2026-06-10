import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { sql } from "./utils/db.js";

async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS salary_submissions (
        submission_id    SERIAL PRIMARY KEY,
        user_id          INTEGER NOT NULL,
        company_name     VARCHAR(200) NOT NULL,
        role             VARCHAR(150) NOT NULL,
        experience_years SMALLINT NOT NULL,
        salary           NUMERIC(12,2) NOT NULL,
        location         VARCHAR(100),
        job_type         VARCHAR(50),
        created_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_salary_company ON salary_submissions(company_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_salary_role    ON salary_submissions(role)`;

    await sql`
      CREATE TABLE IF NOT EXISTS company_reviews (
        review_id   SERIAL PRIMARY KEY,
        company_id  INTEGER NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
        user_id     INTEGER NOT NULL,
        user_name   VARCHAR(150) NOT NULL,
        rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        title       VARCHAR(200),
        pros        TEXT,
        cons        TEXT,
        created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, user_id)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_company ON company_reviews(company_id)`;
    console.log("✅ Insights DB tables ready");
  } catch (error) {
    console.error("❌ Insights DB init failed", error);
    process.exit(1);
  }
}

initDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Insights service running on http://localhost:${process.env.PORT}`);
  });
});
