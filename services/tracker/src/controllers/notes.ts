import { AuthenticatedRequest } from "../middlewares/auth.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

export const getNotes = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.user_id;
  const { applicationId } = req.params;

  // verify ownership
  const [app] = await sql`SELECT applicant_id FROM applications WHERE application_id = ${applicationId}`;
  if (!app) throw new ErrorHandler(404, "Application not found");
  if (app.applicant_id !== userId) throw new ErrorHandler(403, "Forbidden");

  const notes = await sql`
    SELECT * FROM application_notes
    WHERE application_id = ${applicationId}
    ORDER BY created_at DESC
  `;
  res.json(notes);
});

export const addNote = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.user_id;
  const { applicationId } = req.params;
  const { content } = req.body;

  if (!content?.trim()) throw new ErrorHandler(400, "Note content is required");

  const [app] = await sql`SELECT applicant_id FROM applications WHERE application_id = ${applicationId}`;
  if (!app) throw new ErrorHandler(404, "Application not found");
  if (app.applicant_id !== userId) throw new ErrorHandler(403, "Forbidden");

  const [note] = await sql`
    INSERT INTO application_notes (application_id, user_id, content)
    VALUES (${applicationId}, ${userId}, ${content.trim()})
    RETURNING *
  `;
  res.status(201).json({ message: "Note added", note });
});

export const deleteNote = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.user_id;
  const { noteId } = req.params;

  const [note] = await sql`SELECT user_id FROM application_notes WHERE note_id = ${noteId}`;
  if (!note) throw new ErrorHandler(404, "Note not found");
  if (note.user_id !== userId) throw new ErrorHandler(403, "Forbidden");

  await sql`DELETE FROM application_notes WHERE note_id = ${noteId}`;
  res.json({ message: "Note deleted" });
});
