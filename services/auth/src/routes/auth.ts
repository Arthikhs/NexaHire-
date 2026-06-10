import express from "express";
import {
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
} from "../controllers/auth.js";
import uploadFile from "../middleware/multer.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// 10 requests per 60 seconds per IP
router.post("/register", rateLimiter(10, 60), uploadFile, registerUser);
router.post("/login", rateLimiter(10, 60), loginUser);
router.post("/forgot", forgotPassword);
router.post("/reset/:token", resetPassword);

export default router;
