import { Request, Response } from "express";
import { CategoryService } from "../../Modules/Services/categories.services";

const categoryService = new CategoryService();

export class CategoryController {

  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const category = await categoryService.create(req.body, userId);
      res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { status, showInNav, isFeatured } = req.query;
      const categories = await categoryService.getAll({
        status: status as any,
        showInNav: showInNav === "true" ? true : showInNav === "false" ? false : undefined,
        isFeatured: isFeatured === "true" ? true : isFeatured === "false" ? false : undefined,
      });
      res.status(200).json({ success: true, data: categories });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const category = await categoryService.getOne(req.params.id as string);
      res.status(200).json({ success: true, data: category });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getBySlug(req: Request, res: Response) {
    try {
      const category = await categoryService.getBySlug(req.params.slug as string);
      res.status(200).json({ success: true, data: category });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const category = await categoryService.update(req.params.id as string, req.body, userId);
      res.status(200).json({ success: true, data: category });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const result = await categoryService.delete(req.params.id as string, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const category = await categoryService.toggleStatus(req.params.id as string, userId);
      res.status(200).json({ success: true, data: category });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async reorder(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const result = await categoryService.reorder(req.body.items, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}