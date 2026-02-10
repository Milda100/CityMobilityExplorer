import type { JSX } from "react";
import { FaTrain, FaBus, FaShip, FaQuestion } from "react-icons/fa";
import { FaTrainTram, FaTrainSubway } from "react-icons/fa6";
import type { TransportType } from "../types/transportType";

export const transportConfig: Record<TransportType | "UNKNOWN", {
  reactIcon: JSX.Element;
  bgColor: string;
  mapIcon?: string; // URL or Mapbox sprite name
}> = {
  TRAIN: {
    reactIcon: <FaTrain className="text-blue-600" />,
    bgColor: "bg-blue-100",
    mapIcon: "/icons/train.svg",
  },
  BUS: {
    reactIcon: <FaBus className="text-yellow-500" />,
    bgColor: "bg-yellow-100",
    mapIcon: "/icons/bus.svg",
  },
  METRO: {
    reactIcon: <FaTrainSubway className="text-purple-600" />,
    bgColor: "bg-purple-100",
    mapIcon: "/icons/metro.svg",
  },
  TRAM: {
    reactIcon: <FaTrainTram className="text-red-500" />,
    bgColor: "bg-red-100",
    mapIcon: "/icons/tram.svg",
  },
  BOAT: {
    reactIcon: <FaShip className="text-teal-600" />,
    bgColor: "bg-teal-100",
    mapIcon: "/icons/boat.svg",
  },
  UNKNOWN: {
    reactIcon: <FaQuestion className="text-gray-400" />,
    bgColor: "bg-gray-100",
    mapIcon: "/icons/unknown.svg",
  },
};

export const iconBgColors: Record<TransportType | "UNKNOWN", string> = {
  TRAIN: "bg-blue-100",
  BUS: "bg-yellow-100",
  METRO: "bg-purple-100",
  TRAM: "bg-red-100",
  BOAT: "bg-teal-100",
  UNKNOWN: "bg-gray-100",
};

// export const tailwindToHex: Record<string, string> = {
//   "bg-blue-100": "#dbeafe",
//   "bg-yellow-100": "#fef9c3",
//   "bg-purple-100": "#ede9fe",
//   "bg-red-100": "#fee2e2",
//   "bg-teal-100": "#ccfbf1",
//   "bg-gray-100": "#f3f4f6",
// };
