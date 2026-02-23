import { useEffect, useRef, useMemo } from "react";
import maplibregl from "maplibre-gl";
import type { Stop } from "../types/stop";
import { useLinePasstimes } from "../hooks/useLinePasstimes";
import { transportConfig } from "../utils/transportIconConfig";
import { useTpc } from "../hooks/useTpc";
import { setupMapLayers } from "./setupLayers";
import { useVehicleLayer } from "./useVehicleLayer";
import { useVisibleStops } from "./useVisibleStops";

const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "osm-raster-tiles": {
      type: "raster",
      tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap Contributors",
    },
  },
  layers: [
    {
      id: "osm-raster-layer",
      type: "raster",
      source: "osm-raster-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

type MapProps = {
  selectedStop: Stop | null;
  onSelectedStop: (stop: Stop | null) => void;
  lineId: string | null;
  mapRef?: React.RefObject<maplibregl.Map | null>;
};

function Map({ selectedStop, onSelectedStop, lineId, mapRef }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const internalMapRef = useRef<maplibregl.Map | null>(null);
  const mapReference = mapRef ?? internalMapRef;

  const { data: tpcGeojson, isLoading, error } = useTpc();
  const { data: lineActuals } = useLinePasstimes(lineId);

  /* ---------------- Vehicles GeoJSON ---------------- */
  const vehiclesGeoJSON = useMemo(() => {
    if (!lineActuals || !lineId) return null;

    const lineData = lineActuals[lineId];
    if (!lineData?.Actuals) return null;

    const vehiclesArray = Object.values(lineData.Actuals);

    const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
      type: "FeatureCollection",
      features: vehiclesArray.map((v: any) => {
        const transportType =
          (v.TransportType as keyof typeof transportConfig) ?? "UNKNOWN";

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [v.Longitude, v.Latitude],
          },
          properties: {
            icon: transportType,
            bearing: v.Bearing ?? 0,
            line: v.LinePublicNumber,
            destination: v.DestinationName50,
          },
        };
      }),
    };
    return geojson;
  }, [lineActuals, lineId]);

  useEffect(() => {
    if (vehiclesGeoJSON) {
      console.log("Vehicles GeoJSON ready:", vehiclesGeoJSON);
    }
  }, [vehiclesGeoJSON]);

  useVehicleLayer({
    mapRef: mapReference,
    vehiclesGeoJSON,
    selectedStop,
    lineId,
  });

  /* ---------------- Map initialization ---------------- */
  useEffect(() => {
    if (mapReference.current || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OSM_STYLE,
      center: [4.9041, 52.3676], // Amsterdam center
      zoom: 12,
    });
    //user's current location if permission granted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        map.setCenter([position.coords.longitude, position.coords.latitude]);
        map.setZoom(12);
      });
    }

    map.on("load", () => {
      setupMapLayers({ map, onSelectedStop });
    });

    mapReference.current = map;
    return () => {
      map.remove();
      mapReference.current = null;
    };
  }, []);

  useVisibleStops({
    mapRef: mapReference,
    stopsGeoJSON: tpcGeojson,
  });

  /* ---------------- Center selected stop ---------------- */

  useEffect(() => {
    if (!mapReference.current || !selectedStop) return;
    mapReference.current.easeTo({
      center: selectedStop.coordinates,
      offset: [-150, 0],
      duration: 400,
    });
  }, [selectedStop]);

  return (
    <>
      <div className="relative w-full h-full">
        <div ref={mapContainerRef} className="w-full h-full" />
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm font-semibold">
            Loading transportation stops…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-100 text-red-700 font-semibold">
            Failed to load stop data
          </div>
        )}
      </div>
    </>
  );
}

export default Map;
