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

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }
    const category = await categoryService.create(name);
    res.status(201).json({ data: category });
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ message: "Failed to create category" });
  }
});

export default router;