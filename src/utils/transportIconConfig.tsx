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
    color: string;
    bgColor: string;
  }
> = {
  TRAIN: {
    icon: TrainIcon,
    mapIcon: `${base}/icons/train.svg`,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  BUS: {
    icon: BusIcon,
    mapIcon: `${base}/icons/bus.svg`,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
  },
  METRO: {
    icon: MetroIcon,
    mapIcon: `${base}/icons/metro.svg`,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  TRAM: {
    icon: TramIcon,
    mapIcon: `${base}/icons/tram.svg`,
    color: "text-red-500",
    bgColor: "bg-red-100",
  },
  BOAT: {
    icon: BoatIcon,
    mapIcon: `${base}/icons/boat.svg`,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
  UNKNOWN: {
    icon: UnknownIcon,
    mapIcon: `${base}/icons/unknown.svg`,
    color: "text-gray-400",
    bgColor: "bg-gray-100",
  },
};
