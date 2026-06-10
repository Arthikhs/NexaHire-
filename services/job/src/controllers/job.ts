import axios from "axios";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import getBuffer from "../utils/buffer.js";
import { sql } from "../utils/db.js";
import { redisClient } from "../utils/redis.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import { applicationStatusUpdateTemplate } from "../tempelete.js";
import { publishToTopic } from "../producer.js";

export const getRecruiterStats = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user!;

  const [stats] = await sql`
    SELECT
      COUNT(DISTINCT c.company_id)::int AS total_companies,
      COUNT(DISTINCT j.job_id)::int AS total_jobs,
      COUNT(DISTINCT CASE WHEN j.is_active = true THEN j.job_id END)::int AS active_jobs,
      COUNT(DISTINCT a.application_id)::int AS total_applications,
      COUNT(DISTINCT CASE WHEN a.status = 'Hired' THEN a.application_id END)::int AS total_hired,
      COUNT(DISTINCT CASE WHEN a.status = 'Rejected' THEN a.application_id END)::int AS total_rejected,
      COUNT(DISTINCT CASE WHEN a.status = 'Submitted' THEN a.application_id END)::int AS total_pending
    FROM companies c
    LEFT JOIN jobs j ON j.company_id = c.company_id
    LEFT JOIN applications a ON a.job_id = j.job_id
    WHERE c.recruiter_id = ${user.user_id}
  `;

  const recentApplications = await sql`
    SELECT a.application_id, a.status, a.applied_at, a.applicant_id, a.resume,
      j.title AS job_title, c.name AS company_name
    FROM applications a
    JOIN jobs j ON a.job_id = j.job_id
    JOIN companies c ON j.company_id = c.company_id
    WHERE c.recruiter_id = ${user.user_id}
    ORDER BY a.applied_at DESC LIMIT 5
  `;

  const topJobs = await sql`
    SELECT j.job_id, j.title, j.is_active, c.name AS company_name,
      COUNT(a.application_id)::int AS application_count
    FROM jobs j
    JOIN companies c ON j.company_id = c.company_id
    LEFT JOIN applications a ON a.job_id = j.job_id
    WHERE c.recruiter_id = ${user.user_id}
    GROUP BY j.job_id, j.title, j.is_active, c.name
    ORDER BY application_count DESC LIMIT 5
  `;

  res.json({ stats, recentApplications, topJobs });
});

export const saveJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { jobId } = req.params;

  const [job] = await sql`SELECT job_id FROM jobs WHERE job_id = ${jobId}`;
  if (!job) throw new ErrorHandler(404, "Job not found");

  await sql`INSERT INTO saved_jobs (user_id, job_id) VALUES (${user.user_id}, ${jobId}) ON CONFLICT DO NOTHING`;
  res.json({ message: "Job saved" });
});

export const unsaveJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { jobId } = req.params;
  await sql`DELETE FROM saved_jobs WHERE user_id = ${user.user_id} AND job_id = ${jobId}`;
  res.json({ message: "Job removed from saved" });
});

export const getSavedJobs = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const jobs = await sql`
    SELECT j.job_id, j.title, j.description, j.salary, j.location, j.job_type, j.role,
    j.work_location, j.created_at, j.is_active, c.name AS company_name,
    c.logo AS company_logo, c.company_id, s.saved_at
    FROM saved_jobs s
    JOIN jobs j ON s.job_id = j.job_id
    JOIN companies c ON j.company_id = c.company_id
    WHERE s.user_id = ${user.user_id}
    ORDER BY s.saved_at DESC
  `;
  res.json(jobs);
});

export const createCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "Authentication required");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(
        403,
        "Forbidden: Only recruiter can create a company"
      );
    }

    const { name, description, website } = req.body;

    if (!name || !description || !website) {
      throw new ErrorHandler(400, "All the fields required");
    }

    const existingCompanies =
      await sql`SELECT company_id FROM companies WHERE name = ${name}`;

    if (existingCompanies.length > 0) {
      throw new ErrorHandler(
        409,
        `A company with the name ${name} already exists`
      );
    }

    const file = req.file;

    if (!file) {
      throw new ErrorHandler(400, "Company Logo file is required");
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
      throw new ErrorHandler(500, "Failed to create file buffer");
    }

    const { data } = await axios.post(
      `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
      { buffer: fileBuffer.content }
    );

    const [newCompany] =
      await sql`INSERT INTO companies (name, description, website, logo, logo_public_id, recruiter_id) VALUES (${name}, ${description}, ${website}, ${data.url}, ${data.public_id}, ${req.user?.user_id}) RETURNING *`;

    res.json({
      message: "Company created successfully",
      company: newCompany,
    });
  }
);

export const deleteCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    const { companyId } = req.params;

    const [company] =
      await sql`SELECT logo_public_id FROM companies WHERE company_id = ${companyId} AND recruiter_id = ${user?.user_id}`;

    if (!company) {
      throw new ErrorHandler(
        404,
        "Company not found or you're not authorized to delete it."
      );
    }

    await sql`DELETE FROM companies WHERE company_id = ${companyId}`;

    res.json({
      message: "Company and all associated jobs have been deleted",
    });
  }
);

export const createJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  if (!user) {
    throw new ErrorHandler(401, "Authentication required");
  }

  if (user.role !== "recruiter") {
    throw new ErrorHandler(
      403,
      "Forbidden: Only recruiter can create a company"
    );
  }

  const {
    title,
    description,
    salary,
    location,
    role,
    job_type,
    work_location,
    company_id,
    openings,
  } = req.body;

  if (!title || !description || !salary || !location || !role || !openings) {
    throw new ErrorHandler(400, "All the fields required");
  }

  const [company] =
    await sql`SELECT company_id FROM companies WHERE company_id = ${company_id} AND recruiter_id = ${user.user_id}`;

  if (!company) {
    throw new ErrorHandler(404, "Company not found");
  }

  const [newJob] =
    await sql`INSERT INTO jobs (title, description, salary, location, role, job_type, work_location, company_id, posted_by_recuriter_id, openings) VALUES (${title}, ${description}, ${salary}, ${location}, ${role}, ${job_type}, ${work_location}, ${company_id}, ${user.user_id}, ${openings}) RETURNING *`;

  // Notify users with matching active job alerts
  try {
    const alerts = await sql`SELECT * FROM job_alerts WHERE is_active = true`;
    for (const a of alerts) {
      const keyMatch = !a.keywords || title.toLowerCase().includes(a.keywords.toLowerCase()) || description.toLowerCase().includes(a.keywords.toLowerCase());
      const locMatch = !a.location || (location ?? "").toLowerCase().includes(a.location.toLowerCase());
      const typeMatch = !a.job_type || a.job_type === job_type;
      const modeMatch = !a.work_location || a.work_location === work_location;
      const salMatch = !a.min_salary || Number(salary) >= Number(a.min_salary);
      if (keyMatch && locMatch && typeMatch && modeMatch && salMatch) {
        await sql`INSERT INTO notifications (user_id, message) VALUES (${a.user_id}, ${`New job alert: "${title}" at ${location ?? "Remote"} matches your preferences!`})`;
        const { notifyUser } = await import("../index.js");
        notifyUser(a.user_id, { type: "notification", message: `New job alert: "${title}" matches your preferences!` });
      }
    }
  } catch { /* don't block job creation if alert notify fails */ }

  res.json({
    message: "Job posted successfully",
    job: newJob,
  });
});

export const updateJob = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user;

  if (!user) {
    throw new ErrorHandler(401, "Authentication required");
  }

  if (user.role !== "recruiter") {
    throw new ErrorHandler(
      403,
      "Forbidden: Only recruiter can create a company"
    );
  }

  const {
    title,
    description,
    salary,
    location,
    role,
    job_type,
    work_location,
    company_id,
    openings,
    is_active,
  } = req.body;

  const [existingJob] =
    await sql`SELECT posted_by_recuriter_id FROM jobs WHERE job_id = ${req.params.jobId}`;

  if (!existingJob) {
    throw new ErrorHandler(404, "Job not found");
  }

  if (existingJob.posted_by_recuriter_id !== user.user_id) {
    throw new ErrorHandler(403, "Forbiden: You are not allowed");
  }

  const [updatedJob] = await sql`UPDATE jobs SET title = ${title},
  description = ${description},
  salary = ${salary},
  location = ${location},
  role = ${role},
  job_type = ${job_type},
  work_location = ${work_location},
  openings = ${openings},
  is_active = ${is_active}
  WHERE job_id = ${req.params.jobId} RETURNING *;
  `;

  res.json({
    message: "Job updated successfully",
    job: updatedJob,
  });
});

export const getAllCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const companies =
      await sql`SELECT * FROM companies WHERE recruiter_id = ${req.user?.user_id}`;

    res.json(companies);
  }
);

export const getCompanyDetails = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { id } = req.params;

    if (!id) {
      throw new ErrorHandler(400, "Company id is required");
    }

    const [companyData] = await sql`SELECT c.*, COALESCE (
     (
       SELECT json_agg(j.*) FROM jobs j WHERE j.company_id = c.company_id
      ),
      '[]'::json
    ) AS jobs
     FROM companies c WHERE c.company_id = ${id} GROUP BY c.company_id;`;

    if (!companyData) {
      throw new ErrorHandler(404, "Company not found");
    }

    res.json(companyData);
  }
);

export const getAllActiveJobs = TryCatch(async (req, res) => {
  const { title, location, job_type, work_location, min_salary, max_salary } = req.query as {
    title?: string;
    location?: string;
    job_type?: string;
    work_location?: string;
    min_salary?: string;
    max_salary?: string;
  };

  let querySting = `SELECT j.job_id, j.title, j.description, j.salary, j.location, j.job_type, j.role, j.work_location, j.created_at, j.is_active, c.name AS company_name, c.logo AS company_logo, c.company_id AS company_id FROM jobs j JOIN companies c ON j.company_id = c.company_id WHERE j.is_active = true`;

  const values = [];
  let paramIndex = 1;

  if (title) { querySting += ` AND j.title ILIKE $${paramIndex}`; values.push(`%${title}%`); paramIndex++; }
  if (location) { querySting += ` AND j.location ILIKE $${paramIndex}`; values.push(`%${location}%`); paramIndex++; }
  if (job_type) { querySting += ` AND j.job_type = $${paramIndex}`; values.push(job_type); paramIndex++; }
  if (work_location) { querySting += ` AND j.work_location = $${paramIndex}`; values.push(work_location); paramIndex++; }
  if (min_salary) { querySting += ` AND j.salary >= $${paramIndex}`; values.push(Number(min_salary)); paramIndex++; }
  if (max_salary) { querySting += ` AND j.salary <= $${paramIndex}`; values.push(Number(max_salary)); paramIndex++; }

  querySting += " ORDER BY j.created_at DESC";

  const jobs = (await sql.query(querySting, values)) as any[];
  res.json(jobs);
});

export const getTopViewedJobs = TryCatch(async (req, res) => {
  // get all job view keys from Redis
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
    SELECT j.job_id, j.title, j.location, j.job_type, j.work_location,
      c.name AS company_name, c.logo AS company_logo
    FROM jobs j JOIN companies c ON j.company_id = c.company_id
    WHERE j.job_id = ANY(${ids}::int[])
  `;

  const result = top.map((t) => {
    const jobData = jobs.find((j: any) => j.job_id === t.job_id);
    if (!jobData) return null;
    return { ...jobData, views: t.views };
  }).filter((j): j is NonNullable<typeof j> => j !== null);

  res.json(result);
});

export const getSingleJob = TryCatch(async (req, res) => {
  const { jobId } = req.params;

  const [job] = await sql`SELECT * FROM jobs WHERE job_id = ${jobId}`;

  if (!job) throw new ErrorHandler(404, "Job not found");

  // increment view count in Redis
  const views = await redisClient.incr(`job:views:${jobId}`);

  res.json({ ...job, views });
});

export const getAllApplicationForJob = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "Authentication required");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(403, "Forbidden: Only recruiter can access this");
    }

    const { jobId } = req.params;

    const [job] = await sql`
    SELECT posted_by_recuriter_id FROM jobs WHERE job_id = ${jobId}
    `;

    if (!job) {
      throw new ErrorHandler(404, "job not found");
    }

    if (job.posted_by_recuriter_id !== user.user_id) {
      throw new ErrorHandler(403, "Forbidden you are not allowed");
    }

    const applications =
      await sql`SELECT * FROM applications WHERE job_id = ${jobId} ORDER BY subscribed DESC, applied_at ASC`;

    res.json(applications);
  }
);

export const updateApplication = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;

    if (!user) {
      throw new ErrorHandler(401, "Authentication required");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(403, "Forbidden: Only recruiter can access this");
    }

    const { id } = req.params;

    const [application] =
      await sql`SELECT * FROM applications WHERE application_id = ${id}`;

    if (!application) {
      throw new ErrorHandler(404, "Application not found");
    }

    const [job] =
      await sql`SELECT posted_by_recuriter_id, title FROM jobs WHERE job_id = ${application.job_id}`;

    if (!job) {
      throw new ErrorHandler(404, "no job with this id");
    }

    if (job.posted_by_recuriter_id !== user.user_id) {
      throw new ErrorHandler(403, "Forbidden you are not allowed");
    }

    const [updatedApplication] =
      await sql`UPDATE applications SET status = ${req.body.status} WHERE application_id = ${id} RETURNING *`;

    // create in-app notification
    await sql`
      INSERT INTO notifications (user_id, message)
      VALUES (${application.applicant_id}, ${'Your application for "' + job.title + '" has been updated to: ' + req.body.status})
    `;

    // push real-time notification via WebSocket
    const { notifyUser } = await import("../index.js");
    notifyUser(application.applicant_id, {
      type: "notification",
      message: `Your application for "${job.title}" has been updated to: ${req.body.status}`,
    });

    const message = {
      to: application.applicant_email,
      subject: "Application Update - Job portal",
      html: applicationStatusUpdateTemplate(job.title),
    };

    publishToTopic("send-mail", message).catch((error) => {
      console.error("Failed to publish message to kafka", error);
    });

    res.json({
      message: "Application updated",
      job,
      updatedApplication,
    });
  }
);
