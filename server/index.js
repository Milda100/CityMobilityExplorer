import express from 'express';
import cors from 'cors';
import stopAreasRouter from './routes/stopAreas.js';
import departures from './routes/departures.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use('/api/stop-areas', stopAreasRouter);
app.use('/api/departures', departures);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`Proxy running on http://localhost:${PORT}`));

