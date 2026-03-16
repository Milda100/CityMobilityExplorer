import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const nlTransportPath = path.join(__dirname, "../data/nlTransportPaths.geojson");
const raw = JSON.parse(fs.readFileSync(nlTransportPath, "utf-8"));

// Keep only essential fields
const cleaned = raw.features.map((f) => ({
  type: "Feature",
  geometry: f.geometry, // coordinates stay
  properties: {
    shape_id: f.properties.shape_id,
    routes_route_short_name: f.properties.routes_route_short_name,
    routes_agency_id: f.properties.routes_agency_id,
  },
}));

// Write cleaned file
fs.writeFileSync(
  "server/data/nlTransportPaths-clean.geojson",
  JSON.stringify({ type: "FeatureCollection", features: cleaned }),
);

console.log(
  "Cleaned GeoJSON saved. Original:",
  raw.features.length,
  "features.",
);
