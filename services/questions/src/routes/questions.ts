import express from "express";
import { isAuth } from "../middlewares/auth.js";
import {
  getQuestions, getSingleQuestion, addQuestion,
  getCategories, getCompanies, voteQuestion,
} from "../controllers/questions.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/companies", getCompanies);
router.get("/", getQuestions);
router.get("/:questionId", getSingleQuestion);
router.post("/", isAuth, addQuestion);
router.post("/:questionId/vote", isAuth, voteQuestion);

export default router;
