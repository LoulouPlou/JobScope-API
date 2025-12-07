import {  Response, NextFunction } from "express";
import { adminService } from "../services/admin.service";
import { AuthRequest } from "../middleware/auth.middleware";

export class AdminController {
    async getAllUsers(req: AuthRequest , res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 5;
            const users = await adminService.getAllUsers(page, limit);
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }  

    async getUserInfo(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            const user = await adminService.infoUser(userId);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req: AuthRequest , res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            const data = req.body;
            const updatedUser = await adminService.updateUser(userId, data);
            res.status(200).json(updatedUser);
        } catch (error) {
            next(error);
        }
    }
    
    async deleteUser(req: AuthRequest , res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.params.id;
            await adminService.deleteUser(userId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}