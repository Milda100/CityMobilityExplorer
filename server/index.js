import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import stopAreasRouter from "./routes/stopAreas.js";
import departuresRouter from "./routes/departures.js";
import linePasstimesRouter from "./routes/linePasstimes.js";
import linesRouter from "./routes/lines.js";
import tpcRoute from "./routes/tpc.js";

const app = express();

dotenv.config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

// CORS
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  "http://localhost:5174"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);

// Routes
app.use("/api/stop-areas", stopAreasRouter);
app.use("/api/tpc", tpcRoute);
app.use("/api/departures", departuresRouter);
app.use("/api/line-passtimes", linePasstimesRouter);
app.use("/api/lines", linesRouter);

const PORT = process.env.PORT || 3000;;
app.listen(PORT, () => {
  console.log(`Proxy running on http://localhost:${PORT}`);
  console.log(`CORS enabled for ${allowedOrigins.join(", ")}`);
});
