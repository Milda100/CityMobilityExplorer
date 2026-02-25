import { useQuery } from "@tanstack/react-query";

export function useLinePasstimes(lineId: string | null) {
  return useQuery<GeoJSON.FeatureCollection<GeoJSON.Point> | null>({
    queryKey: ["line-passtimes", lineId],
    queryFn: async () => {
      if (!lineId) return null;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/line-passtimes?lineId=${lineId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch line passtimes");

      const data = await res.json();
      console.log("GeoJSON response:", data);
      return data as GeoJSON.FeatureCollection<GeoJSON.Point>;
    },
    enabled: Boolean(lineId),
    refetchInterval: 10_000, // Refetch every 10 seconds
  });
}
