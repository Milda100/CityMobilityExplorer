import type { ComponentType, SVGProps } from "react";
import type { TransportType } from "../types/transportType";
import TrainIcon from "../assets/icons/train.svg?react";
import BusIcon from "../assets/icons/bus.svg?react";
import MetroIcon from "../assets/icons/metro.svg?react";
import TramIcon from "../assets/icons/tram.svg?react";
import BoatIcon from "../assets/icons/boat.svg?react";
import UnknownIcon from "../assets/icons/unknown.svg?react";

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;
const base = import.meta.env.BASE_URL;

export const transportConfig: Record<
  TransportType | "UNKNOWN",
  {
    icon: SvgIcon; // React component for sidebar
    mapIcon: string; // Public URL for MapLibre
  }
> = {
  TRAIN: {
    icon: TrainIcon,
    mapIcon: `${base}/icons/train.svg`,
  },
  BUS: {
    icon: BusIcon,
    mapIcon: `${base}/icons/bus.svg`,
  },
  METRO: {
    icon: MetroIcon,
    mapIcon: `${base}/icons/metro.svg`,
  },
  TRAM: {
    icon: TramIcon,
    mapIcon: `${base}/icons/tram.svg`,
  },
  BOAT: {
    icon: BoatIcon,
    mapIcon: `${base}/icons/boat.svg`,
  },
  UNKNOWN: {
    icon: UnknownIcon,
    mapIcon: `${base}/icons/unknown.svg`,
  },
};
