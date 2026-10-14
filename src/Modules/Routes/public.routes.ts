import { Router } from "express";
import { ArticleService } from "../Services/articles.services";

const router = Router();
const articleService = new ArticleService();


router.get("/articles", async (req, res) => {
  try {
    const { categoryId, search, page, limit } = req.query;
    const result = await articleService.getPublicAll({
      categoryId: categoryId as string | undefined,
      search: search as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({ data: result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/articles/:slug", async (req, res) => {
  try {
    const article = await articleService.getPublicBySlug(req.params.slug);
    res.json({ data: article });
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
});

export default router;