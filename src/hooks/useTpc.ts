import { useQuery } from "@tanstack/react-query";

export function useTpc(code: string) {
  return useQuery({
    queryKey: ["tpc"],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/tpc`,
      );
      if (!res.ok) throw new Error("Failed to fetch timing points via proxy");
      return res.json();
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
