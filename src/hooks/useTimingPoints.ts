import { useQuery } from '@tanstack/react-query';
import { fetchTimingPoints } from '../api/ovapi';

export function useTimingPoints(stopAreaCode?: string) {
  return useQuery({
    queryKey: ['timingPoints', stopAreaCode],
    queryFn: () => fetchTimingPoints(stopAreaCode!),
    enabled: !!stopAreaCode, // critical
    staleTime: 5 * 60 * 1000,
  });
}