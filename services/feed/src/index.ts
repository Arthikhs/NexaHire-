import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import "./utils/redis.js";

app.listen(process.env.PORT, () => {
  console.log(`Feed service running on http://localhost:${process.env.PORT}`);
});
