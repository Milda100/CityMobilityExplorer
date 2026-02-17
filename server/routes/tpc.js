import { Router } from "express";
import fetch from "node-fetch";
import https from "https";

const router = Router();

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // WARNING: only for development!
});

router.get("/", async (req, res) => {
  try {
    const response = await fetch(`${process.env.API_URL}/tpc`, {
      agent: httpsAgent,
      headers: { "User-Agent": "CityMobilityExplorer/1.0" },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch OVAPI data",
      });
    }
    const data = await response.json();
    const timingPointCodes = Object.keys(data);
    res.json(timingPointCodes);
  } catch (error) {
    console.error("TPC fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const response = await fetch(`${process.env.API_URL}/tpc/${code}`, {
      agent: httpsAgent,
      headers: { "User-Agent": "CityMobilityExplorer/1.0" },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("TPC detail error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
