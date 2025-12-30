export function ovStopsToGeoJSON(raw: Record<string, any>) {
  const features = Object.values(raw)
    .filter(
      (s: any) =>
        typeof s.Longitude === 'number' &&
        typeof s.Latitude === 'number'
    )
    .map((s: any) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [s.Longitude, s.Latitude], // lng, lat
      },
      properties: {
        id: s.StopAreaCode,
        name: s.TimingPointName,
        town: s.TimingPointTown,
      },
    }));

  return {
    type: 'FeatureCollection',
    features,
  };
}