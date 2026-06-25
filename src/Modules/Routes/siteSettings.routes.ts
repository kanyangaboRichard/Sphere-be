import { Router } from "express";
import { SiteSettingsController } from "../Controllers/siteSettings.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { UserRole } from "../../Entities/Users";

const router = Router();
const siteSettingsController = new SiteSettingsController();

// Public — website reads settings
router.get("/", (req, res) => siteSettingsController.get(req, res));

// Protected — only admins can change settings
router.put("/", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => siteSettingsController.update(req, res));
router.patch("/theme", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => siteSettingsController.updateTheme(req, res));
router.patch("/features", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => siteSettingsController.updateFeatures(req, res));
router.patch("/social", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => siteSettingsController.updateSocial(req, res));
router.patch("/seo", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => siteSettingsController.updateSEO(req, res));
router.patch("/reset", authenticate, authorize(UserRole.SUPER_ADMIN), (req, res) => siteSettingsController.resetToDefaults(req, res));

export default router;