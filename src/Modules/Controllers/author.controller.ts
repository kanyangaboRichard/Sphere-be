import { Request, Response } from "express";
import { AuthorService } from "../Services/author.services";

const authorService = new AuthorService();

export class AuthorController {

  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const author = await authorService.create(req.body, userId);
      res.status(201).json({ success: true, data: author });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const { status, isColumnist, search, page, limit } = req.query;
      const result = await authorService.getAll({
        status: status as any,
        isColumnist: isColumnist === "true" ? true : isColumnist === "false" ? false : undefined,
        search: search as string,
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
      const author = await authorService.getOne(req.params.id as string);
      res.status(200).json({ success: true, data: author });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getColumnists(req: Request, res: Response) {
    try {
      const authors = await authorService.getColumnists();
      res.status(200).json({ success: true, data: authors });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id as string;
      const author = await authorService.update(req.params.id as string, req.body, userId);
      res.status(200).json({ success: true, data: author });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id as string;
      const author = await authorService.toggleStatus(req.params.id as string, userId);
      res.status(200).json({ success: true, data: author });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id as string;
      const result = await authorService.delete(req.params.id as string, userId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}