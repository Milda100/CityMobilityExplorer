import { useQuery } from "@tanstack/react-query";
import type { TransportType } from "../types/transportType";

export type Departure = {
  idOfVehicle: string;
  lineId: string;
  lineNumber: string;
  LineName: string;
  destination: string;
  expectedDeparture: string;
  scheduledDeparture: string;
  type: TransportType | "UNKNOWN";
  operatorCode: string;
  linePlanningNumber: string;
  direction: number;
  status: string;
};

export function useDepartures(code: string | null) {
  return useQuery<Departure[]>({
    queryKey: ["departures", code],
    queryFn: async () => {
      if (!code) return [];

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/departures/${code}`,
      );
      if (!res.ok) throw new Error("Failed to fetch departures via proxy");

      const data: Departure[] = await res.json();
      console.log("Fetched departures for code", code, data);
      return data;
    },
    enabled: Boolean(code),
    refetchInterval: 30_000, // refresh every 30s
  });
}
