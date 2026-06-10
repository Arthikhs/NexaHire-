import express from "express";
import { isAuth } from "../middlewares/auth.js";
import { deleteExperience, getExperiences, postExperience } from "../controllers/experience.js";

const router = express.Router();

router.post("/", isAuth, postExperience);
router.get("/", getExperiences);
router.delete("/:id", isAuth, deleteExperience);

export default router;
