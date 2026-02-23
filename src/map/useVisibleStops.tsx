import { useEffect } from "react";
import type maplibregl from "maplibre-gl";
import type { Feature, Point, FeatureCollection } from "geojson";
import { MapSources } from "./setupLayers";

type UseVisibleStopsParams = {
  mapRef: React.RefObject<maplibregl.Map | null>;
  stopsGeoJSON: FeatureCollection<Point> | null;
};

/*
 * Updates visible stops in the map based on current viewport bounds.
 * Automatically updates when map moves or zooms.
 */
export const useVisibleStops = ({
  mapRef,
  stopsGeoJSON,
}: UseVisibleStopsParams) => {
  useEffect(() => {
    if (!mapRef.current || !stopsGeoJSON) return;

    const map = mapRef.current;

    const updateVisibleStops = () => {
      const bounds = map.getBounds();

      // Filter features inside viewport
      const visibleFeatures = stopsGeoJSON.features.filter(
        (feature: Feature<Point>) =>
          bounds.contains(feature.geometry.coordinates as [number, number]),
      );

      const source = map.getSource(MapSources.STOPS) as
        | maplibregl.GeoJSONSource
        | undefined;
      if (!source) return;

      source.setData({ type: "FeatureCollection", features: visibleFeatures });
    };

    // Initial render
    updateVisibleStops();

    // Update on map moves or zooms
    map.on("moveend", updateVisibleStops);

    return () => {
      map.off("moveend", updateVisibleStops);
    };
  }, [mapRef, stopsGeoJSON]);
};
