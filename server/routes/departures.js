import { Router } from "express";
import fetch from "node-fetch";
import https from "https";
import "dotenv/config";

const router = Router();

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // WARNING: only for development!
});

router.get("/:code", async (req, res) => {
  const { code } = req.params;

  if (!code) {
    return res.status(400).json({ error: "Missing code from TPC" });
  }
  try {
    const response = await fetch(
      `${process.env.API_URL}/tpc/${code}/departures`,
      {
        agent: httpsAgent,
        headers: { "User-Agent": "CityMobilityExplorer/1.0" },
      },
    );

    console.log("OVAPI status:", response.status);
    if (!response.ok)
      throw new Error(`OVAPI request failed: ${response.status}`);

    const data = await response.json();
    const departuresData = Object.values(data[code].Passes || {});
    const departures = departuresData.map((d) => ({
      idOfVehicle:
        d.DataOwnerCode +
        "_" +
        d.LocalServiceLevelCode +
        "_" +
        d.LinePlanningNumber +
        "_" +
        d.JourneyNumber +
        "_" +
        d.FortifyOrderNumber,
      lineId:
        d.OperatorCode + "_" + d.LinePlanningNumber + "_" + d.LineDirection,
      lineNumber: d.LinePublicNumber,
      LineName: d.LineName,
      destination: d.DestinationName50,
      type: d.TransportType ?? "UNKNOWN",
      expectedDeparture: d.ExpectedDepartureTime,
      scheduledDeparture: d.TargetDepartureTime,
      operatorCode: d.OperatorCode,
      linePlanningNumber: d.LinePlanningNumber,
      direction: d.LineDirection,
      status: d.TripStopStatus,
    }));
    // Sort by time
    departures.sort(
      (a, b) =>
        new Date(a.expectedDeparture).getTime() -
        new Date(b.expectedDeparture).getTime(),
    );
    res.json(departures);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch departures" });
  }
});

export default router;
