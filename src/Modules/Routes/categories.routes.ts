import { Router } from "express";
import { CategoryController } from "../../Modules/Controllers/categories.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { UserRole } from "../../Entities/Users";

const router = Router();
const categoryController = new CategoryController();

// Public
router.get("/", (req, res) => categoryController.getAll(req, res));
router.get("/slug/:slug", (req, res) => categoryController.getBySlug(req, res));
router.get("/:id", (req, res) => categoryController.getOne(req, res));

// Protected
router.post("/", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => categoryController.create(req, res));
router.put("/:id", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => categoryController.update(req, res));
router.delete("/:id", authenticate, authorize(UserRole.SUPER_ADMIN), (req, res) => categoryController.delete(req, res));
router.patch("/:id/toggle-status", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => categoryController.toggleStatus(req, res));
router.patch("/reorder", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => categoryController.reorder(req, res));

export default router;