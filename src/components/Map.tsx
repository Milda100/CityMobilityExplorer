import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
// import { transportStops } from '../data/mockStops';
// import { stopsToGeoJSON } from '../utils/stopsToGeoJSON';

import { useStopAreas } from '../hooks/useStopAreas';
import { ovStopsToGeoJSON } from '../utils/ovStopsToGeoJSON';


const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    'osm-raster-tiles': {
      type: 'raster',
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap Contributors',
    },
  },
  layers: [
    {
      id: 'osm-raster-layer',
      type: 'raster',
      source: 'osm-raster-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

function Map() {

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const { data, isLoading, error } = useStopAreas();
  

  // Data Sync
  useEffect(() => {
  if (!mapRef.current || !isMapReady || !data) return;

  const source = mapRef.current.getSource('stops-source') as maplibregl.GeoJSONSource;

  if (source) {
    source.setData(ovStopsToGeoJSON(data) as any);
  }
}, [data, isMapReady]);



  // Initialization
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OSM_STYLE,
      center: [4.9041, 52.3676],
      zoom: 12,
    });
    

    map.on('load', () => {
      map.addSource('stops-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      map.addLayer({
        id: 'stops-layer',
        type: 'circle',
        source: 'stops-source',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 2, 15, 8],
          'circle-color': '#3b82f6',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff',
        }
      });

      setIsMapReady(true);
    });

    // GIS UX: Change cursor on hover
    map.on('mouseenter', 'stops-layer', () => (map.getCanvas().style.cursor = 'pointer'));
    map.on('mouseleave', 'stops-layer', () => (map.getCanvas().style.cursor = ''));
    
    mapRef.current = map;
    map.on('click', 'stops-layer', (e) => {
      if (!e.features?.length) return;
        const feature = e.features[0];
        console.log('Selected stop:', feature.properties);
      });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);
  

  return (
    <>
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm font-semibold">
          Loading Amsterdam stops…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-100 text-red-700 font-semibold">
          Failed to load stop data
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
    </>
  );
}

export default Map;

