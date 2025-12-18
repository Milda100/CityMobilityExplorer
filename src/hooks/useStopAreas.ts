import { useQuery } from '@tanstack/react-query';
import { fetchStopAreas } from '../api/ovapi';

export function useStopAreas() {
  return useQuery({
    queryKey: ['stopAreas'],
    queryFn: fetchStopAreas,
    staleTime: 24 * 60 * 60 * 1000, // basically static
  });
}
