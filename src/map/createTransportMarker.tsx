import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { colors, transportIconMap } from './transportIcons';
import type { TransportType } from '../data/transportStops';

export function createTransportMarker(type: TransportType) {
  const IconComponent = transportIconMap[type];

  const html = renderToStaticMarkup(
    <div 
    className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-md"
    style={{backgroundColor: colors[type]}}
    >
      <IconComponent style={{ fontSize: 20 }} />
    </div>
  );

  return L.divIcon({
    html,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}
