import { useQuery } from "@tanstack/react-query";
import type { Departure } from "../types/departure";

export function useDepartures(code: string | null) {
  return useQuery({
    queryKey: ["departures", code],
    queryFn: async () => {
      if (!code) return [];
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/departures?code=${code}`,
      );
      if (!res.ok) throw new Error("Failed to fetch departures via proxy");
      const data = await res.json();
      const stopData = data[code];
      if (!stopData) return [];

      // Flatten all Passes from all timing points
      const departures: Departure[] = Object.values(stopData)
        .flatMap((timingPoint: any) => Object.values(timingPoint.Passes))
        .map((d: any) => ({
          line: d.LinePublicNumber,
          destination: d.DestinationName50,
          time: d.ExpectedDepartureTime || d.AimedDepartureTime,
          type: d.TransportType ?? "UNKNOWN",
          operatorCode: d.OperatorCode,
          linePlanningNumber: d.LinePlanningNumber,
          direction: d.LineDirection,
        }));
      // Sort by time
      departures.sort(
        (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
      );

      return departures;
    },
    enabled: Boolean(code),
    refetchInterval: 30_000,
  });
}
