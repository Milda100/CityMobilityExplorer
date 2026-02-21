import { Router } from "express";
import fs from "fs";

const router = Router();

// Load once at server start
const tpcData = JSON.parse(fs.readFileSync("server/data/tpc.geojson", "utf-8"));

router.get("/", (req, res) => {
  res.json(tpcData);
});

export default router;
