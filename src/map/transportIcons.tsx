import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import TramIcon from '@mui/icons-material/Tram';
import TrainIcon from '@mui/icons-material/Train';
import SubwayIcon from '@mui/icons-material/Subway';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';

import type { TransportType } from '../data/transportStops';

export const transportIconMap: Record<TransportType, React.ElementType> = {
  bus: DirectionsBusIcon,
  tram: TramIcon,
  train: TrainIcon,
  metro: SubwayIcon,
  ferry: DirectionsBoatIcon,
};

export const colors: Record<TransportType, string> = {
  bus: '#2563eb',    // Blue
  tram: '#dc2626',   // Red
  train: '#16a34a',  // Green
  metro: '#7c3aed',  // Purple
  ferry: '#0891b2' // Teal
};

