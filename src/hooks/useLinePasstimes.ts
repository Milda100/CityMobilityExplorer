import { useQuery } from "@tanstack/react-query";

export function useLinePasstimes(lineId: string | null) {
  return useQuery({
    queryKey: ["line-passtimes", lineId],
    queryFn: async () => {
      if (!lineId) return null;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/line-passtimes?lineId=${lineId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch line passtimes");

      const data = await res.json();
      console.log("API response:", data);
      return data;
    },
    enabled: Boolean(lineId),
    refetchInterval: 15_000, // Refetch every 15 seconds
  });
}
