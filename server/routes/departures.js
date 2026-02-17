import { Router } from "express";
import fetch from "node-fetch";
import https from "https";

const router = Router();

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // WARNING: only for development!
});

router.get("/", async (req, res) => {
  const stopId = req.query.stopId;

  if (!stopId) {
    return res.status(400).json({ error: "Missing stopId" });
  }
  try {
    const response = await fetch(
      `https://v0.ovapi.nl/stopareacode/${stopId}/departures`,
      {
        agent: httpsAgent,
        headers: { "User-Agent": "CityMobilityExplorer/1.0" },
      },
    );

    console.log("OVAPI status:", response.status);
    if (!response.ok)
      throw new Error(`OVAPI request failed: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch departures" });
  }
});

export default router;
