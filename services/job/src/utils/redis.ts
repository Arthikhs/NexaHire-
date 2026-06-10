import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

export const redisClient = createClient({ url: process.env.Redis_url });

redisClient.connect()
  .then(() => console.log("Job service connected to Redis"))
  .catch(console.error);
