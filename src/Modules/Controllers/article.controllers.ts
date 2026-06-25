import { Request, Response } from "express";
import { ArticleService } from "../Services/articles.services";

const articleService = new ArticleService();

export class ArticleController {

  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const article = await articleService.create(req.body, userId);
      res.status(201).json({ success: true, data: article });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const result = await articleService.getAll({
        status: req.query.status as any,
        categoryId: req.query.categoryId as string,
        authorId: req.query.authorId as string,
        isFeatured: req.query.isFeatured === "true" ? true : undefined,
        isBreaking: req.query.isBreaking === "true" ? true : undefined,
        search: req.query.search as string,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const article = await articleService.getOne(req.params.id as string);
      res.status(200).json({ success: true, data: article });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getBySlug(req: Request, res: Response) {
    try {
      const article = await articleService.getBySlug(req.params.slug as string);
      res.status(200).json({ success: true, data: article });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const article = await articleService.update(req.params.id as string, req.body, userId);
      res.status(200).json({ success: true, data: article });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async publish(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const article = await articleService.publish(req.params.id as string, userId);
      res.status(200).json({ success: true, data: article });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async unpublish(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const article = await articleService.unpublish(req.params.id as string, userId);
      res.status(200).json({ success: true, data: article });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async schedule(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { scheduledAt } = req.body;
      const article = await articleService.schedule(req.params.id as string, new Date(scheduledAt), userId);
      res.status(200).json({ success: true, data: article });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async archive(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const article = await articleService.archive(req.params.id as string, userId);
      res.status(200).json({ success: true, data: article });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const result = await articleService.delete(req.params.id as string, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await articleService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}