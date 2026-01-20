import type { TransportMode } from "./transport";

export type Departure = {
  line: string;
  destination: string;
  time: string;
  type: TransportMode | "UNKNOWN";
};