import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {UserService} from "../services/user.service";
import { userSchema } from "../middleware/validation.middleware";

export class UserController {
    async getUserProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;
            const userProfile = await UserService.getUserByProfile(String(userId));
            res.status(200).json(userProfile);
        } catch (error) {
            next(error);
        }
    }
    
    async updateUserProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;
            const newData = userSchema.parse(req.body); 
            const updatedProfile = await UserService.putUserByProfile(String(userId), newData);
            res.status(200).json(updatedProfile);
        } catch (error) {
            next(error);
        }
    }
}