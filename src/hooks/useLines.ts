import { useQuery } from "@tanstack/react-query";

export function useLines() {
  return useQuery({
    queryKey: ["lines"],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/lines`);
      if (!res.ok) throw new Error("Failed to fetch lines");
      const data = await res.json();
      console.log("Fetched lines:", data);
      return data;
    },
  });
}
