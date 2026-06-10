import express from "express";
import { isAuth } from "../middlewares/auth.js";
import { getPersonalizedFeed, getTrendingJobs, getTrendingCompanies, getRecentJobs } from "../controllers/feed.js";

const router = express.Router();

router.get("/personalized", isAuth, getPersonalizedFeed);
router.get("/trending", getTrendingJobs);
router.get("/trending-companies", getTrendingCompanies);
router.get("/recent", getRecentJobs);

export default router;
