import express from "express";
import cors from "cors";
import opensourceRoutes from "./routes/opensource.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/opensource", opensourceRoutes);
export default app;
