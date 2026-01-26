import express from 'express';
import cors from 'cors';
import stopAreasRouter from './routes/stopAreas.js';
import departuresRouter from './routes/departures.js';
import timingPointRouter from './routes/timingPoint.js';

const app = express();

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// CORS
const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
app.use(cors({ origin: clientOrigin }));

// Routes
app.use('/api/stop-areas', stopAreasRouter);
app.use('/api/timing-points', timingPointRouter);
app.use('/api/departures', departuresRouter);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`Proxy running on http://localhost:${PORT}`);
  console.log(`CORS enabled for ${clientOrigin}`);
});
