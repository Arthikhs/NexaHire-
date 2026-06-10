import { AuthenticatedRequest } from "../middlewares/auth.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

export const getReminders = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.user_id;
  const reminders = await sql`
    SELECT r.*, j.title AS job_title, c.name AS company_name
    FROM application_reminders r
    JOIN applications a ON r.application_id = a.application_id
    JOIN jobs j ON a.job_id = j.job_id
    JOIN companies c ON j.company_id = c.company_id
    WHERE r.user_id = ${userId} AND r.is_sent = false
    ORDER BY r.remind_at ASC
  `;
  res.json(reminders);
});

export const addReminder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.user_id;
  const { applicationId } = req.params;
  const { remind_at, note } = req.body;

  if (!remind_at) throw new ErrorHandler(400, "remind_at is required");
  if (new Date(remind_at) <= new Date()) throw new ErrorHandler(400, "Reminder must be in the future");

  const [app] = await sql`SELECT applicant_id FROM applications WHERE application_id = ${applicationId}`;
  if (!app) throw new ErrorHandler(404, "Application not found");
  if (app.applicant_id !== userId) throw new ErrorHandler(403, "Forbidden");

  const [reminder] = await sql`
    INSERT INTO application_reminders (application_id, user_id, remind_at, note)
    VALUES (${applicationId}, ${userId}, ${remind_at}, ${note ?? null})
    RETURNING *
  `;
  res.status(201).json({ message: "Reminder set", reminder });
});

export const deleteReminder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.user_id;
  const { reminderId } = req.params;

  const [r] = await sql`SELECT user_id FROM application_reminders WHERE reminder_id = ${reminderId}`;
  if (!r) throw new ErrorHandler(404, "Reminder not found");
  if (r.user_id !== userId) throw new ErrorHandler(403, "Forbidden");

  await sql`DELETE FROM application_reminders WHERE reminder_id = ${reminderId}`;
  res.json({ message: "Reminder deleted" });
});
