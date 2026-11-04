import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../Config/database";
import { User, UserRole } from "../Entities/Users";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req as any).user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};

/** Reads the logged-in user's id from the JWT payload. */
export const getUserId = (req: Request): string | undefined => {
  const u = (req as any).user;
  return u?.id ?? u?.userId ?? u?.sub;
};

/**
 * Admin-only guard. Use after `authenticate`.
 * Checks the role in the database, not the token, so a demoted or
 * trashed admin loses access immediately. Trashed users are skipped
 * by findOne, so they're rejected too.
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
        select: { id: true, role: true },
    });

    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
      return res.status(403).json({ success: false, message: "Admins only" });
    }

    (req as any).user.role = user.role; // keep in sync with the database
    next();
  } catch (err) {
    next(err);
  }
};