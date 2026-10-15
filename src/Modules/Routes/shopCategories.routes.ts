import { Router } from "express";
import { ShopCategoryController } from "../../Modules/Controllers/shopCategories.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
const shopCategoryController = new ShopCategoryController();

// Public — no auth, only active categories (mounted so this becomes /api/shop-categories/public)
router.get("/public", (req, res) => shopCategoryController.getPublicAll(req, res));

// Admin — protected
router.get("/", authenticate, (req, res) => shopCategoryController.getAll(req, res));
router.get("/:id", authenticate, (req, res) => shopCategoryController.getOne(req, res));
router.post("/", authenticate, (req, res) => shopCategoryController.create(req, res));
router.put("/:id", authenticate, (req, res) => shopCategoryController.update(req, res));
router.delete("/:id", authenticate, (req, res) => shopCategoryController.delete(req, res));

export default router;