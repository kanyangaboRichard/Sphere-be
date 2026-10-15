import { Router } from "express";
import { CategoryService } from "../Services/categories.services";

const router = Router();
const categoryService = new CategoryService();

router.get("/", async (req, res) => {
  try {
    const categories = await categoryService.getAll();
    res.json({ data: categories });
  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const category = await categoryService.getOne(req.params.id as string);
    res.json({ data: category });
  } catch (err: any) {
    console.error("Get category error:", err);
    res.status(404).json({ message: err.message || "Category not found" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }
    const category = await categoryService.create(name, (req as any).user?.id);
    res.status(201).json({ data: category });
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ message: "Failed to create category" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const category = await categoryService.update(req.params.id as string, req.body, (req as any).user?.id);
    res.json({ data: category });
  } catch (err: any) {
    console.error("Update category error:", err);
    res.status(400).json({ message: err.message || "Failed to update category" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await categoryService.delete(req.params.id as string, (req as any).user?.id);
    res.json(result);
  } catch (err: any) {
    console.error("Delete category error:", err);
    res.status(400).json({ message: err.message || "Failed to delete category" });
  }
});

export default router;