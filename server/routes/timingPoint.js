import { Router } from 'express';
import fetch from 'node-fetch';
import https from 'https';

const router = Router();

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // WARNING: only for development!
});

let timingPointsCache = null;

router.get('/', async (req, res) => {
  try {
    if (timingPointsCache) {
      return res.json(timingPointsCache);
    }

    const response = await fetch('https://v0.ovapi.nl/tpc', { agent: httpsAgent });
    if (!response.ok) throw new Error(`OVAPI request failed: ${response.status}`);

    const data = await response.json();
    timingPointsCache = data;

    console.log('Fetched timing points:', Object.keys(data).length);
    res.json(data);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch timing points' });
  }
});

export default router;
