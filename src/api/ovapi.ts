import axios from 'axios';
import type { TransportStop } from '../data/transportStops';

const BASE_URL = 'https://api.ovapi.nl/v1';

export async function fetchTransportStops(): Promise<TransportStop[]> {
  const response = await axios.get(`${BASE_URL}/stops`);
  const data = response.data;

  return data.map((stop: any) => ({
    id: stop.StopCode || stop.id,
    name: stop.StopName || stop.name,
    type: stop.Type.toLowerCase(), // make sure it matches 'bus' | 'tram' | 'train' | 'metro' | 'ferries'
    position: [stop.Latitude, stop.Longitude] as [number, number],
  }));
}
