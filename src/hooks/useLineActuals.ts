import { useQuery } from "@tanstack/react-query";

export function useLineActuals(lineId: string | null) {
  return useQuery<GeoJSON.FeatureCollection<GeoJSON.Point> | null>({
    queryKey: ["line-actuals", lineId],
    queryFn: async () => {
      if (!lineId) return null;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/line-actuals?lineId=${lineId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch line actuals");

      const data = await res.json();
      console.log("GeoJSON response:", data);
      return data as GeoJSON.FeatureCollection<GeoJSON.Point>;
    },
    enabled: Boolean(lineId),
    refetchInterval: 10_000, // Refetch every 10 seconds
  });
}
