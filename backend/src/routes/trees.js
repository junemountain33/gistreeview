import express from "express";
import { PrismaClient } from "@prisma/client";
import upload from "../middleware/upload.js";
import path from "path";
import fs from "fs";
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/treepictures - ambil semua gambar pohon
router.get("/treepictures", async (req, res) => {
  try {
    const pictures = await prisma.treePicture.findMany();
    res.json(pictures);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data gambar pohon" });
  }
});
// POST /api/trees/:id/pictures - upload gambar pohon
// Multi-upload gambar pohon
router.post("/:id/pictures", upload.array("picture", 10), async (req, res) => {
  try {
    const treeId = req.params.id;
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: "No files uploaded" });
    const treeDir = path.join(process.cwd(), "public", "uploads", "tree");
    if (!fs.existsSync(treeDir)) fs.mkdirSync(treeDir, { recursive: true });
    const files = req.files;
    const createdPictures = [];
    for (const file of files) {
      const oldPath = file.path;
      const newPath = path.join(treeDir, file.filename);
      fs.renameSync(oldPath, newPath);
      const pict = await prisma.treePicture.create({
        data: {
          url: file.filename,
          treeId,
        },
      });
      createdPictures.push(pict);
    }
    res.json(createdPictures);
  } catch (err) {
    res.status(500).json({ error: "Gagal upload gambar pohon" });
  }
});

// GET /api/trees - ambil semua data pohon
router.get("/", async (req, res) => {
  try {
    const trees = await prisma.tree.findMany({
      include: { road: true },
    });
    res.json(trees);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengambil data pohon" });
  }
});

// POST /api/trees - tambah pohon baru
router.post("/", async (req, res) => {
  try {
    const tree = await prisma.tree.create({ data: req.body });
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: "Gagal menambah pohon" });
  }
});

// PUT /api/trees/:id - edit pohon
router.put("/:id", async (req, res) => {
  try {
    console.log(`PUT /api/trees/${req.params.id} - received body:`, req.body);
    const tree = await prisma.tree.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: "Gagal mengedit pohon" });
  }
});

// DELETE /api/trees/:id - hapus pohon
router.delete("/:id", async (req, res) => {
  try {
    await prisma.tree.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error("Error saat hapus pohon:", err);
    res.status(500).json({ error: "Gagal menghapus pohon" });
  }
});

export default router;
