import type { FeatureCollection, Point } from 'geojson';

export function ovStopsToGeoJSON(raw: Record<string, any>): FeatureCollection<Point, { id: string; name: string; town: string }> {
  const features = Object.values(raw)
    .filter(
      (s: any) =>
        typeof s.Longitude === 'number' &&
        typeof s.Latitude === 'number'
    )
    .map((s: any) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [s.Longitude, s.Latitude],
      },
      properties: {
        id: s.StopAreaCode,
        name: s.TimingPointName,
        town: s.TimingPointTown,
      },
    }));

  return {
    type: 'FeatureCollection' as const,
    features,
  };
}