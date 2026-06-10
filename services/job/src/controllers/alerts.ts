import { AuthenticatedRequest } from "../middlewares/auth.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

// GET /api/job/alerts/my  — get current user's alert
export const getMyAlert = TryCatch(async (req: AuthenticatedRequest, res) => {
  const [alert] = await sql`SELECT * FROM job_alerts WHERE user_id = ${req.user!.user_id}`;
  res.json(alert ?? null);
});

// POST /api/job/alerts  — create or update alert (one per user)
export const upsertAlert = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { keywords, location, job_type, work_location, min_salary } = req.body;
  const userId = req.user!.user_id;

  const [alert] = await sql`
    INSERT INTO job_alerts (user_id, keywords, location, job_type, work_location, min_salary, is_active)
    VALUES (${userId}, ${keywords ?? null}, ${location ?? null}, ${job_type ?? null}, ${work_location ?? null}, ${min_salary ?? null}, true)
    ON CONFLICT (user_id) DO UPDATE SET
      keywords = EXCLUDED.keywords,
      location = EXCLUDED.location,
      job_type = EXCLUDED.job_type,
      work_location = EXCLUDED.work_location,
      min_salary = EXCLUDED.min_salary,
      is_active = true
    RETURNING *
  `;
  res.status(201).json({ message: "Job alert saved", alert });
});

// DELETE /api/job/alerts  — remove alert
export const deleteAlert = TryCatch(async (req: AuthenticatedRequest, res) => {
  await sql`DELETE FROM job_alerts WHERE user_id = ${req.user!.user_id}`;
  res.json({ message: "Job alert removed" });
});

// PUT /api/job/alerts/toggle  — toggle active/inactive
export const toggleAlert = TryCatch(async (req: AuthenticatedRequest, res) => {
  const [alert] = await sql`SELECT is_active FROM job_alerts WHERE user_id = ${req.user!.user_id}`;
  if (!alert) throw new ErrorHandler(404, "No alert found");
  const [updated] = await sql`
    UPDATE job_alerts SET is_active = ${!alert.is_active} WHERE user_id = ${req.user!.user_id} RETURNING *
  `;
  res.json({ message: `Alert ${updated.is_active ? "enabled" : "paused"}`, alert: updated });
});

// GET /api/job/alerts/matched  — jobs matching user's alert preferences
export const getMatchedJobs = TryCatch(async (req: AuthenticatedRequest, res) => {
  const [alert] = await sql`SELECT * FROM job_alerts WHERE user_id = ${req.user!.user_id} AND is_active = true`;
  if (!alert) { res.json([]); return; }

  let query = `SELECT j.job_id, j.title, j.description, j.salary, j.location, j.job_type,
    j.work_location, j.created_at, c.name AS company_name, c.logo AS company_logo
    FROM jobs j JOIN companies c ON j.company_id = c.company_id WHERE j.is_active = true`;
  const values: any[] = [];
  let i = 1;

  if (alert.keywords) { query += ` AND (j.title ILIKE $${i} OR j.description ILIKE $${i})`; values.push(`%${alert.keywords}%`); i++; }
  if (alert.location) { query += ` AND j.location ILIKE $${i++}`; values.push(`%${alert.location}%`); }
  if (alert.job_type) { query += ` AND j.job_type = $${i++}`; values.push(alert.job_type); }
  if (alert.work_location) { query += ` AND j.work_location = $${i++}`; values.push(alert.work_location); }
  if (alert.min_salary) { query += ` AND j.salary >= $${i++}`; values.push(alert.min_salary); }

  query += " ORDER BY j.created_at DESC LIMIT 20";
  const jobs = await sql.query(query, values) as any[];
  res.json(jobs);
});
