import { Router, Request, Response, NextFunction } from "express";
import { AuditLogController } from "../Controllers/auditLog.Controller";
import { AuditLogService } from "../Services/auditLog.services";
import { authenticate, authorize, requireAdmin } from "../../middleware/auth.middleware";
import { UserRole } from "../../Entities/Users";
import { AuditAction, AuditEntity } from "../../Entities/Auditlog";

const router = Router();
const auditLogController = new AuditLogController();
const auditLogService = new AuditLogService();

// Admins only. Role is checked in the database, not the token.
router.use(authenticate, requireAdmin);

// ── Query helpers for GET / ──
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

const date = (v: unknown, endOfDay = false) => {
  const s = str(v);
  if (!s) return undefined;
  const d = new Date(endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T23:59:59.999` : s);
  return isNaN(d.getTime()) ? undefined : d;
};

const oneOf = <T extends string>(values: Record<string, T>, v: unknown) => {
  const s = str(v);
  return s && (Object.values(values) as string[]).includes(s) ? (s as T) : undefined;
};

// GET /api/audit-logs?page=1&limit=25&action=UPDATE&entity=USER&search=jean&from=2026-11-01&to=2026-11-02
// Paged list for the Audit Logs page
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await auditLogService.list({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 25,
      action: oneOf(AuditAction, req.query.action),
      entity: oneOf(AuditEntity, req.query.entity),
      search: str(req.query.search),
      from: date(req.query.from),
      to: date(req.query.to, true),
    });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// Existing endpoints, unchanged
router.get("/recent", (req, res) => auditLogController.getRecentActivity(req, res));
router.get("/stats", (req, res) => auditLogController.getStats(req, res));
router.get("/entity/:entity/:entityId", (req, res) => auditLogController.getByEntity(req, res));
router.get("/user/:userId", (req, res) => auditLogController.getByUser(req, res));
router.delete("/clear", authorize(UserRole.SUPER_ADMIN), (req, res) => auditLogController.clearOldLogs(req, res));
router.get("/:id", (req, res) => auditLogController.getOne(req, res)); // keep last: "/:id" matches anything

export default router;