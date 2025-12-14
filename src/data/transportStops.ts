
export type TransportType = 'bus' | 'tram' | 'train' | 'metro' | 'ferry';

export interface TransportStop {
  id: string;
  name: string;
  type: TransportType;
  position: [number, number]; // [lat, lng]
}

export const transportStops: TransportStop[] = [
  {
    id: 'ams-1',
    name: 'Amsterdam Centraal',
    type: 'train',
    position: [52.3780, 4.9006],
  },
  {
    id: 'ams-2',
    name: 'Dam Square',
    type: 'tram',
    position: [52.3731, 4.8922],
  },
  {
    id: 'ams-3',
    name: 'Leidseplein',
    type: 'tram',
    position: [52.3640, 4.8836],
  },
  {
    id: 'ams-4',
    name: 'Museumplein',
    type: 'bus',
    position: [52.3579, 4.8813],
  },
  {
    id: 'ams-5',
    name: 'Sloterdijk Station',
    type: 'train',
    position: [52.3889, 4.8379],
  },
  {
    id: 'ams-6',
    name: 'Ferry Buiksloterweg',
    type: 'ferry',
    position: [52.3974, 4.9125],
  },
  {
    id: 'ams-7',
    name: 'Metro Station Noord',
    type: 'metro',
    position: [52.4095, 4.9003],
  }
];
