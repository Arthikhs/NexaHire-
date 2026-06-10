import express from "express";
import jobRoutes from "./routes/job.js";
import experienceRoutes from "./routes/experience.js";
import cors from "cors";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/job", jobRoutes);
app.use("/api/experience", experienceRoutes);

export default app;
