import { AuthenticatedRequest } from "../middlewares/auth.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

// GET /api/opensource/projects
export const getProjects = TryCatch(async (req, res) => {
  const { search, difficulty } = req.query as Record<string, string>;

  let query = `SELECT * FROM opensource_projects WHERE 1=1`;
  const values: any[] = [];
  let i = 1;

  if (search) {
    query += ` AND (title ILIKE $${i} OR description ILIKE $${i} OR $${i+1} ILIKE ANY(tech_stack))`;
    values.push(`%${search}%`, `%${search}%`);
    i += 2;
  }
  if (difficulty) { query += ` AND difficulty = $${i++}`; values.push(difficulty); }
  query += " ORDER BY created_at DESC LIMIT 50";

  const projects = await sql.query(query, values) as any[];
  res.json(projects);
});

// POST /api/opensource/projects
export const addProject = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { title, description, github_url, tech_stack, difficulty } = req.body;
  if (!title || !github_url) throw new ErrorHandler(400, "title and github_url are required");

  const validDifficulties = ["Beginner", "Intermediate", "Advanced"];
  const diff = validDifficulties.includes(difficulty) ? difficulty : "Beginner";

  const [project] = await sql`
    INSERT INTO opensource_projects (title, description, github_url, tech_stack, difficulty, contributor_id, contributor_name)
    VALUES (${title}, ${description ?? null}, ${github_url}, ${tech_stack ?? []}, ${diff}, ${req.user!.user_id}, ${req.user!.name})
    RETURNING *
  `;
  res.status(201).json({ message: "Project added", project });
});

// DELETE /api/opensource/projects/:id
export const deleteProject = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const [project] = await sql`SELECT contributor_id FROM opensource_projects WHERE project_id = ${id}`;
  if (!project) throw new ErrorHandler(404, "Project not found");
  if (project.contributor_id !== req.user!.user_id) throw new ErrorHandler(403, "Forbidden");

  await sql`DELETE FROM opensource_projects WHERE project_id = ${id}`;
  res.json({ message: "Project deleted" });
});
