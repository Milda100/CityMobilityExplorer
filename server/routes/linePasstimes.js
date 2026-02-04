import { Router } from 'express';
import fetch from 'node-fetch';
import https from 'https';

const router = Router();
const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // dev only
});

router.get('/', async (req, res) => {
  const { lineId } = req.query;
  if (!lineId) return res.status(400).json({ error: 'Missing lineId' });

  try {
    const response = await fetch(`https://v0.ovapi.nl/line/${lineId}`, {
      agent: httpsAgent,
      headers: { 'User-Agent': 'CityMobilityExplorer/1.0' },
    });

    if (!response.ok) throw new Error(`OVAPI request failed: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Fetch line passtimes error:', err);
    res.status(500).json({ error: 'Failed to fetch line passtimes' });
  }
});

export default router;
