import { Request } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

// GET /api/questions?category=DSA&difficulty=Medium&search=tree&company=Google&page=1
export const getQuestions = TryCatch(async (req: Request, res) => {
  const { category, difficulty, search, company, page = "1", limit = "20" } = req.query as Record<string, string>;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  let query = `SELECT * FROM interview_questions WHERE 1=1`;
  const values: any[] = [];
  let i = 1;

  if (category) { query += ` AND category = $${i++}`; values.push(category); }
  if (difficulty) { query += ` AND difficulty = $${i++}`; values.push(difficulty); }
  if (company) { query += ` AND $${i++} = ANY(companies)`; values.push(company); }
  if (search) { query += ` AND (title ILIKE $${i} OR content ILIKE $${i})`; values.push(`%${search}%`); i++; }

  query += ` ORDER BY created_at DESC LIMIT $${i++} OFFSET $${i++}`;
  values.push(parseInt(limit), offset);

  const questions = (await sql.query(query, values)) as any[];
  res.json(questions);
});

export const getSingleQuestion = TryCatch(async (req: Request, res) => {
  const { questionId } = req.params;
  const [q] = await sql`SELECT * FROM interview_questions WHERE question_id = ${questionId}`;
  if (!q) throw new ErrorHandler(404, "Question not found");
  res.json(q);
});

export const addQuestion = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  if (user.role !== "recruiter") throw new ErrorHandler(403, "Only recruiters can add questions");

  const { title, content, category, difficulty, answer, companies, tags } = req.body;
  if (!title || !content || !category || !difficulty)
    throw new ErrorHandler(400, "title, content, category and difficulty are required");

  const [q] = await sql`
    INSERT INTO interview_questions (title, content, category, difficulty, answer, companies, tags, created_by)
    VALUES (${title}, ${content}, ${category}, ${difficulty}, ${answer ?? null}, ${companies ?? []}, ${tags ?? []}, ${user.user_id})
    RETURNING *
  `;
  res.status(201).json({ message: "Question added", question: q });
});

export const getCategories = TryCatch(async (_req: Request, res) => {
  const rows = await sql`SELECT DISTINCT category FROM interview_questions ORDER BY category`;
  res.json(rows.map((r: any) => r.category));
});

export const getCompanies = TryCatch(async (_req: Request, res) => {
  const rows = await sql`SELECT DISTINCT UNNEST(companies) AS company FROM interview_questions ORDER BY company`;
  res.json(rows.map((r: any) => r.company));
});

export const voteQuestion = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { questionId } = req.params;
  const { vote } = req.body; // "up" | "down"
  if (!["up", "down"].includes(vote)) throw new ErrorHandler(400, "vote must be up or down");

  await sql`
    INSERT INTO question_votes (question_id, user_id, vote)
    VALUES (${questionId}, ${req.user!.user_id}, ${vote})
    ON CONFLICT (question_id, user_id) DO UPDATE SET vote = ${vote}
  `;

  const [counts] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE vote = 'up')::int AS upvotes,
      COUNT(*) FILTER (WHERE vote = 'down')::int AS downvotes
    FROM question_votes WHERE question_id = ${questionId}
  `;
  res.json(counts);
});
