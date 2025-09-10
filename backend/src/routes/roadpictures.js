import express from "express";
import { PrismaClient } from "@prisma/client";
import upload from "../middleware/upload.js";
import path from "path";
import fs from "fs";
const router = express.Router();
const prisma = new PrismaClient();
// POST /api/roads/:id/pictures - upload gambar jalan
router.post("/:id/pictures", upload.array("picture", 10), async (req, res) => {
  try {
    const roadId = req.params.id;
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: "No files uploaded" });
    const roadDir = path.join(process.cwd(), "public", "uploads", "road");
    if (!fs.existsSync(roadDir)) fs.mkdirSync(roadDir, { recursive: true });
    const files = req.files;
    const createdPictures = [];
    for (const file of files) {
      const oldPath = file.path;
      const newPath = path.join(roadDir, file.filename);
      fs.renameSync(oldPath, newPath);
      const pict = await prisma.roadPicture.create({
        data: {
          url: file.filename,
          roadId,
        },
      });
      createdPictures.push(pict);
    }
    res.json(createdPictures);
  } catch (err) {
    res.status(500).json({ error: "Gagal upload gambar jalan" });
  }
});

// GET /api/roadpictures
router.get("/", async (req, res) => {
  try {
    const roadPictures = await prisma.roadPicture.findMany();
    res.json(roadPictures);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch road pictures" });
  }
});

// DELETE /api/roadpictures/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.roadPicture.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ error: "Road picture not found" });
  }
});

export default router;
