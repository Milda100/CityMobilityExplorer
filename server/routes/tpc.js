import { Router } from "express";
import fetch from "node-fetch";
import https from "https";

const router = Router();

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // WARNING: only for development!
});

let tpcCache = null; // in memory chache until server restart

router.get("/", async (req, res) => {
  try {
    if (tpcCache) {
      console.log("Serving TPC data from cache");
      return res.json(tpcCache);
    }
    console.log("Building TPC cache...");
    const tcpResponse = await fetch(`${process.env.API_URL}/tpc`, {
      agent: httpsAgent,
      headers: { "User-Agent": "CityMobilityExplorer/1.0" },
    });

    if (!tcpResponse.ok) {
      return res.status(tcpResponse.status).json({
        error: "Failed to fetch OVAPI data",
      });
    }
    const tpcData = await tcpResponse.json();
    const tpc = Object.keys(tpcData); //returns an array of tpc

    // feching tpc details and coordinates
    const tpcDetailsPromises = tpc.map(async (code) => {
      try {
        const tpcDetailResponse = await fetch(
          `${process.env.API_URL}/tpc/${code}`,
          {
            agent: httpsAgent,
            headers: { "User-Agent": "CityMobilityExplorer/1.0" },
          },
        );
        const tpcDetailData = await tpcDetailResponse.json();
        return tpcDetailData;
      } catch (error) {
        console.error(`Error fetching details for TPC ${code}:`, error);
        return null; // Return null for failed fetches
      }
    });

    const allTpcDetails = await Promise.all(tpcDetailsPromises);

    // convert to GeoJSON format
    const features = allTpcDetails
      .filter((item) => item) // remove nulls
      .map((item) => {
        const key = Object.keys(item)[0];
        const stop = item[key].Stop;

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [stop.Longitude, stop.Latitude],
          },
          properties: {
            town: stop.TimingPointTown,
            name: stop.TimingPointName,
            tpc: stop.TimingPointCode,
            stopAreaCode: stop.StopAreaCode,
            tpWheelChairAccessible: stop.TimingPointWheelChairAccessible,
            tpVisualAccessible: stop.TimingPointVisualAccessible,
          },
        };
      });

    const geojson = {
      type: "FeatureCollection",
      features,
    };

    tpcCache = geojson; // cache the result
    console.log(
      "TPC cache built successfully with",
      features.length,
      "features",
    );

    // Send GeoJSON to client
    res.json(geojson);
  } catch (error) {
    console.error("TPC fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
