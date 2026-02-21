import type { TransportType } from "./transportType";

export type Departure = {
  id: string;
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
