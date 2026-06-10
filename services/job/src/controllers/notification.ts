import { AuthenticatedRequest } from "../middlewares/auth.js";
import { sql } from "../utils/db.js";
import { TryCatch } from "../utils/TryCatch.js";

export const getNotifications = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const notifications = await sql`
    SELECT * FROM notifications WHERE user_id = ${user.user_id}
    ORDER BY created_at DESC LIMIT 30
  `;
  const [{ count }] = await sql`
    SELECT COUNT(*)::int AS count FROM notifications
    WHERE user_id = ${user.user_id} AND is_read = false
  `;
  res.json({ notifications, unreadCount: count });
});

export const markAsRead = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { id } = req.params;
  await sql`
    UPDATE notifications SET is_read = true
    WHERE notification_id = ${id} AND user_id = ${user.user_id}
  `;
  res.json({ message: "Marked as read" });
});

export const markAllAsRead = TryCatch(async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  await sql`UPDATE notifications SET is_read = true WHERE user_id = ${user.user_id}`;
  res.json({ message: "All marked as read" });
});
