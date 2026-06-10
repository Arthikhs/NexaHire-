import express from "express";
import cors from "cors";
import insightsRoutes from "./routes/insights.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/insights", insightsRoutes);
export default app;
