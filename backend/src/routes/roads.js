import express from "express";
import { PrismaClient } from "@prisma/client";
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/roads
router.get("/", async (req, res) => {
  try {
    const roads = await prisma.road.findMany();
    res.json(roads);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch roads" });
  }
});

// POST /api/roads
router.post("/", async (req, res) => {
  try {
    const road = await prisma.road.create({ data: req.body });
    res.json(road);
  } catch (error) {
    res.status(500).json({ error: "Failed to create road" });
  }
});

// PUT /api/roads/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const road = await prisma.road.update({ where: { id }, data: req.body });
    res.json(road);
  } catch (error) {
    res.status(500).json({ error: "Failed to update road" });
  }
});

// DELETE /api/roads/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.road.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ error: "Road not found" });
  }
});

export default router;
