// import { useQuery } from '@tanstack/react-query';
// import { fetchPassTimes } from '../api/ovapi';

// export function usePassTimes(timingPointCode?: string) {
//   return useQuery({
//     queryKey: ['passTimes', timingPointCode],
//     queryFn: () => fetchPassTimes(timingPointCode!),
//     enabled: !!timingPointCode,
//     refetchInterval: 30_000, // 30s live update
//     staleTime: 10_000,
//   });
// }