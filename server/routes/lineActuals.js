import { Router } from "express";
import fetch from "node-fetch";
import https from "https";
import "dotenv/config";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";

const router = Router();

// Dev-only HTTPS agent
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// NL polygon
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nlPolygonPath = path.join(__dirname, "../data/netherlands.geojson");
const nlGeo = JSON.parse(fs.readFileSync(nlPolygonPath, "utf-8"));
const nlPolygon = polygon(nlGeo.features[0].geometry.coordinates);

// Hosted GTFS dataset
const NL_ROUTE_GEOMETRIES =
  "https://pub-8215ffe9587b4ebda74d9902d00d4ca2.r2.dev/nlTransportPaths.geojson";
let cachedRouteGeometryData = null;

async function loadGtfsData() {
  try {
    const res = await fetch(NL_ROUTE_GEOMETRIES);
    if (!res.ok) throw new Error(res.statusText);
    cachedRouteGeometryData = await res.json();
    console.log("Loaded GTFS transport data into memory");
  } catch (err) {
    console.error("Failed to load GTFS data on startup:", err);
  }
}
// call immediately when this module is imported
loadGtfsData();

const cachedLineStops = {};

router.get("/", async (req, res) => {
  const { lineId } = req.query;
  if (!lineId) return res.status(400).json({ error: "Missing lineId" });
  try {
    const ovResponse = await fetch(`${process.env.API_URL}/line/${lineId}`, {
      agent: httpsAgent,
      headers: { "User-Agent": "CityMobilityExplorer/1.0" },
    });
    if (!ovResponse.ok) {
      throw new Error(`OVAPI request failed: ${ovResponse.status}`);
    }
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
    const routeCoordinates = cachedLineStops[lineId];

    //------ GTFS route geometry from dataset --------

    if (!cachedRouteGeometryData) {
      return res.status(503).json({ error: "GTFS data not ready yet" });
    }
    // if (!cachedRouteGeometryData) {
    //   const gtfsResponse = await fetch(NL_ROUTE_GEOMETRIES);
    //   if (!gtfsResponse.ok)
    //     throw new Error(
    //       `Failed to fetch route geometry data: ${gtfsResponse.status}`,
    //     );
    //   cachedRouteGeometryData = await gtfsResponse.json();
    //   console.log("Loaded GTFS transport data into memory");
    // }

    //---------- get GTFS shape(s) for this line --------
    const lineNumber =
      lineData.Line.DataOwnerCode + "_" + lineData.Line.LinePublicNumber;

    const routeFeatures = cachedRouteGeometryData.features.filter(
      (f) =>
        f.properties.routes_agency_id +
          "_" +
          f.properties.routes_route_short_name ===
        lineNumber,
    );

    // the best matching shape (first point closest to stops)
    const chosenShape = routeFeatures.reduce((closest, f) => {
      const shapeCoords = f.geometry.coordinates;
      // measure distance to first stop as heuristic
      const dist = Math.hypot(
        shapeCoords[0][0] - routeCoordinates[0][0],
        shapeCoords[0][1] - routeCoordinates[0][1],
      );
      return !closest || dist < closest.dist ? { feature: f, dist } : closest;
    }, null)?.feature;

    // fallback to stops if no GTFS shape
    const finalShape = chosenShape || {
      geometry: { type: "LineString", coordinates: routeCoordinates || [] },
      properties: { fallback: true },
    };

    //-------Vehicle from Actuals--------//
    const vehiclesArray = lineData?.Actuals
      ? Object.values(lineData.Actuals)
      : [];

    const vehiclesGeoJSON = {
      type: "FeatureCollection",
      features: vehiclesArray.map((v) => {
        const type = v.TransportType || "UNKNOWN";
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [v.Longitude, v.Latitude],
          },
          properties: {
            vehicleId:
              v.DataOwnerCode +
              "_" +
              v.LocalServiceLevelCode +
              "_" +
              v.LinePlanningNumber +
              "_" +
              v.JourneyNumber +
              "_" +
              v.FortifyOrderNumber,
            icon: type,
            line: v.LinePublicNumber,
            destination: v.DestinationName50,
          },
        };
      }),
    };

    //------- Combined GeoJSON-------//
    const lineGeoJSON = {
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
        ...vehiclesGeoJSON.features,
      ],
    };
    res.json(lineGeoJSON);
  } catch (err) {
    console.error("Fetch line data error:", err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

export default router;
