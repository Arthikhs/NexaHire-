import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

export const redisClient = createClient({ url: process.env.Redis_url });
redisClient.on("error", (err) => console.error("Redis error", err));
redisClient.connect();
