import { AuthenticatedRequest } from "../middlewares/auth.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

export const postExperience = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { company_name, role, interview_date, difficulty, rounds, questions_asked, got_offer, rating } = req.body;

  if (!company_name || !role || !interview_date || !difficulty || !rounds || !rating) {
    throw new ErrorHandler(400, "All required fields must be provided");
  }

  if (rating < 1 || rating > 5) {
    throw new ErrorHandler(400, "Rating must be between 1 and 5");
  }

  const [experience] = await sql`
    INSERT INTO interview_experiences
      (user_id, user_name, company_name, role, interview_date, difficulty, rounds, questions_asked, got_offer, rating)
    VALUES
      (${user.user_id}, ${user.name}, ${company_name}, ${role}, ${interview_date}, ${difficulty}, ${rounds}, ${questions_asked ?? null}, ${got_offer ?? false}, ${rating})
    RETURNING *
  `;

  res.status(201).json({ message: "Experience posted successfully", experience });
});

export const getExperiences = TryCatch(async (req, res) => {
  const { company, role, difficulty, search } = req.query as Record<string, string>;

  let query = `SELECT * FROM interview_experiences WHERE 1=1`;
  const values: any[] = [];
  let i = 1;

  if (company) { query += ` AND company_name ILIKE $${i++}`; values.push(`%${company}%`); }
  if (role)    { query += ` AND role ILIKE $${i++}`;         values.push(`%${role}%`); }
  if (difficulty) { query += ` AND difficulty = $${i++}`;   values.push(difficulty); }
  if (search)  { query += ` AND company_name ILIKE $${i++}`; values.push(`%${search}%`); }

  query += ` ORDER BY created_at DESC`;

  const experiences = await sql.query(query, values) as any[];
  res.json(experiences);
});

export const deleteExperience = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;

  const [exp] = await sql`SELECT user_id FROM interview_experiences WHERE experience_id = ${id}`;

  if (!exp) throw new ErrorHandler(404, "Experience not found");
  if (exp.user_id !== user.user_id) throw new ErrorHandler(403, "Forbidden: Not your experience");

  await sql`DELETE FROM interview_experiences WHERE experience_id = ${id}`;
  res.json({ message: "Experience deleted" });
});
