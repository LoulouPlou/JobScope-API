import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "config";
import { logger } from "../utils/logger";

export interface AuthRequest extends Request {
    user?: {
        _id: string;
        role: string;
    };
}

export function authenticate(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                message: "No token provided",
                code: "AUTH_REQUIRED",
            });
            return;
        }

        const token = authHeader.substring(7);
        const jwtSecret = config.get<string>("security.jwt.secret");

        const decoded = jwt.verify(token, jwtSecret) as {
            userId: string;
            role: string;
        };

        req.user = {
            _id: decoded.userId,
            role: decoded.role,
        };

        next();
    } catch (error) {
        logger.error("Authentication error:", error);
        res.status(401).json({
            message: "Invalid or expired token",
            code: "INVALID_TOKEN",
        });
    }
}
