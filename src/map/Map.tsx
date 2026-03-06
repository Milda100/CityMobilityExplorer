import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { Stop } from "../types/stop";
import { useLineActuals } from "../hooks/useLineActuals";
import { transportConfig } from "../utils/transportIconConfig";
import { useTpc } from "../hooks/useTpc";
import { MapSources, setupMapLayers } from "./setupLayers";
import { useVehicleLayer } from "./useVehicleLayer";
import { useVisibleStops } from "./useVisibleStops";

const base = import.meta.env.BASE_URL;

// Safe image loader helper
export const loadImageSafe = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.warn("Image failed to load:", src, e);
      resolve(null);
    };
    img.src = src;
  });

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
  const { data: vehiclesGeoJSON } = useLineActuals(lineId);

  /* ---------------- Vehicles GeoJSON ---------------- */
  useVehicleLayer({
    mapRef: mapReference,
    vehiclesGeoJSON: vehiclesGeoJSON ?? null,
    selectedStop,
    lineId,
    MapSources: {
      VEHICLES: "vehicles-source",
      STOPS: "stops-source",
    },
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
      // Preload stop icon asynchronously
      loadImageSafe(`${base}/icons/stop.svg`).then((stopImg) => {
        if (stopImg && !map.hasImage("stop")) {
          map.addImage("stop", stopImg, { sdf: false });
          console.log("Stop icon loaded");
          const stopsSource = map.getSource(
            MapSources.STOPS,
          ) as maplibregl.GeoJSONSource;
          stopsSource?.setData(tpcGeojson);
        }
      });

      // Preload vehicle icons asynchronously
      for (const [type, config] of Object.entries(transportConfig)) {
        if (!config.mapIcon) continue;
        loadImageSafe(config.mapIcon).then((vehicleImg) => {
          if (vehicleImg && !map.hasImage(type)) {
            map.addImage(type, vehicleImg);
            console.log("Vehicle icon loaded:", type);
          }
        });
      }

      // Setup layers immediately without waiting for images
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
