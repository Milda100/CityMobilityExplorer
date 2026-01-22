import type { TransportMode } from "./transportMode";

export type Departure = {
  line: string;
  destination: string;
  time: string;
  type: TransportMode | "UNKNOWN";
};
