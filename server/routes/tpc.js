import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();

// --- Absolute path to tpc.geojson ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tpcFilePath = path.join(__dirname, "../data/tpc.geojson");

// Load once at server start
const tpcData = JSON.parse(fs.readFileSync(tpcFilePath, "utf-8"));

router.get("/", (req, res) => {
  res.json(tpcData);
});

export default router;
