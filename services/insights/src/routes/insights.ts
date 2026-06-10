import express from "express";
import { isAuth } from "../middlewares/auth.js";
import { submitSalary, searchSalary, getSalaryTrends, getCompanyInsights, submitReview, getReviews } from "../controllers/insights.js";

const router = express.Router();

router.get("/salary", searchSalary);
router.get("/salary/trends", getSalaryTrends);
router.post("/salary", isAuth, submitSalary);
router.get("/company/:companyName", getCompanyInsights);
router.post("/company/:companyId/review", isAuth, submitReview);
router.get("/company/:companyId/reviews", getReviews);

export default router;
