import { Request } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

// POST /api/insights/salary  - submit salary
export const submitSalary = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { company_name, role, experience_years, salary, location, job_type } = req.body;
  if (!company_name || !role || !salary || experience_years === undefined)
    throw new ErrorHandler(400, "company_name, role, salary and experience_years are required");

  const [entry] = await sql`
    INSERT INTO salary_submissions (user_id, company_name, role, experience_years, salary, location, job_type)
    VALUES (${req.user!.user_id}, ${company_name}, ${role}, ${experience_years}, ${salary}, ${location ?? null}, ${job_type ?? null})
    RETURNING *
  `;
  res.status(201).json({ message: "Salary submitted", entry });
});

// GET /api/insights/salary?company=Google&role=SDE&location=Bangalore
export const searchSalary = TryCatch(async (req: Request, res) => {
  const { company, role, location, min_exp, max_exp } = req.query as Record<string, string>;

  let query = `SELECT company_name, role, location, job_type, experience_years, salary, created_at
    FROM salary_submissions WHERE 1=1`;
  const values: any[] = [];
  let i = 1;

  if (company) { query += ` AND company_name ILIKE $${i++}`; values.push(`%${company}%`); }
  if (role) { query += ` AND role ILIKE $${i++}`; values.push(`%${role}%`); }
  if (location) { query += ` AND location ILIKE $${i++}`; values.push(`%${location}%`); }
  if (min_exp) { query += ` AND experience_years >= $${i++}`; values.push(parseInt(min_exp)); }
  if (max_exp) { query += ` AND experience_years <= $${i++}`; values.push(parseInt(max_exp)); }

  query += " ORDER BY created_at DESC LIMIT 50";
  const rows = (await sql.query(query, values)) as any[];
  res.json(rows);
});

// GET /api/insights/salary/trends?company=Google&role=SDE
export const getSalaryTrends = TryCatch(async (req: Request, res) => {
  const { company, role } = req.query as Record<string, string>;
  if (!company && !role) throw new ErrorHandler(400, "company or role is required");

  let query = `SELECT experience_years, ROUND(AVG(salary)::numeric,0) AS avg_salary,
    MIN(salary) AS min_salary, MAX(salary) AS max_salary, COUNT(*)::int AS count
    FROM salary_submissions WHERE 1=1`;
  const values: any[] = [];
  let i = 1;

  if (company) { query += ` AND company_name ILIKE $${i++}`; values.push(`%${company}%`); }
  if (role) { query += ` AND role ILIKE $${i++}`; values.push(`%${role}%`); }
  query += " GROUP BY experience_years ORDER BY experience_years";

  const trends = (await sql.query(query, values)) as any[];
  res.json(trends);
});

// POST /api/insights/company/:companyId/review
export const submitReview = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { companyId } = req.params;
  const { rating, title, pros, cons } = req.body;
  if (!rating) throw new ErrorHandler(400, "rating is required");

  const [review] = await sql`
    INSERT INTO company_reviews (company_id, user_id, user_name, rating, title, pros, cons)
    VALUES (${companyId}, ${req.user!.user_id}, ${req.user!.name}, ${rating}, ${title ?? null}, ${pros ?? null}, ${cons ?? null})
    ON CONFLICT (company_id, user_id) DO UPDATE SET rating=${rating}, title=${title ?? null}, pros=${pros ?? null}, cons=${cons ?? null}
    RETURNING *
  `;
  res.status(201).json({ message: "Review submitted", review });
});

// GET /api/insights/company/:companyId/reviews
export const getReviews = TryCatch(async (req: Request, res) => {
  const { companyId } = req.params;
  const reviews = await sql`
    SELECT * FROM company_reviews WHERE company_id = ${companyId} ORDER BY created_at DESC LIMIT 20
  `;
  res.json(reviews);
});

// GET /api/insights/company/:companyName
export const getCompanyInsights = TryCatch(async (req: Request, res) => {
  const { companyName } = req.params;

  const [company] = await sql`SELECT * FROM companies WHERE name ILIKE ${companyName} LIMIT 1`;

  const salaryStats = await sql`
    SELECT role, ROUND(AVG(salary)::numeric,0) AS avg_salary, MIN(salary) AS min_salary, MAX(salary) AS max_salary, COUNT(*)::int AS count
    FROM salary_submissions WHERE company_name ILIKE ${companyName}
    GROUP BY role ORDER BY avg_salary DESC
  `;

  const reviewStats = company ? await sql`
    SELECT ROUND(AVG(rating)::numeric,1) AS avg_rating, COUNT(*)::int AS total_reviews
    FROM company_reviews WHERE company_id = ${company.company_id}
  ` : [{ avg_rating: null, total_reviews: 0 }];

  const openJobs = company ? await sql`
    SELECT job_id, title, location, job_type, work_location, created_at
    FROM jobs WHERE company_id = ${company.company_id} AND is_active = true
    ORDER BY created_at DESC LIMIT 10
  ` : [];

  res.json({ company: company ?? { name: companyName }, salaryStats, reviewStats: reviewStats[0], openJobs });
});
