import express from "express";
import cors from "cors";
import messagingRoutes from "./routes/messaging.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/messaging", messagingRoutes);
export default app;
