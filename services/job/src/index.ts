import app from "./app.js";
import dotenv from "dotenv";
import { sql } from "./utils/db.js";
import { connectKafka } from "./producer.js";
import "./utils/redis.js";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";

dotenv.config();

connectKafka();

// Map of userId -> Set of WebSocket connections
export const userSockets = new Map<number, Set<WebSocket>>();

export function notifyUser(userId: number, payload: object) {
  const sockets = userSockets.get(userId);
  if (!sockets) return;
  const msg = JSON.stringify(payload);
  sockets.forEach((ws) => { if (ws.readyState === WebSocket.OPEN) ws.send(msg); });
}

async function initDB() {
  try {
    await sql`
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_type') THEN 
        CREATE TYPE job_type AS ENUM ('Full-time', 'Part-time', 'Contract', 'Internship');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_location') THEN 
        CREATE TYPE work_location AS ENUM ('On-site', 'Remote', 'Hybrid');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN 
        CREATE TYPE application_status AS ENUM ('Submitted', 'Rejected', 'Hired');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level') THEN 
        CREATE TYPE difficulty_level AS ENUM ('Easy', 'Medium', 'Hard');
        END IF;
    END$$;
    `;

    await sql`
    CREATE TABLE IF NOT EXISTS companies (
    company_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    website VARCHAR(255) NOT NULL,
    logo VARCHAR(255) NOT NULL,
    logo_public_id VARCHAR(255) NOT NULL,
    recruiter_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `;

    await sql`
    CREATE TABLE IF NOT EXISTS jobs(
    job_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    salary NUMERIC(10,2),
    location VARCHAR(255),
    job_type job_type NOT NULL,
    openings NUMERIC(3,1) NOT NULL,
    role VARCHAR(255) NOT NULL,
    work_location work_location NOT NULL,
    company_id INTEGER NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    posted_by_recuriter_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
    )
    `;

    await sql`
    CREATE TABLE IF NOT EXISTS applications(
    application_id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
    applicant_id INTEGER NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    status application_status NOT NULL DEFAULT 'Submitted',
    resume VARCHAR(255) NOT NULL,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subscribed BOOLEAN,
    UNIQUE (job_id, applicant_id)
    )
    `;

    await sql`
    CREATE TABLE IF NOT EXISTS company_reviews (
      review_id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      title VARCHAR(255) NOT NULL,
      pros TEXT NOT NULL,
      cons TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(company_id, user_id)
    )
    `;

    await sql`
    CREATE TABLE IF NOT EXISTS saved_jobs (
      saved_id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      job_id INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
      saved_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, job_id)
    )
    `;

    await sql`
    CREATE TABLE IF NOT EXISTS interview_experiences (
      experience_id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      company_name VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      interview_date DATE NOT NULL,
      difficulty difficulty_level NOT NULL,
      rounds TEXT NOT NULL,
      questions_asked TEXT,
      got_offer BOOLEAN NOT NULL DEFAULT false,
      rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `;

    await sql`
    CREATE TABLE IF NOT EXISTS job_questions (
      question_id SERIAL PRIMARY KEY,
      job_id INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      question TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `;

    await sql`
    CREATE TABLE IF NOT EXISTS job_answers (
      answer_id SERIAL PRIMARY KEY,
      question_id INTEGER NOT NULL REFERENCES job_questions(question_id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL,
      user_name VARCHAR(255) NOT NULL,
      answer TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `;

    await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      notification_id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `;

    await sql`
    CREATE TABLE IF NOT EXISTS job_alerts (
      alert_id    SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL,
      keywords    TEXT,
      location    VARCHAR(100),
      job_type    VARCHAR(50),
      work_location VARCHAR(50),
      min_salary  NUMERIC(10,2),
      is_active   BOOLEAN DEFAULT true,
      created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id)
    )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_job_alerts_user ON job_alerts(user_id)`;

    console.log(
      "Job service database tables checked and created successfully."
    );
  } catch (error) {
    console.log("Error while creating tables", error);
    process.exit(1);
  }
}

initDB().then(() => {
  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws, req) => {
    const token = new URL(req.url!, `http://localhost`).searchParams.get("token");
    if (!token) { ws.close(); return; }

    let userId: number;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SEC as string) as { id: number };
      userId = decoded.id;
    } catch { ws.close(); return; }

    if (!userSockets.has(userId)) userSockets.set(userId, new Set());
    userSockets.get(userId)!.add(ws);

    ws.on("close", () => {
      userSockets.get(userId)?.delete(ws);
      if (userSockets.get(userId)?.size === 0) userSockets.delete(userId);
    });
  });

  httpServer.listen(process.env.PORT, () => {
    console.log(`Job service is running on http://localhost:${process.env.PORT}`);
  });
});
