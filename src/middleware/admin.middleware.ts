import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export function requireRole(...roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                message: "Authentication required",
                code: "AUTH_REQUIRED",
            });
            return;
        }
        
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                message: "Insufficient permissions",
                code: "FORBIDDEN",
                details: `Required roles: ${roles.join(" or ")}`,
            });
            return;
        }

        next();
    };
}