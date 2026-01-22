import { useEffect, useRef, useState, useMemo } from "react";
import maplibregl from "maplibre-gl";
import { useStopAreas } from "../hooks/useStopAreas";
import { toGeoJSON } from "../utils/toGeoJSON";
import { Sidebar } from "./Sidebar";
import type { Stop } from "../types/stop";

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

function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const { data, isLoading, error } = useStopAreas();
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  // Memoize the conversion to GeoJSON
  const allStopsGeoJSON =
    useMemo<GeoJSON.FeatureCollection<GeoJSON.Point> | null>(() => {
      if (!data) return null;
      return toGeoJSON(data);
    }, [data]);

  // Initialization
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OSM_STYLE,
      center: [4.9041, 52.3676],
      zoom: 12,
    });

    //user's current location if permission granted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        map.setCenter([position.coords.longitude, position.coords.latitude]);
        map.setZoom(12);
      });
    }

    map.on("load", async () => {
      map.addSource("stops-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = "/icons/stop.svg";
      });

      map.addImage("stop", img, { sdf: false });

      map.addLayer({
        id: "stops-layer",
        type: "symbol",
        source: "stops-source",
        layout: {
          "icon-image": "stop",
          "icon-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            0.25,
            13,
            0.35,
            16,
            0.5,
          ],
          "icon-allow-overlap": true,
          "icon-anchor": "bottom",
        },
      });

      map.on("mouseenter", "stops-layer", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "stops-layer", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", "stops-layer", (e) => {
        if (!e.features?.length) return;

        const feature = e.features[0];
        if (feature.geometry.type !== "Point") return;

        const coords = feature.geometry.coordinates as [number, number];
        const props = feature.properties as Stop;
        console.log("Stop clicked:", props);

        setSelectedStop({
          id: props.id,
          stopName: props.stopName,
          coordinates: coords,
        });

        map.easeTo({
          center: coords,
          offset: [-150, 0],
          duration: 400,
        });
      });
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update stops based on viewport
  useEffect(() => {
    if (!mapRef.current || !allStopsGeoJSON) return;

    const map = mapRef.current;

    const updateVisibleStops = () => {
      const bounds = map.getBounds();
      const visibleFeatures = allStopsGeoJSON.features.filter((feature) =>
        bounds.contains(feature.geometry.coordinates as [number, number]),
      );

      const source = map.getSource("stops-source") as maplibregl.GeoJSONSource;
      source.setData({ type: "FeatureCollection", features: visibleFeatures });
    };

    // Initial render
    updateVisibleStops();

    // Update when user pans or zooms
    map.on("moveend", updateVisibleStops);

    return () => {
      map.off("moveend", updateVisibleStops);
    };
  }, [allStopsGeoJSON]);

  return (
    <>
      <div className="relative w-full h-full">
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
        <div ref={mapContainerRef} className="w-full h-full" />
        <Sidebar stop={selectedStop} onClose={() => setSelectedStop(null)} />
      </div>
    </>
  );
}

export default Map;
