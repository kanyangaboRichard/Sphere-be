import { Router } from "express";
import { VideoController } from "../Controllers/videos.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { UserRole } from "../../Entities/Users";

const router = Router();
const videoController = new VideoController();

// Public
router.get("/featured", (req, res) => videoController.getFeatured(req, res));
router.get("/placement/:placement", (req, res) => videoController.getByPlacement(req, res));
router.get("/:id", (req, res) => videoController.getOne(req, res));

// Protected
router.get("/", authenticate, (req, res) => videoController.getAll(req, res));
router.post("/", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => videoController.create(req, res));
router.put("/:id", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => videoController.update(req, res));
router.patch("/:id/toggle-status", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => videoController.toggleStatus(req, res));
router.patch("/:id/set-featured", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => videoController.setFeatured(req, res));
router.patch("/reorder", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => videoController.reorder(req, res));
router.delete("/:id", authenticate, authorize(UserRole.SUPER_ADMIN), (req, res) => videoController.delete(req, res));

export default router;