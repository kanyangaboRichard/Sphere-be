import { Router } from "express";
import { MediaService } from "../Services/media.services";
 //import { requireAuth } from "../Middleware/auth"; 

const router = Router();
const mediaService = new MediaService();

// GET /api/media
router.get("/", async (req, res) => {
  try {
    const { search, type, sort } = req.query;
    const media = await mediaService.getAll({
      search: search as string,
      type: type as "image" | "video" | undefined,
      sort: sort as string,
    });
    res.json({ data: media });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/media/presign
router.post("/presign", async (req, res) => {
  try {
    const result = await mediaService.presignUpload(req.body);
    res.json({ data: result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/media
router.post("/", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const media = await mediaService.confirmUpload(req.body, userId);
    res.json({ data: media });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/media/bulk  (must stay above /:id)
router.delete("/bulk", async (req, res) => {
  try {
    const result = await mediaService.deleteBulk(req.body.ids);
    res.json({ data: result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/media/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await mediaService.delete(req.params.id);
    res.json({ data: result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;