import { Router } from "express";
import fetch from "node-fetch";
import https from "https";
import "dotenv/config";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point, polygon } from "@turf/helpers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();

// paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const nlPolygonPath = path.join(__dirname, "../data/netherlands.geojson");
const nlTransportPath = path.join(__dirname, "../data/nlTransportPaths.geojson")

const nlGeo = JSON.parse(fs.readFileSync(nlPolygonPath, "utf-8"));
const nlTransportData = JSON.parse(fs.readFileSync(nlTransportPath, "utf-8"));

const nlPolygon = polygon(nlGeo.features[0].geometry.coordinates);

// Dev-only HTTPS agent
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

router.get("/", async (req, res) => {
  const { lineId } = req.query;
  if (!lineId) return res.status(400).json({ error: "Missing lineId" });

  try {
    const response = await fetch(`${process.env.API_URL}/line/${lineId}`, {
      agent: httpsAgent,
      headers: { "User-Agent": "CityMobilityExplorer/1.0" },
    });

    if (!response.ok) {
      throw new Error(`OVAPI request failed: ${response.status}`);
    }

    const data = await response.json();
    const lineData = data[lineId];

    if (!lineData) return res.status(404).json({ error: "Line not found" });

    //------ Route from Network --------
    const network = lineData.Network;
    let routeCoordinates = [];
    if (network) {
      const stops = network[Object.keys(network)[0]];

      routeCoordinates = Object.values(stops)
        .map((s) => [s.Longitude, s.Latitude])
        .filter(([lon, lat]) => {
          const pt = point([lon, lat]);
          return booleanPointInPolygon(pt, nlPolygon);
        });
    }

    //------ Route geometry from dataset --------
    const lineNumber =
      lineData.Line.DataOwnerCode + "_" + lineData.Line.LinePublicNumber;

    // get GTFS shape(s) for this line
    const routeFeatures = nlTransportData.features.filter(
      (f) =>
        f.properties.routes_agency_id +
          "_" +
          f.properties.routes_route_short_name ===
        lineNumber,
    );

    // choose a shape that best matches stops
    // simplest: pick the one with coordinates closest to stops
    const chosenShape = routeFeatures.reduce((closest, f) => {
      const shapeCoords = f.geometry.coordinates;
      // measure distance to first stop as heuristic
      const dist = Math.hypot(
        shapeCoords[0][0] - routeCoordinates[0][0],
        shapeCoords[0][1] - routeCoordinates[0][1],
      );
      return !closest || dist < closest.dist ? { feature: f, dist } : closest;
    }, null)?.feature;

    // //------ Route geometry from dataset --------
    // const lineNumber =
    //   lineData.Line.DataOwnerCode + "_" + lineData.Line.LinePublicNumber;

    // // get GTFS shape(s) for this line
    // const routeFeatures = nlTransportData.features.filter(
    //   (f) =>
    //     f.properties.routes_agency_id +
    //       "_" +
    //       f.properties.routes_route_short_name ===
    //     lineNumber,
    // );

    // // choose a shape that best matches stops
    // // simplest: pick the one with coordinates closest to stops
    // let chosenShape = routeFeatures.reduce((closest, f) => {
    //   const shapeCoords = f.geometry.coordinates;
    //   const dist = Math.hypot(
    //     shapeCoords[0][0] - routeCoordinates[0][0],
    //     shapeCoords[0][1] - routeCoordinates[0][1],
    //   );
    //   return !closest || dist < closest.dist ? { feature: f, dist } : closest;
    // }, null)?.feature;

    // if (!chosenShape) {
    //   console.warn("No GTFS shape found, using straight line between stops");
    //   chosenShape = {
    //     geometry: { type: "LineString", coordinates: routeCoordinates },
    //     properties: { fallback: true },
    //   };
    // }

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
            // bearing: v.Bearing || 0,
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
          // geometry: {
          //   type: "LineString",
          //   coordinates: routeCoordinates,
          // },
          geometry: chosenShape.geometry,
          properties: {
            type: "route",
            line: lineData.Line.LinePublicNumber,
            destination: lineData.Line.DestinationName50,
          },
        },
        ...vehiclesGeoJSON.features,
      ],
    };
    console.log(lineGeoJSON);
    res.json(lineGeoJSON);
  } catch (err) {
    console.error("Fetch line data error:", err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

export default router;
