import { type TransportStop } from "../types/transport";

export function stopsToGeoJSON(stops: TransportStop[]) {
  return {
    type: "FeatureCollection",
    features: stops.map((stop) => ({
      type: "Feature",
      id: stop.id,
      geometry: {
        type: "Point",
        coordinates: stop.coordinates, // [lng, lat]
      },
      properties: {
        name: stop.name,
        mode: stop.type,
      },
    })),
  };
}