import app from "./app.js";
import dotenv from "dotenv";
import { sql } from "./utils/db.js";
import "./utils/redis.js";

dotenv.config();

async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS application_notes (
        note_id        SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES applications(application_id) ON DELETE CASCADE,
        user_id        INTEGER NOT NULL,
        content        TEXT NOT NULL,
        created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_notes_application ON application_notes(application_id)`;

    await sql`
      CREATE TABLE IF NOT EXISTS application_reminders (
        reminder_id    SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES applications(application_id) ON DELETE CASCADE,
        user_id        INTEGER NOT NULL,
        remind_at      TIMESTAMPTZ NOT NULL,
        note           TEXT,
        is_sent        BOOLEAN DEFAULT false,
        created_at     TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_reminders_user_time ON application_reminders(user_id, remind_at)`;

    await sql`
      CREATE TABLE IF NOT EXISTS kanban_columns (
        column_id SERIAL PRIMARY KEY,
        user_id   INTEGER NOT NULL,
        title     VARCHAR(100) NOT NULL,
        position  SMALLINT NOT NULL DEFAULT 0,
        color     VARCHAR(20) DEFAULT '#3b82f6'
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS kanban_cards (
        card_id        SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES applications(application_id) ON DELETE CASCADE,
        column_id      INTEGER NOT NULL REFERENCES kanban_columns(column_id) ON DELETE CASCADE,
        position       SMALLINT NOT NULL DEFAULT 0,
        UNIQUE(application_id)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_kanban_cards_column ON kanban_cards(column_id, position)`;

    console.log("✅ Tracker DB tables ready");
  } catch (error) {
    console.error("❌ Tracker DB init failed", error);
    process.exit(1);
  }
}

initDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Tracker service running on http://localhost:${process.env.PORT}`);
  });
});
