import { useQuery } from '@tanstack/react-query';

export function useLines() {
  return useQuery({
    queryKey: ['lines'],
    queryFn: async () => {
      const res = await fetch(`http://localhost:3000/api/lines`);
      if (!res.ok) throw new Error('Failed to fetch lines');
      const data = await res.json();
      console.log("Fetched lines:", data);
      return data;
    },
  });
}
