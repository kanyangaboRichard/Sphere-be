import { Router } from "express";
import { AuthorController } from "../Controllers/author.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { UserRole } from "../../Entities/Users";

const router = Router();
const authorController = new AuthorController();

// Public
router.get("/columnists", (req, res) => authorController.getColumnists(req, res));
router.get("/:id", (req, res) => authorController.getOne(req, res));

// Protected
router.get("/", authenticate, (req, res) => authorController.getAll(req, res));
router.post("/", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => authorController.create(req, res));
router.put("/:id", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => authorController.update(req, res));
router.patch("/:id/toggle-status", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => authorController.toggleStatus(req, res));
router.delete("/:id", authenticate, authorize(UserRole.SUPER_ADMIN), (req, res) => authorController.delete(req, res));

export default router;