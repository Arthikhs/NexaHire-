import express from "express";
import cors from "cors";
import trackerRoutes from "./routes/tracker.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/tracker", trackerRoutes);
export default app;
