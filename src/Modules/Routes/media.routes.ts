import { Router } from "express";
import { MediaService } from "../Services/media.services";
// import { requireAuth } from "../Middleware/auth"; // uncomment/adjust to match your real auth middleware

const router = Router();
const mediaService = new MediaService();

router.get("/media", async (req, res) => {
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

router.post("/media/presign", async (req, res) => {
  try {
    const result = await mediaService.presignUpload(req.body);
    res.json({ data: result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/media", async (req, res) => {
  try {
    // adjust (req as any).user?.id to however your auth middleware attaches the user
    const userId = (req as any).user?.id;
    const media = await mediaService.confirmUpload(req.body, userId);
    res.json({ data: media });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/media/bulk", async (req, res) => {
  try {
    const result = await mediaService.deleteBulk(req.body.ids);
    res.json({ data: result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/media/:id", async (req, res) => {
  try {
    const result = await mediaService.delete(req.params.id);
    res.json({ data: result });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;