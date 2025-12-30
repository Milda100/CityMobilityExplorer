// import { useQuery } from '@tanstack/react-query';
// import { fetchStopAreas } from '../api/ovapi';

// export function useStopAreas() {
//   return useQuery({
//     queryKey: ['stopAreas'],
//     queryFn: fetchStopAreas,
//     staleTime: 24 * 60 * 60 * 1000, // basically static
//   });
// }

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
