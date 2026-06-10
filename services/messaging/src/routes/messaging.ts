import express from "express";
import { isAuth } from "../middlewares/auth.js";
import { getConversations, getMessages, startConversation, sendMessage, searchUsers } from "../controllers/messaging.js";

const router = express.Router();

router.get("/conversations", isAuth, getConversations);
router.get("/messages/:conversationId", isAuth, getMessages);
router.post("/start", isAuth, startConversation);
router.post("/send", isAuth, sendMessage);
router.get("/users/search", isAuth, searchUsers);

export default router;
