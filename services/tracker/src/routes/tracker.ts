import express from "express";
import { isAuth } from "../middlewares/auth.js";
import { getDashboardStats } from "../controllers/stats.js";
import { getNotes, addNote, deleteNote } from "../controllers/notes.js";
import { getReminders, addReminder, deleteReminder } from "../controllers/reminders.js";
import {
  getKanban, createColumn, updateColumn, deleteColumn,
  moveCard, addCardToKanban,
} from "../controllers/kanban.js";

const router = express.Router();

router.get("/stats", isAuth, getDashboardStats);

router.get("/kanban", isAuth, getKanban);
router.post("/kanban/column", isAuth, createColumn);
router.put("/kanban/column/:columnId", isAuth, updateColumn);
router.delete("/kanban/column/:columnId", isAuth, deleteColumn);
router.post("/kanban/move", isAuth, moveCard);
router.post("/kanban/card", isAuth, addCardToKanban);

router.get("/notes/:applicationId", isAuth, getNotes);
router.post("/notes/:applicationId", isAuth, addNote);
router.delete("/notes/:noteId", isAuth, deleteNote);

router.get("/reminders", isAuth, getReminders);
router.post("/reminders/:applicationId", isAuth, addReminder);
router.delete("/reminders/:reminderId", isAuth, deleteReminder);

export default router;
