import type { TransportType } from "./transportType";

export type Line = {
  id: string;
  number: string;
  name: string;
  direction: 1 | 2;
  destination: string;
  transportType: TransportType;
};
