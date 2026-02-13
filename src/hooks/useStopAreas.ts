import { useQuery } from '@tanstack/react-query';

export function useStopAreas() {
  return useQuery({
    queryKey: ['stop-areas'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/api/stop-areas');
      if (!res.ok) throw new Error('Failed to fetch stop areas via proxy');
      return res.json();
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
