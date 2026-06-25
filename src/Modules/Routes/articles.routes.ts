import { Router } from "express";
import { ArticleController } from "../Controllers/article.controllers";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { UserRole } from "../../Entities/Users";

const router = Router();
const articleController = new ArticleController();

// Public
router.get("/", (req, res) => articleController.getAll(req, res));
router.get("/stats", (req, res) => articleController.getStats(req, res));
router.get("/slug/:slug", (req, res) => articleController.getBySlug(req, res));
router.get("/:id", (req, res) => articleController.getOne(req, res));

// Protected
router.post("/", authenticate, (req, res) => articleController.create(req, res));
router.put("/:id", authenticate, (req, res) => articleController.update(req, res));
router.patch("/:id/publish", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => articleController.publish(req, res));
router.patch("/:id/unpublish", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => articleController.unpublish(req, res));
router.patch("/:id/schedule", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => articleController.schedule(req, res));
router.patch("/:id/archive", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => articleController.archive(req, res));
router.delete("/:id", authenticate, authorize(UserRole.SUPER_ADMIN), (req, res) => articleController.delete(req, res));

export default router;