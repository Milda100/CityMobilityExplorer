
export type TransportMode = 'bus' | 'tram' | 'train' | 'metro' | 'ferry';

export interface TransportStop {
  id: string;
  name: string;
  type: TransportMode;
  coordinates: [number, number]; // [lat, lng]
}


