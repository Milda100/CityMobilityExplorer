import { useQuery } from '@tanstack/react-query';

export function useStopAreas() {
  return useQuery({
    queryKey: ['stop-areas'],
    queryFn: async () => {
      const res = await fetch('https://v0.ovapi.nl/stopareacode');
      if (!res.ok) throw new Error('Failed to fetch stop areas');
      return res.json();
    },
    staleTime: 1000 * 60 * 60, // stops don’t move
  });
}
