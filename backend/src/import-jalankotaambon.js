import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // Path to the JSON file
  const filePath = path.join(
    __dirname,
    "../../frontend/public/datamap/jalankotaambon.json"
  );
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  if (!Array.isArray(data.features)) {
    throw new Error("Invalid JSON structure: features array not found");
  }

  for (const feature of data.features) {
    const nameroad = feature.properties?.nameroad || null;
    const description = feature.properties?.description || null;
    const geometry = feature.geometry || null;

    await prisma.road.create({
      data: {
        nameroad,
        description,
        geometry,
      },
    });
  }

  console.log("Import selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
