import express from "express";
import { isAuth } from "../middlewares/auth.js";
import uploadFile from "../middlewares/multer.js";
import {
  createCompany,
  createJob,
  deleteCompany,
  getAllActiveJobs,
  getAllApplicationForJob,
  getAllCompany,
  getCompanyDetails,
  getRecruiterStats,
  getSavedJobs,
  getSingleJob,
  getTopViewedJobs,
  saveJob,
  unsaveJob,
  updateApplication,
  updateJob,
} from "../controllers/job.js";
import { deleteReview, getCompanyReviews, postReview } from "../controllers/review.js";
import { getNotifications, markAllAsRead, markAsRead } from "../controllers/notification.js";
import { getMyAlert, upsertAlert, deleteAlert, toggleAlert, getMatchedJobs } from "../controllers/alerts.js";

const router = express.Router();

router.get("/alerts/my", isAuth, getMyAlert);
router.post("/alerts", isAuth, upsertAlert);
router.delete("/alerts", isAuth, deleteAlert);
router.put("/alerts/toggle", isAuth, toggleAlert);
router.get("/alerts/matched", isAuth, getMatchedJobs);

router.get("/notifications", isAuth, getNotifications);
router.put("/notifications/read-all", isAuth, markAllAsRead);
router.put("/notifications/:id/read", isAuth, markAsRead);

router.get("/recruiter/stats", isAuth, getRecruiterStats);

router.get("/saved/all", isAuth, getSavedJobs);
router.post("/save/:jobId", isAuth, saveJob);
router.delete("/save/:jobId", isAuth, unsaveJob);

router.get("/company/:companyId/reviews", getCompanyReviews);
router.post("/company/:companyId/reviews", isAuth, postReview);
router.delete("/review/:reviewId", isAuth, deleteReview);

router.post("/company/new", isAuth, uploadFile, createCompany);
router.delete("/company/:companyId", isAuth, deleteCompany);
router.post("/new", isAuth, createJob);
router.put("/:jobId", isAuth, updateJob);
router.get("/company/all", isAuth, getAllCompany);
router.get("/company/:id", getCompanyDetails);
router.get("/all", getAllActiveJobs);
router.get("/:jobId", getSingleJob);
router.get("/application/:jobId", isAuth, getAllApplicationForJob);
router.put("/application/update/:id", isAuth, updateApplication);

export default router;
