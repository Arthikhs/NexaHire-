import { AuthenticatedRequest } from "../middlewares/auth.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

const DEFAULT_COLUMNS = [
  { title: "Wishlist",   color: "#6b7280", position: 0 },
  { title: "Applied",    color: "#3b82f6", position: 1 },
  { title: "Interview",  color: "#f59e0b", position: 2 },
  { title: "Offer",      color: "#10b981", position: 3 },
  { title: "Rejected",   color: "#ef4444", position: 4 },
];

export const getKanban = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.user_id;

  // auto-create default columns on first visit
  let columns = await sql`SELECT * FROM kanban_columns WHERE user_id = ${userId} ORDER BY position`;
  if (columns.length === 0) {
    for (const col of DEFAULT_COLUMNS) {
      await sql`INSERT INTO kanban_columns (user_id, title, color, position) VALUES (${userId}, ${col.title}, ${col.color}, ${col.position})`;
    }
    columns = await sql`SELECT * FROM kanban_columns WHERE user_id = ${userId} ORDER BY position`;
  }

  // fetch cards with application details
  const cards = await sql`
    SELECT kc.card_id, kc.column_id, kc.position, kc.application_id,
           a.status, a.applied_at, j.title AS job_title, j.location,
           j.job_type, c.name AS company_name, c.logo AS company_logo
    FROM kanban_cards kc
    JOIN applications a ON kc.application_id = a.application_id
    JOIN jobs j ON a.job_id = j.job_id
    JOIN companies c ON j.company_id = c.company_id
    WHERE a.applicant_id = ${userId}
    ORDER BY kc.column_id, kc.position
  `;

  // group cards by column
  const board = columns.map((col: any) => ({
    ...col,
    cards: cards.filter((card: any) => card.column_id === col.column_id),
  }));

  res.json(board);
});

export const createColumn = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.user_id;
  const { title, color } = req.body;
  if (!title?.trim()) throw new ErrorHandler(400, "Column title is required");

  const [{ max_pos }] = await sql`SELECT COALESCE(MAX(position), -1)::int AS max_pos FROM kanban_columns WHERE user_id = ${userId}`;

  const [col] = await sql`
    INSERT INTO kanban_columns (user_id, title, color, position)
    VALUES (${userId}, ${title.trim()}, ${color ?? "#3b82f6"}, ${max_pos + 1})
    RETURNING *
  `;
  res.status(201).json({ message: "Column created", column: col });
});

export const updateColumn = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.user_id;
  const { columnId } = req.params;
  const { title, color } = req.body;

  const [col] = await sql`SELECT user_id FROM kanban_columns WHERE column_id = ${columnId}`;
  if (!col) throw new ErrorHandler(404, "Column not found");
  if (col.user_id !== userId) throw new ErrorHandler(403, "Forbidden");

  const [updated] = await sql`
    UPDATE kanban_columns
    SET title = COALESCE(${title ?? null}, title),
        color = COALESCE(${color ?? null}, color)
    WHERE column_id = ${columnId}
    RETURNING *
  `;
  res.json({ message: "Column updated", column: updated });
});

export const deleteColumn = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.user_id;
  const { columnId } = req.params;

  const [col] = await sql`SELECT user_id FROM kanban_columns WHERE column_id = ${columnId}`;
  if (!col) throw new ErrorHandler(404, "Column not found");
  if (col.user_id !== userId) throw new ErrorHandler(403, "Forbidden");

  await sql`DELETE FROM kanban_columns WHERE column_id = ${columnId}`;
  res.json({ message: "Column deleted" });
});

export const moveCard = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.user_id;
  const { cardId, toColumnId, position } = req.body;

  if (!cardId || !toColumnId || position === undefined)
    throw new ErrorHandler(400, "cardId, toColumnId and position are required");

  // verify column belongs to user
  const [col] = await sql`SELECT user_id FROM kanban_columns WHERE column_id = ${toColumnId}`;
  if (!col) throw new ErrorHandler(404, "Column not found");
  if (col.user_id !== userId) throw new ErrorHandler(403, "Forbidden");

  const [card] = await sql`
    UPDATE kanban_cards SET column_id = ${toColumnId}, position = ${position}
    WHERE card_id = ${cardId}
    RETURNING *
  `;
  if (!card) throw new ErrorHandler(404, "Card not found");
  res.json({ message: "Card moved", card });
});

// Auto-add card when application is created (called internally or via webhook)
export const addCardToKanban = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.user_id;
  const { applicationId } = req.body;

  // put in "Applied" column
  const [appliedCol] = await sql`
    SELECT column_id FROM kanban_columns
    WHERE user_id = ${userId} AND title = 'Applied'
    LIMIT 1
  `;

  if (!appliedCol) { res.json({ message: "No Applied column found" }); return; }

  const [{ max_pos }] = await sql`
    SELECT COALESCE(MAX(position), -1)::int AS max_pos FROM kanban_cards WHERE column_id = ${appliedCol.column_id}
  `;

  await sql`
    INSERT INTO kanban_cards (application_id, column_id, position)
    VALUES (${applicationId}, ${appliedCol.column_id}, ${max_pos + 1})
    ON CONFLICT (application_id) DO NOTHING
  `;

  res.status(201).json({ message: "Card added to Kanban" });
});
