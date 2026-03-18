import { Router } from "express";
import fetch from "node-fetch";
import https from "https";
import "dotenv/config";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getRoadRoute } from "../services/getRoadRoute.js";

const router = Router();
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

//NL Polygon
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const nlPolygonPath = path.join(__dirname, "../data/netherlands.geojson");
const nlGeo = JSON.parse(fs.readFileSync(nlPolygonPath, "utf-8"));
const nlPolygon = polygon(nlGeo.features[0].geometry.coordinates);

//R2 Public URL hosted in Cloudflare
const STORAGE_URL =
  "https://pub-3e1125ae8ebb45ab9e57f5c7d16e68de.r2.dev/routes";
// Note: If you have a public R2.dev domain, use that instead!

const cachedLineStops = {};

router.get("/", async (req, res) => {
  const { lineId } = req.query;
  if (!lineId) return res.status(400).json({ error: "Missing lineId" });
  try {
    const ovResponse = await fetch(`${process.env.API_URL}/line/${lineId}`, {
      agent: httpsAgent,
      headers: { "User-Agent": "CityMobilityExplorer/1.0" },
    });
    if (!ovResponse.ok) throw new Error(`OVAPI failed: ${ovResponse.status}`);
    const ovData = await ovResponse.json();
    const lineData = ovData[lineId];
    if (!lineData) return res.status(404).json({ error: "Line not found" });

    //------ Route from Network --------
    if (!cachedLineStops[lineId]) {
      const network = lineData.Network;
      if (network) {
        const stops = network[Object.keys(network)[0]];
        cachedLineStops[lineId] = Object.values(stops)
          .map((s) => [s.Longitude, s.Latitude])
          .filter(([lon, lat]) =>
            booleanPointInPolygon(point([lon, lat]), nlPolygon),
          );
      }
    }
    const routeCoordinates = cachedLineStops[lineId] || [];

    // //------ GTFS route geometry from Cloudflare --------
    const rawLineNumber =
      lineData.Line.DataOwnerCode + "_" + lineData.Line.LinePublicNumber;
    const safeFileName = rawLineNumber.replace(/:/g, "_") + ".geojson";

    let routeFeatures = [];
    try {
      const gtfsRes = await fetch(`${STORAGE_URL}/${safeFileName}`);
      if (gtfsRes.ok) {
        const geojson = await gtfsRes.json();
        routeFeatures = geojson.features;
      }
    } catch (e) {
      console.warn(`Geometry fetch failed for ${safeFileName}:`, e.message);
    }

    // Pick the best matching shape from the small file
    const chosenShape = routeFeatures.reduce((closest, f) => {
      const shapeCoords = f.geometry.coordinates;
      const gtfsStart = shapeCoords[0];
      const gtfsMid = shapeCoords[Math.floor(shapeCoords.length / 2)];
      const gtfsEnd = shapeCoords[shapeCoords.length - 1];
      const ovStart = routeCoordinates[0];
      const ovMid = routeCoordinates[Math.floor(routeCoordinates.length / 2)];
      const ovEnd = routeCoordinates[routeCoordinates.length - 1];
      const dStart = Math.hypot(
        gtfsStart[0] - ovStart[0],
        gtfsStart[1] - ovStart[1],
      );
      const dMid = Math.hypot(gtfsMid[0] - ovMid[0], gtfsMid[1] - ovMid[1]);
      const dEnd = Math.hypot(gtfsEnd[0] - ovEnd[0], gtfsEnd[1] - ovEnd[1]);

      // Total "Error" score
      const totalError = dStart + dMid + dEnd;

      return !closest || totalError < closest.error
        ? { feature: f, error: totalError }
        : closest;
    }, null)?.feature;

    // Fallback Logic with OSRM
    let finalGeometry;
    let isFallback = false;

    if (chosenShape) {
      finalGeometry = chosenShape.geometry;
    } else {
      console.log(`🛣️ No GTFS match for ${lineId}, trying OSRM snapping...`);
      const snapped = await getRoadRoute(routeCoordinates);

      if (snapped) {
        finalGeometry = snapped;
      } else {
        // Ultimate fallback: straight lines
        finalGeometry = { type: "LineString", coordinates: routeCoordinates };
      }
      isFallback = true;
    }

    const finalShape = {
      geometry: finalGeometry,
      properties: { fallback: isFallback },
    };

    //-------Vehicle from Actuals--------//
    const vehiclesArray = lineData?.Actuals
      ? Object.values(lineData.Actuals)
      : [];
    const vehiclesFeatures = vehiclesArray.map((v) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [v.Longitude, v.Latitude] },
      properties: {
        vehicleId: `${v.DataOwnerCode}_${v.JourneyNumber}`,
        icon: v.TransportType || "UNKNOWN",
        line: v.LinePublicNumber,
        destination: v.DestinationName50,
      },
    }));

    // G. Final Combined Output
    res.json({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: finalShape.geometry,
          properties: {
            type: "route",
            line: lineData.Line.LinePublicNumber,
            destination: lineData.Line.DestinationName50,
          },
        },
        ...vehiclesFeatures,
      ],
    });
  } catch (err) {
    console.error("Fetch line data error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
