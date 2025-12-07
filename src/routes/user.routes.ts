import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const controller = new UserController();

router.get("/profile", authenticate, controller.getUserProfile.bind(controller));

router.put("/profile", authenticate, controller.updateUserProfile.bind(controller));

export default router;