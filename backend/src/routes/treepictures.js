import express from "express";
import { PrismaClient } from "@prisma/client";
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/treepictures
router.get("/", async (req, res) => {
  try {
    const treePictures = await prisma.treePicture.findMany();
    res.json(treePictures);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tree pictures" });
  }
});

export default router;

// DELETE /api/treepictures/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.treePicture.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ error: "Tree picture not found" });
  }
});
