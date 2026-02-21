import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import stopAreasRouter from "./routes/stopAreas.js";
import departuresRouter from "./routes/departures.js";
import linePasstimesRouter from "./routes/linePasstimes.js";
import linesRouter from "./routes/lines.js";
import tpcRoute from "./routes/tpc.js";

const app = express();
dotenv.config();

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

// CORS
const clientOrigin = process.env.CLIENT_ORIGIN;
app.use(cors({ origin: clientOrigin }));

// Routes
app.use("/api/stop-areas", stopAreasRouter);
app.use("/api/tpc", tpcRoute);
app.use("/api/departures", departuresRouter);
app.use("/api/line-passtimes", linePasstimesRouter);
app.use("/api/lines", linesRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Proxy running on http://localhost:${PORT}`);
  console.log(`CORS enabled for ${clientOrigin}`);
});
