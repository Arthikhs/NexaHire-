import express from "express";
import cors from "cors";
import referralRoutes from "./routes/referral.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/referral", referralRoutes);
export default app;
