import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";

const router = Router();

// paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tpcFilePath = path.join(__dirname, "../data/tpc.geojson");
const nlPolygonPath = path.join(__dirname, "../data/netherlands.geojson");

// load files
const rawTpc = JSON.parse(fs.readFileSync(tpcFilePath, "utf-8"));
const nlGeo = JSON.parse(fs.readFileSync(nlPolygonPath, "utf-8"));

// single polygon
const nlPolygon = polygon(nlGeo.features[0].geometry.coordinates);

// filter stops inside Netherlands polygon
const filteredFeatures = rawTpc.features.filter((feature) => {
  const [lon, lat] = feature.geometry.coordinates;
  const pt = point([lon, lat]);
  return booleanPointInPolygon(pt, nlPolygon);
});

const tpcData = {
  ...rawTpc,
  features: filteredFeatures,
};

console.log("Original stops:", rawTpc.features.length);
console.log("Filtered stops:", filteredFeatures.length);

router.get("/", (req, res) => {
  res.json(tpcData);
});

export default router;
