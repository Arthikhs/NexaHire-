import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { sql } from "../utils/db.js";

interface User { user_id: number; name: string; role: "jobseeker" | "recruiter"; skills: string[]; }
export interface AuthenticatedRequest extends Request { user?: User; }

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ message: "Authorization header missing" }); return; }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SEC as string) as JwtPayload;
    if (!decoded?.id) { res.status(401).json({ message: "Invalid token" }); return; }
    const users = await sql`
      SELECT u.user_id, u.name, u.role,
        ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS skills
      FROM users u
      LEFT JOIN user_skills us ON u.user_id = us.user_id
      LEFT JOIN skills s ON us.skill_id = s.skill_id
      WHERE u.user_id = ${decoded.id}
      GROUP BY u.user_id
    `;
    if (!users[0]) { res.status(401).json({ message: "User not found" }); return; }
    const user = users[0] as User;
    user.skills = user.skills || [];
    req.user = user;
    next();
  } catch { res.status(401).json({ message: "Authentication failed" }); }
};
