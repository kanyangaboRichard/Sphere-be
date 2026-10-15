import { Request, Response } from "express";
import { ShopCategoryService } from "../../Modules/Services/shopCategories.services";

const shopCategoryService = new ShopCategoryService();

export class ShopCategoryController {

  async create(req: Request, res: Response) {
    try {
      const category = await shopCategoryService.create(req.body, (req as any).user?.id);
      res.status(201).json({ success: true, data: category });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const categories = await shopCategoryService.getAll();
      res.status(200).json({ success: true, data: categories });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getPublicAll(req: Request, res: Response) {
    try {
      const categories = await shopCategoryService.getPublicAll();
      res.status(200).json({ success: true, data: categories });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const category = await shopCategoryService.getOne(req.params.id as string);
      res.status(200).json({ success: true, data: category });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const category = await shopCategoryService.update(req.params.id as string, req.body, (req as any).user?.id);
      res.status(200).json({ success: true, data: category });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const result = await shopCategoryService.delete(req.params.id as string, (req as any).user?.id);
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}