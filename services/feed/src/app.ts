import express from "express";
import cors from "cors";
import feedRoutes from "./routes/feed.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/feed", feedRoutes);
export default app;
