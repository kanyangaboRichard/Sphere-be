import { Router } from "express";
import { ShopProductController } from "../../Modules/Controllers/shopProducts.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
const shopProductController = new ShopProductController();

// Public — no auth, only active products (mounted so this becomes /api/shop-products/public)
router.get("/public", (req, res) => shopProductController.getPublicAll(req, res));

// Admin — protected
router.get("/", authenticate, (req, res) => shopProductController.getAll(req, res));
router.get("/:id", authenticate, (req, res) => shopProductController.getOne(req, res));
router.post("/", authenticate, (req, res) => shopProductController.create(req, res));
router.put("/:id", authenticate, (req, res) => shopProductController.update(req, res));
router.delete("/:id", authenticate, (req, res) => shopProductController.delete(req, res));

export default router;