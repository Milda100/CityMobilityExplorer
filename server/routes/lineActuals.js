import { Router } from "express";
import fetch from "node-fetch";
import https from "https";
import "dotenv/config";

const router = Router();

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

      routeCoordinates = Object.values(stops).map((s) => [s.Longitude, s.Latitude]);
    }
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
          geometry: {
            type: "LineString",
            coordinates: routeCoordinates,
          },
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
