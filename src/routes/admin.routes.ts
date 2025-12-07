import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { requireRole } from "../middleware/admin.middleware";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const controller = new AdminController();

router.get("/users", authenticate, requireRole("admin"), controller.getAllUsers.bind(controller));

router.get("/users/:id", authenticate, requireRole("admin"), controller.getUserInfo.bind(controller));

router.put("/users/:id", authenticate, requireRole("admin"), controller.updateUser.bind(controller));

router.delete("/users/:id", authenticate, requireRole("admin"), controller.deleteUser.bind(controller));

export default router;
