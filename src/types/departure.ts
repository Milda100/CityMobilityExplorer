import type { TransportType } from "./transportType";

export type Departure = {
  line: string;
  destination: string;
  time: string;
  type: TransportType | "UNKNOWN";
  operatorCode: string;
  linePlanningNumber: string;
  direction: number;
};
