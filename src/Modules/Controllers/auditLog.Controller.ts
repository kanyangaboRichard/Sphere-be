import { Request, Response } from "express";
import { AuditLogService } from "../Services/auditLog.services";
import { AuditAction, AuditEntity } from "../../Entities/Auditlog";

const auditLogService = new AuditLogService();

export class AuditLogController {

  async getAll(req: Request, res: Response) {
    try {
      const { action, entity, entityId, performedById, from, to, page, limit } = req.query;
      const result = await auditLogService.getAll({
        action: action as AuditAction,
        entity: entity as AuditEntity,
        entityId: entityId as string,
        performedById: performedById as string,
        from: from ? new Date(from as string) : undefined,
        to: to ? new Date(to as string) : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const log = await auditLogService.getOne(req.params.id as string);
      res.status(200).json({ success: true, data: log });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getByEntity(req: Request, res: Response) {
    try {
      const { entity, entityId } = req.params;
      const logs = await auditLogService.getByEntity(entity as AuditEntity, entityId as string);
      res.status(200).json({ success: true, data: logs });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getByUser(req: Request, res: Response) {
    try {
      const { page, limit } = req.query;
      const result = await auditLogService.getByUser(
        req.params.userId as string,
        page ? Number(page) : 1,
        limit ? Number(limit) : 20
      );
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getRecentActivity(req: Request, res: Response) {
    try {
      const { limit } = req.query;
      const logs = await auditLogService.getRecentActivity(limit ? Number(limit) : 10);
      res.status(200).json({ success: true, data: logs });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await auditLogService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async clearOldLogs(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id as string;
      const { daysOld } = req.body;
      const result = await auditLogService.clearOldLogs(daysOld || 90, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}