
export type TransportMode = 'BUS' | 'TRAM' | 'TRAIN' | 'METRO' | 'FERRY';

export interface TransportStop {
  id: string;
  name: string;
  type: TransportMode;
  coordinates: [number, number]; // [lat, lng]
}

