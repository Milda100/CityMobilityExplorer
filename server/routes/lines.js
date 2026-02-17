import { Router } from "express";
import fetch from "node-fetch";
import https from "https";

const router = Router();
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // dev only
});

let cashedLines = null;
let lastFetchTime = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

router.get("/", async (req, res) => {
  try {
    if (cashedLines && Date.now() - lastFetchTime < CACHE_DURATION) {
      return res.json(cashedLines);
    }
    const response = await fetch(`${process.env.API_URL}/line`, {
      agent: httpsAgent,
      headers: { "User-Agent": "CityMobilityExplorer/1.0" },
    });

    if (!response.ok)
      throw new Error(`OVAPI request failed: ${response.status}`);
    const rawData = await response.json();
    const lines = Object.entries(rawData).map(([lineId, line]) => ({
      lineId,
      number: line.LinePublicNumber,
      name: line.LineName,
      direction: line.LineDirection,
      destination: line.DestinationName50,
      transportType: line.TransportType,
    }));

    cashedLines = lines;
    lastFetchTime = Date.now();

    res.json(lines);
  } catch (err) {
    console.error("Fetch lines error:", err);
    res.status(500).json({ error: "Failed to fetch lines" });
  }
});
export default router;
