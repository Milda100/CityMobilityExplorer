import { useEffect } from "react";
import type maplibregl from "maplibre-gl";
import { MapLayers } from "./setupLayers";

type UseVehicleLayerParams = {
  mapRef: React.RefObject<maplibregl.Map | null>;
  vehiclesGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Point> | null;
  selectedStop: any | null;
  lineId: string | null;
};

export const useVehicleLayer = ({
  mapRef,
  vehiclesGeoJSON,
  selectedStop,
  lineId,
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
    if (!mapRef.current || !vehiclesGeoJSON) return;
    if (!selectedStop || !lineId) return;

    const source = mapRef.current.getSource(
      "vehicles-source",
    ) as maplibregl.GeoJSONSource;

    if (!source) return;
    source.setData(vehiclesGeoJSON);
  }, [mapRef, vehiclesGeoJSON, selectedStop, lineId]);
};
