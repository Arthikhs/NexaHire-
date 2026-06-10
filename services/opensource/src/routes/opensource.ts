import express from "express";
import { isAuth } from "../middlewares/auth.js";
import { getProjects, addProject, deleteProject } from "../controllers/opensource.js";

const router = express.Router();

router.get("/projects", getProjects);
router.post("/projects", isAuth, addProject);
router.delete("/projects/:id", isAuth, deleteProject);

export default router;
