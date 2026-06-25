import { Router } from "express";
import { AuditLogController } from "../Controllers/auditLog.Controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { UserRole } from "../../Entities/Users";

const router = Router();
const auditLogController = new AuditLogController();

// All audit log routes are protected — admins only
router.get("/", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => auditLogController.getAll(req, res));
router.get("/recent", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => auditLogController.getRecentActivity(req, res));
router.get("/stats", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => auditLogController.getStats(req, res));
router.get("/entity/:entity/:entityId", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => auditLogController.getByEntity(req, res));
router.get("/user/:userId", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => auditLogController.getByUser(req, res));
router.get("/:id", authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), (req, res) => auditLogController.getOne(req, res));
router.delete("/clear", authenticate, authorize(UserRole.SUPER_ADMIN), (req, res) => auditLogController.clearOldLogs(req, res));

export default router;