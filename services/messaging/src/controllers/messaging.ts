import { AuthenticatedRequest } from "../middlewares/auth.js";
import { sql } from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

// GET /api/messaging/conversations
export const getConversations = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.user_id;
  const conversations = await sql`
    SELECT
      c.conversation_id,
      CASE WHEN c.user1_id = ${userId} THEN c.user2_id ELSE c.user1_id END AS other_user_id,
      CASE WHEN c.user1_id = ${userId} THEN u2.name ELSE u1.name END AS other_user_name,
      CASE WHEN c.user1_id = ${userId} THEN u2.profile_pic ELSE u1.profile_pic END AS other_user_pic,
      CASE WHEN c.user1_id = ${userId} THEN u2.role ELSE u1.role END AS other_user_role,
      c.last_message,
      c.last_message_at,
      (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.conversation_id AND m.sender_id != ${userId} AND m.is_read = false) AS unread_count
    FROM conversations c
    JOIN users u1 ON c.user1_id = u1.user_id
    JOIN users u2 ON c.user2_id = u2.user_id
    WHERE c.user1_id = ${userId} OR c.user2_id = ${userId}
    ORDER BY c.last_message_at DESC NULLS LAST
  `;
  res.json(conversations);
});

// GET /api/messaging/messages/:conversationId
export const getMessages = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { conversationId } = req.params;
  const userId = req.user!.user_id;

  const [conv] = await sql`SELECT * FROM conversations WHERE conversation_id = ${conversationId} AND (user1_id = ${userId} OR user2_id = ${userId})`;
  if (!conv) throw new ErrorHandler(403, "Forbidden");

  const messages = await sql`
    SELECT * FROM messages WHERE conversation_id = ${conversationId} ORDER BY created_at ASC
  `;

  // Mark as read
  await sql`UPDATE messages SET is_read = true WHERE conversation_id = ${conversationId} AND sender_id != ${userId} AND is_read = false`;

  res.json(messages);
});

// POST /api/messaging/start  – start a new conversation
export const startConversation = TryCatch(async (req: AuthenticatedRequest, res) => {
  const senderId = req.user!.user_id;
  const { recipient_id, content } = req.body;
  if (!recipient_id || !content?.trim()) throw new ErrorHandler(400, "recipient_id and content are required");
  if (senderId === Number(recipient_id)) throw new ErrorHandler(400, "Cannot message yourself");

  // Check if conversation already exists
  const user1 = Math.min(senderId, Number(recipient_id));
  const user2 = Math.max(senderId, Number(recipient_id));

  let [conv] = await sql`SELECT * FROM conversations WHERE user1_id = ${user1} AND user2_id = ${user2}`;

  if (!conv) {
    [conv] = await sql`
      INSERT INTO conversations (user1_id, user2_id, last_message, last_message_at)
      VALUES (${user1}, ${user2}, ${content.trim()}, NOW())
      RETURNING *
    `;
  }

  const [message] = await sql`
    INSERT INTO messages (conversation_id, sender_id, content)
    VALUES (${conv.conversation_id}, ${senderId}, ${content.trim()})
    RETURNING *
  `;

  await sql`UPDATE conversations SET last_message = ${content.trim()}, last_message_at = NOW() WHERE conversation_id = ${conv.conversation_id}`;

  // Build response conversation object
  const [recipient] = await sql`SELECT user_id, name, profile_pic, role FROM users WHERE user_id = ${recipient_id}`;
  const conversation = {
    conversation_id: conv.conversation_id,
    other_user_id: recipient.user_id,
    other_user_name: recipient.name,
    other_user_pic: recipient.profile_pic,
    other_user_role: recipient.role,
    last_message: content.trim(),
    last_message_at: new Date().toISOString(),
    unread_count: 0,
  };

  res.status(201).json({ message: "Conversation started", conversation, first_message: message });
});

// POST /api/messaging/send
export const sendMessage = TryCatch(async (req: AuthenticatedRequest, res) => {
  const senderId = req.user!.user_id;
  const { conversation_id, content } = req.body;
  if (!conversation_id || !content?.trim()) throw new ErrorHandler(400, "conversation_id and content are required");

  const [conv] = await sql`SELECT * FROM conversations WHERE conversation_id = ${conversation_id} AND (user1_id = ${senderId} OR user2_id = ${senderId})`;
  if (!conv) throw new ErrorHandler(403, "Forbidden");

  const [message] = await sql`
    INSERT INTO messages (conversation_id, sender_id, content)
    VALUES (${conversation_id}, ${senderId}, ${content.trim()})
    RETURNING *
  `;

  await sql`UPDATE conversations SET last_message = ${content.trim()}, last_message_at = NOW() WHERE conversation_id = ${conversation_id}`;

  res.status(201).json({ message: "Sent", data: message });
});

// GET /api/messaging/users/search?q=...
export const searchUsers = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { q } = req.query as { q: string };
  if (!q?.trim()) { res.json([]); return; }

  const users = await sql`
    SELECT user_id, name, email, role, profile_pic FROM users
    WHERE (name ILIKE ${"%" + q + "%"} OR email ILIKE ${"%" + q + "%"})
    AND user_id != ${req.user!.user_id}
    LIMIT 10
  `;
  res.json(users);
});
