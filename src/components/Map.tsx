import { useEffect, useRef, useMemo } from "react";
import maplibregl from "maplibre-gl";
import { useStopAreas } from "../hooks/useStopAreas";
import { toGeoJSON } from "../utils/toGeoJSON";
import type { Stop } from "../types/stop";
import { useLinePasstimes } from "../hooks/useLinePasstimes";
import { transportConfig } from "../utils/transportIconConfig";
// import { useLines } from "../hooks/useLines";

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
}

function Map({ selectedStop, onSelectedStop, lineId, mapRef }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const internalMapRef = useRef<maplibregl.Map | null>(null);
  const mapReference = mapRef ?? internalMapRef;

  const { data: stopAreas, isLoading, error } = useStopAreas();
  // const { data: lines, isLoading: isLoadingLines, error: linesError } = useLines();
  const { data: lineActuals } = useLinePasstimes(lineId);
  console.log("fetching vehicles for lineId:", lineId);
  console.log("lineActuals from hook:", lineActuals);

 /* ---------------- Stops GeoJSON ---------------- */
  const allStopsGeoJSON =
    useMemo<GeoJSON.FeatureCollection<GeoJSON.Point> | null>(() => {
      if (!stopAreas) return null;
      return toGeoJSON(stopAreas);
    }, [stopAreas]);

/* ---------------- Vehicles GeoJSON ---------------- */
  const vehiclesGeoJSON = useMemo(() => {
    if (!lineActuals || !lineId) return null;

    const lineData = lineActuals[lineId];
    if (!lineData?.Actuals) return null;

    const vehiclesArray = Object.values(lineData.Actuals);

    const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
      type: "FeatureCollection",
      features: vehiclesArray.map((v: any) => {
        const transportType = (v.TransportType as keyof typeof transportConfig) ?? "UNKNOWN";

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
      })
    };
    return geojson;
  }, [lineActuals, lineId]);


  useEffect(() => {
    if (vehiclesGeoJSON) {
      console.log("Vehicles GeoJSON ready:", vehiclesGeoJSON);
    }
  }, [vehiclesGeoJSON]);

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

    // ---- Fail-safe image loader ----
    const loadImageSafe = (src: string) =>
      new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => {
          console.warn("Image failed to load:", src, e);
          resolve(null); // continue even if broken
        };
        img.src = src;
      });

    map.on("load", async () => {
     /* ---- VEHICLES ---- */
      map.addSource("vehicles-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      for (const [type, config] of Object.entries(transportConfig)) {
        if (!config.mapIcon) continue;

        const vehicleImg = await loadImageSafe(config.mapIcon!);
        if (vehicleImg && !map.hasImage(type)) {
          map.addImage(type, vehicleImg);
          console.log("Loaded vehicle icon:", type);
        }
      }

      map.addLayer({
        id: "vehicles-layer",
        type: "symbol",
        source: "vehicles-source",
        layout: {
          "icon-image": ["get", "icon"],
          "icon-size": 0.4,
          "icon-allow-overlap": true,
        },
      });

      /* ---- STOPS ---- */
      map.addSource("stops-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      const stopImg = await loadImageSafe("/icons/stop.svg");
      if (stopImg && !map.hasImage("stop")) {
        map.addImage("stop", stopImg, { sdf: false });
        console.log("Loaded stop icon");
      }

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
      
      /* ---- Hover & click ---- */
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

        onSelectedStop({
          id: props.id,
          stopName: props.stopName,
          coordinates: coords,
        });
      });
    });

    mapReference.current = map;
    return () => {
      map.remove();
      mapReference.current = null;
    };
  }, []);

/* ---------------- Update visible stops based on viewport ---------------- */
  useEffect(() => {
    if (!mapReference.current || !allStopsGeoJSON) return;

    const map = mapReference.current;

    const updateVisibleStops = () => {
      const bounds = map.getBounds();
      const visibleFeatures = allStopsGeoJSON.features.filter((feature) =>
        bounds.contains(feature.geometry.coordinates as [number, number]),
      );

      const source = map.getSource("stops-source") as maplibregl.GeoJSONSource | undefined;
      if (!source) return;
      source.setData({ type: "FeatureCollection", features: visibleFeatures });
    };
    updateVisibleStops();     // Initial render
    map.on("moveend", updateVisibleStops);     // Update when user pans or zooms
    return () => {
      map.off("moveend", updateVisibleStops);
    };
  }, [allStopsGeoJSON]);

//   // Update vehicles layer whenever line actuals change
//   useEffect(() => {
//   if (!mapReference.current || !vehiclesGeoJSON) return;

//   const source = mapReference.current.getSource("vehicles-source") as maplibregl.GeoJSONSource | undefined;
//   if (!source) return;

//   source.setData(vehiclesGeoJSON);
// }, [vehiclesGeoJSON]);

 /* ---------------- Show / hide vehicles ---------------- */

  useEffect(() => {
    if (!mapReference.current) return;

    const map = mapReference.current;
    const visible = Boolean(selectedStop && lineId);

    if (!map.getLayer("vehicles-layer")) return;

    map.setLayoutProperty(
      "vehicles-layer",
      "visibility",
      visible ? "visible" : "none"
    );
  }, [selectedStop, lineId]);

/* ---------------- Update vehicle data ---------------- */

  useEffect(() => {
    if (!mapReference.current || !vehiclesGeoJSON) return;
    if (!selectedStop || !lineId) return;

    const source = mapReference.current.getSource(
      "vehicles-source"
    ) as maplibregl.GeoJSONSource;

    source.setData(vehiclesGeoJSON);
  }, [vehiclesGeoJSON, selectedStop, lineId]);

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
