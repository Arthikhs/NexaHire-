import { AuthenticatedRequest } from "../middlewares/auth.js";
import { sql } from "../utils/db.js";
import { redisClient } from "../utils/redis.js";
import { TryCatch } from "../utils/TryCatch.js";

export const getDashboardStats = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.user_id;
  const cacheKey = `tracker:stats:${userId}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

  const [stats] = await sql`
    SELECT
      COUNT(*)::int                                                          AS total_applied,
      COUNT(*) FILTER (WHERE status = 'Submitted')::int                    AS pending,
      COUNT(*) FILTER (WHERE status = 'Hired')::int                        AS hired,
      COUNT(*) FILTER (WHERE status = 'Rejected')::int                     AS rejected
    FROM applications
    WHERE applicant_id = ${userId}
  `;

  const [{ count: saved }] = await sql`
    SELECT COUNT(*)::int AS count FROM saved_jobs WHERE user_id = ${userId}
  `;

  const recentActivity = await sql`
    SELECT a.application_id, a.status, a.applied_at, j.title AS job_title,
           c.name AS company_name, c.logo AS company_logo
    FROM applications a
    JOIN jobs j ON a.job_id = j.job_id
    JOIN companies c ON j.company_id = c.company_id
    WHERE a.applicant_id = ${userId}
    ORDER BY a.applied_at DESC LIMIT 5
  `;

  const result = { ...stats, saved_jobs: saved, recentActivity };
  await redisClient.setEx(cacheKey, 120, JSON.stringify(result)); // 2 min cache
  res.json(result);
});
