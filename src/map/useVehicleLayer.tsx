import { useEffect } from "react";
import type maplibregl from "maplibre-gl";
import { MapLayers } from "./setupLayers";

type UseVehicleLayerParams = {
  mapRef: React.RefObject<maplibregl.Map | null>;
  lineGeoJSON: GeoJSON.FeatureCollection | null;
  selectedStop: any | null;
  lineId: string | null;
  MapSources: {
    VEHICLES: string;
    ROUTE: string;
    STOPS: string;
  };
};

export const useVehicleLayer = ({
  mapRef,
  lineGeoJSON,
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

  /* ---------------- Update Vehicle and Route Data ---------------- */

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const vehicleSource = map.getSource(MapSources.VEHICLES) as maplibregl.GeoJSONSource;
    const routeSource = map.getSource(MapSources.ROUTE) as maplibregl.GeoJSONSource;
    if (!vehicleSource || !routeSource) return;

    if (!selectedStop || !lineId || !lineGeoJSON) {
      vehicleSource.setData({ type: "FeatureCollection", features: []});
      routeSource.setData({ type: "FeatureCollection", features: [] });
      return;
    }

    const vehiclesFeatures = lineGeoJSON.features.filter(f => f.geometry.type === "Point");
    const routeFeatures = lineGeoJSON.features.filter(f => f.geometry.type === "LineString");
    console.log("route features", routeFeatures);
    console.log(
      "lineGeoJSON",
      lineGeoJSON.features.map((f) => f.geometry?.type),
    );
    
    vehicleSource.setData({
      type: "FeatureCollection",
      features: vehiclesFeatures,
    });

    routeSource.setData({
      type: "FeatureCollection",
      features: routeFeatures,
    });    
  }, [mapRef, lineGeoJSON, selectedStop, lineId]);
};
