// import type { FeatureCollection, Point } from "geojson";
// import type { Stop } from "../types/stop";

// export function toGeoJSON(
//   raw: Record<string, any>,
// ): FeatureCollection<Point, Stop> {
//   const features = Object.values(raw)
//     .filter(
//       (s: any) =>
//         typeof s.Longitude === "number" && typeof s.Latitude === "number",
//     )
//     .map((s: any) => ({
//       type: "Feature" as const,
//       geometry: {
//         type: "Point" as const,
//         coordinates: [s.Longitude, s.Latitude], 
//       },
//       properties: {
//         id: s.StopAreaCode,
//         stopName: s.TimingPointName,
//         coordinates: [s.Longitude, s.Latitude] as [number, number],
//       },
//     }));

//   return {
//     type: "FeatureCollection" as const,
//     features,
//   };
// }
