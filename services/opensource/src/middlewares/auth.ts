import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { sql } from "../utils/db.js";

interface User {
  user_id: number;
  name: string;
  email: string;
  role: "jobseeker" | "recruiter";
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ message: "Authorization header missing or invalid" });
      return;
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SEC as string) as JwtPayload;
    if (!decoded?.id) { res.status(401).json({ message: "Invalid token" }); return; }

    const [user] = await sql`SELECT user_id, name, email, role FROM users WHERE user_id = ${decoded.id}`;
    if (!user) { res.status(401).json({ message: "User not found" }); return; }
    req.user = user as User;
    next();
  } catch {
    res.status(401).json({ message: "Authentication failed" });
  }
};
