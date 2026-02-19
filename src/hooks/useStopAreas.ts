import { useQuery } from "@tanstack/react-query";

export function useStopAreas() {
  return useQuery({
    queryKey: ["stop-areas"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stop-areas`);
      if (!res.ok) throw new Error("Failed to fetch stop areas via proxy");
      return res.json();
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
