import { Router } from "express";
import { FavoriteController } from "../controllers/favorite.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const controller = new FavoriteController();

router.get("/", authenticate, controller.getUserFavorites.bind(controller));

router.post("/:jobId", authenticate, controller.addFavorite.bind(controller));

router.delete("/:jobId", authenticate, controller.removeFavorite.bind(controller));

export default router;