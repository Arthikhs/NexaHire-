import dotenv from "dotenv";
dotenv.config();
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import { parse } from "url";
import app from "./app.js";
import { sql } from "./utils/db.js";
import { verifyWsToken } from "./middlewares/auth.js";

// Map userId -> WebSocket
const clients = new Map<number, WebSocket>();

async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        conversation_id SERIAL PRIMARY KEY,
        user1_id        INTEGER NOT NULL,
        user2_id        INTEGER NOT NULL,
        last_message    TEXT,
        last_message_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user1_id, user2_id),
        CHECK (user1_id < user2_id)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_users ON conversations(user1_id, user2_id)`;

    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        message_id      SERIAL PRIMARY KEY,
        conversation_id INTEGER NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
        sender_id       INTEGER NOT NULL,
        content         TEXT NOT NULL,
        is_read         BOOLEAN DEFAULT false,
        created_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at)`;
    console.log("✅ Messaging DB tables ready");
  } catch (error) {
    console.error("❌ Messaging DB init failed", error);
    process.exit(1);
  }
}

initDB().then(() => {
  const server = http.createServer(app);

  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws, req) => {
    const { query } = parse(req.url || "", true);
    const token = query.token as string;
    const decoded = verifyWsToken(token);
    if (!decoded?.id) { ws.close(1008, "Unauthorized"); return; }

    const userId = decoded.id as number;
    clients.set(userId, ws);

    ws.on("message", async (raw) => {
      try {
        const { conversation_id, content } = JSON.parse(raw.toString());
        if (!conversation_id || !content?.trim()) return;

        const [conv] = await sql`SELECT * FROM conversations WHERE conversation_id = ${conversation_id} AND (user1_id = ${userId} OR user2_id = ${userId})`;
        if (!conv) return;

        const [message] = await sql`
          INSERT INTO messages (conversation_id, sender_id, content)
          VALUES (${conversation_id}, ${userId}, ${content.trim()})
          RETURNING *
        `;
        await sql`UPDATE conversations SET last_message = ${content.trim()}, last_message_at = NOW() WHERE conversation_id = ${conversation_id}`;

        // Deliver to both users if online
        const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
        const payload = JSON.stringify({ type: "message", data: { ...message, conversation_id } });

        ws.send(payload);
        const otherWs = clients.get(otherUserId);
        if (otherWs?.readyState === WebSocket.OPEN) otherWs.send(payload);
      } catch { }
    });

    ws.on("close", () => clients.delete(userId));
  });

  server.listen(process.env.PORT, () => {
    console.log(`Messaging service running on http://localhost:${process.env.PORT}`);
  });
});
