import { type TransportStop } from '../types/transport';

export const transportStops: TransportStop[] = [
  { id: 'stop-amc', name: 'Amsterdam Centraal', type: 'train', coordinates: [4.9006, 52.378] },
  { id: 'stop-dam', name: 'Dam Square', type: 'tram', coordinates: [4.8922, 52.3731] },
  { id: 'stop-leidseplein', name: 'Leidseplein', type: 'tram', coordinates: [4.8836, 52.364] },
  { id: 'stop-museumplein', name: 'Museumplein', type: 'bus', coordinates: [4.8813, 52.3579] },
  { id: 'stop-sloterdijk', name: 'Sloterdijk Station', type: 'train', coordinates: [4.8379, 52.3889] },
  { id: 'stop-ferry-noord', name: 'Buiksloterweg Ferry', type: 'ferry', coordinates: [4.9125, 52.3974] },
  { id: 'stop-noord', name: 'Noord Metro', type: 'metro', coordinates: [4.9003, 52.4095] },
];
