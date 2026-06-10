import { AuthenticatedRequest } from "../middlewares/auth.js";
import { sql } from "../utils/db.js";
import { redisClient } from "../utils/redis.js";
import { TryCatch } from "../utils/TryCatch.js";

// GET /api/feed/personalized  - jobs matching user skills
export const getPersonalizedFeed = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const cacheKey = `feed:personalized:${user.user_id}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

  // skills-based match: jobs whose role or description matches user skills
  const skills = user.skills.length > 0 ? user.skills : ["developer"];
  const skillPattern = skills.map(s => `%${s}%`).join("|");

  const jobs = await sql`
    SELECT j.job_id, j.title, j.description, j.salary, j.location, j.job_type,
      j.role, j.work_location, j.created_at, c.name AS company_name, c.logo AS company_logo, c.company_id
    FROM jobs j
    JOIN companies c ON j.company_id = c.company_id
    WHERE j.is_active = true
      AND j.job_id NOT IN (
        SELECT job_id FROM applications WHERE applicant_id = ${user.user_id}
      )
      AND (
        j.role ILIKE ANY(${skills.map(s => `%${s}%`)})
        OR j.title ILIKE ANY(${skills.map(s => `%${s}%`)})
      )
    ORDER BY j.created_at DESC
    LIMIT 20
  `;

  await redisClient.setEx(cacheKey, 300, JSON.stringify(jobs)); // 5 min cache
  res.json(jobs);
});

// GET /api/feed/trending  - top viewed jobs from Redis
export const getTrendingJobs = TryCatch(async (_req, res) => {
  const cacheKey = "feed:trending";
  const cached = await redisClient.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

  const keys = await redisClient.keys("job:views:*");
  if (keys.length === 0) return res.json([]);

  const counts = await Promise.all(
    keys.map(async (key) => ({
      job_id: Number(key.split(":")[2]),
      views: Number(await redisClient.get(key)),
    }))
  );
  counts.sort((a, b) => b.views - a.views);
  const top = counts.slice(0, 10);
  const ids = top.map((t) => t.job_id);

  const jobs = await sql`
    SELECT j.job_id, j.title, j.location, j.job_type, j.work_location, j.salary,
      c.name AS company_name, c.logo AS company_logo, c.company_id
    FROM jobs j JOIN companies c ON j.company_id = c.company_id
    WHERE j.job_id = ANY(${ids}::int[]) AND j.is_active = true
  `;

  const result = top
    .map((t) => { const jd = jobs.find((j: any) => j.job_id === t.job_id); return jd ? { ...jd, views: t.views } : null; })
    .filter(Boolean);

  await redisClient.setEx(cacheKey, 180, JSON.stringify(result)); // 3 min cache
  res.json(result);
});

// GET /api/feed/trending-companies
export const getTrendingCompanies = TryCatch(async (_req, res) => {
  const cacheKey = "feed:trending-companies";
  const cached = await redisClient.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

  const companies = await sql`
    SELECT c.company_id, c.name, c.logo, c.description,
      COUNT(DISTINCT j.job_id)::int AS active_jobs,
      COUNT(DISTINCT a.application_id)::int AS total_applications
    FROM companies c
    LEFT JOIN jobs j ON j.company_id = c.company_id AND j.is_active = true
    LEFT JOIN applications a ON a.job_id = j.job_id
    GROUP BY c.company_id
    ORDER BY total_applications DESC, active_jobs DESC
    LIMIT 10
  `;

  await redisClient.setEx(cacheKey, 600, JSON.stringify(companies)); // 10 min cache
  res.json(companies);
});

// GET /api/feed/recent
export const getRecentJobs = TryCatch(async (_req, res) => {
  const jobs = await sql`
    SELECT j.job_id, j.title, j.salary, j.location, j.job_type, j.work_location, j.created_at,
      c.name AS company_name, c.logo AS company_logo, c.company_id
    FROM jobs j JOIN companies c ON j.company_id = c.company_id
    WHERE j.is_active = true
    ORDER BY j.created_at DESC LIMIT 10
  `;
  res.json(jobs);
});
