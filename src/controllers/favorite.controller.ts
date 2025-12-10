import {  Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { FavoriteService } from "../services/favorite.service";

export class FavoriteController {
    async getUserFavorites(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
        const userId = req.user!._id.toString();

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const favorites = await FavoriteService.getUserFavorites(userId, page, limit);

        res.status(200).json(favorites);

    } catch (error) {
        next(error);
    }
}


    async addFavorite(req: AuthRequest , res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;
            const { jobId } = req.params;
            const favorite = await FavoriteService.addFavorite(String(userId), jobId);
            res.status(201).json(favorite);

        } catch (error) {
            next(error);
        }
    }
    
    async removeFavorite(req: AuthRequest , res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?._id;
            const { jobId } = req.params;
            await FavoriteService.removeFavorite(String(userId), jobId);
            res.status(204).send();

        } catch (error) {
            next(error);
        }
    }
}
