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
    const vehiclesArray = lineData?.Actuals
      ? Object.values(lineData.Actuals)
      : [];

    const geojson = {
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
            icon: type,
            bearing: v.Bearing || 0,
            line: v.LinePublicNumber,
            destination: v.DestinationName50,
          },
        };
      }),
    };

    res.json(geojson);
  } catch (err) {
    console.error("Fetch line passtimes error:", err);
    res.status(500).json({ error: "Failed to fetch line passtimes" });
  }
});

export default router;
