import { Request, Response, NextFunction } from "express";
import { redisClient } from "../index.js";

export function rateLimiter(maxRequests: number, windowSec: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress || "unknown";
    const key = `rate:${req.path}:${ip}`;

    const count = await redisClient.incr(key);
    if (count === 1) await redisClient.expire(key, windowSec);

    if (count > maxRequests) {
      res.status(429).json({ message: `Too many requests. Try again in ${windowSec} seconds.` });
      return;
    }
    next();
  };
}
