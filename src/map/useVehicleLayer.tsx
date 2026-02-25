import { useEffect } from "react";
import type maplibregl from "maplibre-gl";
import { MapLayers } from "./setupLayers";

type UseVehicleLayerParams = {
  mapRef: React.RefObject<maplibregl.Map | null>;
  vehiclesGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Point> | null;
  selectedStop: any | null;
  lineId: string | null;
  MapSources: {
    VEHICLES: string;
    STOPS: string;
  };
};

export const useVehicleLayer = ({
  mapRef,
  vehiclesGeoJSON,
  selectedStop,
  lineId,
  MapSources,
}: UseVehicleLayerParams) => {
  /* ---------------- Show / Hide Vehicles ---------------- */
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const visible = Boolean(selectedStop && lineId);

    if (!map.getLayer(MapLayers.VEHICLES)) return;

    map.setLayoutProperty(
      MapLayers.VEHICLES,
      "visibility",
      visible ? "visible" : "none",
    );
  }, [mapRef, selectedStop, lineId]);

  /* ---------------- Update Vehicle Data ---------------- */

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource(
      MapSources.VEHICLES,
    ) as maplibregl.GeoJSONSource;
    if (!source) return;

    if (!selectedStop || !lineId) {
      source.setData({
        type: "FeatureCollection",
        features: [],
      });
      return;
    }

    if (vehiclesGeoJSON) {
      source.setData(vehiclesGeoJSON);
    }
  }, [mapRef, vehiclesGeoJSON, selectedStop, lineId]);
};
