import { Router } from "express";
import { AuthController } from "../../Modules/Controllers/auth.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.get("/me", authenticate, (req, res) => authController.getMe(req, res));
router.post("/forgot-password", (req, res) => authController.forgotPassword(req, res));
router.post("/reset-password", (req, res) => authController.resetPassword(req, res));
router.post("/change-password", authenticate, (req, res) => authController.changePassword(req, res));

export default router;