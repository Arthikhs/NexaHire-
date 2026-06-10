import express from "express";
import cors from "cors";
import questionsRoutes from "./routes/questions.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/questions", questionsRoutes);
export default app;
