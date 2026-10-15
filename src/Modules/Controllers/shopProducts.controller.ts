import { Request, Response } from "express";
import { ShopProductService } from "../../Modules/Services/shopProducts.services";

const shopProductService = new ShopProductService();

export class ShopProductController {

  async create(req: Request, res: Response) {
    try {
      const product = await shopProductService.create(req.body, (req as any).user?.id);
      res.status(201).json({ success: true, data: product });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { categoryId, search } = req.query;
      const products = await shopProductService.getAll({
        categoryId: categoryId as string,
        search: search as string,
      });
      res.status(200).json({ success: true, data: products });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getPublicAll(req: Request, res: Response) {
    try {
      const { categoryId, isNewArrival, isDeal } = req.query;
      const products = await shopProductService.getPublicAll({
        categoryId: categoryId as string,
        isNewArrival: isNewArrival !== undefined ? isNewArrival === "true" : undefined,
        isDeal: isDeal !== undefined ? isDeal === "true" : undefined,
      });
      res.status(200).json({ success: true, data: products });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const product = await shopProductService.getOne(req.params.id as string);
      res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const product = await shopProductService.update(req.params.id as string, req.body, (req as any).user?.id);
      res.status(200).json({ success: true, data: product });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const result = await shopProductService.delete(req.params.id as string, (req as any).user?.id);
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}