import { Request, Response, NextFunction } from "express";

export type UserRole = "ADMIN" | "MANAGER" | "OFFICER" | "VIEWER";

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & {
      user?: {
        id: number;
        email: string;
        role: UserRole;
      };
    }).user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};
