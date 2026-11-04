import { Router, Request, Response, NextFunction } from "express";
import { authenticate, requireAdmin, getUserId } from "../../middleware/auth.middleware";
import { UserService, HttpError } from "../Services/users.services";

const router = Router();
const service = new UserService();

// Every route in this file is admin-only
router.use(authenticate, requireAdmin);

const handle =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (err) {
      if (err instanceof HttpError) {
        return res.status(err.status).json({ success: false, message: err.message });
      }
      next(err);
    }
  };

// GET /api/users: active users
router.get("/", handle(async (_req, res) => {
  res.json({ success: true, data: await service.list() });
}));

// GET /api/users/trash: users in Trash
router.get("/trash", handle(async (_req, res) => {
  res.json({ success: true, data: await service.listTrash() });
}));

// PATCH /api/users/:id/role  body: { isAdmin: true | false }
router.patch("/:id/role", handle(async (req, res) => {
  const { isAdmin } = req.body ?? {};
  if (typeof isAdmin !== "boolean") {
    return res.status(400).json({ success: false, message: "isAdmin (true/false) is required" });
  }
  const user = await service.setAdmin(String(req.params.id), isAdmin, getUserId(req)!);
  res.json({ success: true, data: user });
}));

// DELETE /api/users/:id: move to Trash
router.delete("/:id", handle(async (req, res) => {
  await service.moveToTrash(String(req.params.id), getUserId(req)!);
  res.json({ success: true, message: "User moved to Trash" });
}));

// POST /api/users/:id/restore: restore from Trash
router.post("/:id/restore", handle(async (req, res) => {
  await service.restore(String(req.params.id), getUserId(req)!);
  res.json({ success: true, message: "User restored" });
}));

// DELETE /api/users/:id/permanent: delete for good (must be in Trash)
router.delete("/:id/permanent", handle(async (req, res) => {
  await service.deletePermanently(String(req.params.id), getUserId(req)!);
  res.json({ success: true, message: "User permanently deleted" });
}));

export default router;