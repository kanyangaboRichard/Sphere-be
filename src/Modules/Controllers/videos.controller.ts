import { Request, Response } from "express";
import { VideoService } from "../Services/video.services";
import { VideoPlacement } from "../../Entities/Videos";

const videoService = new VideoService();

export class VideoController {

  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const video = await videoService.create(req.body, userId);
      res.status(201).json({ success: true, data: video });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { status, source, placement, articleId, isFeatured, isLive, page, limit } = req.query;
      const result = await videoService.getAll({
        status: status as any,
        source: source as any,
        placement: placement as any,
        articleId: articleId as string,
        isFeatured: isFeatured === "true" ? true : isFeatured === "false" ? false : undefined,
        isLive: isLive === "true" ? true : isLive === "false" ? false : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
      });
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const video = await videoService.getOne(req.params.id as string);
      res.status(200).json({ success: true, data: video });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getFeatured(req: Request, res: Response) {
    try {
      const video = await videoService.getFeatured();
      res.status(200).json({ success: true, data: video });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getByPlacement(req: Request, res: Response) {
    try {
      const videos = await videoService.getByPlacement(req.params.placement as VideoPlacement);
      res.status(200).json({ success: true, data: videos });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const video = await videoService.update(req.params.id as string, req.body, userId);
      res.status(200).json({ success: true, data: video });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const video = await videoService.toggleStatus(req.params.id as string, userId);
      res.status(200).json({ success: true, data: video });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async setFeatured(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const video = await videoService.setFeatured(req.params.id as string, userId);
      res.status(200).json({ success: true, data: video });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const result = await videoService.delete(req.params.id as string, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async reorder(req: Request, res: Response) {
    try {
      const result = await videoService.reorder(req.body.items);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}