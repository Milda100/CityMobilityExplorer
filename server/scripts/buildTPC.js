import fetch from "node-fetch";
import fs from "fs";
import https from "https";
import pLimit from "p-limit";
import 'dotenv/config';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const limit = pLimit(5); // 5 concurrent requests max since i got blocked for too many requests before

async function buildTPC() {
  console.log("Fetching TPC index...");

  const response = await fetch(`${process.env.API_URL}/tpc`, {
    agent: httpsAgent,
    headers: { "User-Agent": "CityMobilityExplorer/1.0" },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch TPC index");
  }

  const tpcData = await response.json();
  const codes = Object.keys(tpcData);

  console.log(`Found ${codes.length} TPC codes`);
  console.log("Fetching details with controlled concurrency...");

  const detailPromises = codes.map((code) =>
    limit(async () => {
      try {
        const res = await fetch(`${process.env.API_URL}/tpc/${code}`, {
          agent: httpsAgent,
          headers: { "User-Agent": "CityMobilityExplorer/1.0" },
        });

        if (!res.ok) return null;

        return await res.json();
      } catch (err) {
        console.error(`Failed ${code}`);
        return null;
      }
    }),
  );

  const allDetails = await Promise.all(detailPromises);

  const features = allDetails.filter(Boolean).map((item) => {
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

  console.log(`Saving ${features.length} stops...`);

  fs.mkdirSync("server/data", { recursive: true });

  fs.writeFileSync("server/data/tpc.geojson", JSON.stringify(geojson));

  console.log("Done.");
}

buildTPC().catch(console.error);
