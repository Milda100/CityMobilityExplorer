import { useQuery } from "@tanstack/react-query";

export function useTpc(code: string) {
  return useQuery({
    queryKey: ["tpc", code],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/api/tpc?code=${code}`);
      if (!res.ok) throw new Error("Failed to fetch timing points via proxy");
      return res.json();
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
