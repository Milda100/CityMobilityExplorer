import { useQuery } from '@tanstack/react-query';

export function useTimingPoints() {
  return useQuery({
    queryKey: ['timing-points'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/api/timing-points');
      if (!res.ok) throw new Error('Failed to fetch timing points via proxy');
      return res.json();
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}
