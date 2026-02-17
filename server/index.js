import express from "express";
import cors from "cors";
import stopAreasRouter from "./routes/stopAreas.js";
import departuresRouter from "./routes/departures.js";
import tpcRouter from "./routes/tpc.js";
import linePasstimesRouter from "./routes/linePasstimes.js";
import linesRouter from "./routes/lines.js";

const app = express();

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

// CORS
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
app.use(cors({ origin: clientOrigin }));

// Routes
app.use("/api/stop-areas", stopAreasRouter);
app.use("/api/tpc", tpcRouter);
app.use("/api/departures", departuresRouter);
app.use("/api/line-passtimes", linePasstimesRouter);
app.use("/api/lines", linesRouter);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Proxy running on http://localhost:${PORT}`);
  console.log(`CORS enabled for ${clientOrigin}`);
});
