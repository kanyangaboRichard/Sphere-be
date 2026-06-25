import { Request, Response } from "express";
import { SiteSettingsService } from "../Services/siteSettings.services";

const siteSettingsService = new SiteSettingsService();

export class SiteSettingsController {

  async get(req: Request, res: Response) {
    try {
      const settings = await siteSettingsService.get();
      res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const settings = await siteSettingsService.update(req.body, userId);
      res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateTheme(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const settings = await siteSettingsService.updateTheme(req.body, userId);
      res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateFeatures(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const settings = await siteSettingsService.updateFeatures(req.body, userId);
      res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateSocial(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const settings = await siteSettingsService.updateSocial(req.body, userId);
      res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateSEO(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const settings = await siteSettingsService.updateSEO(req.body, userId);
      res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async resetToDefaults(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const settings = await siteSettingsService.resetToDefaults(userId);
      res.status(200).json({ success: true, data: settings });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}