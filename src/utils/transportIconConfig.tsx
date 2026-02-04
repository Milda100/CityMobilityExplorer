import type { JSX } from "react";
import { FaTrain, FaBus, FaShip, FaQuestion } from "react-icons/fa";
import { FaTrainTram, FaTrainSubway } from "react-icons/fa6";
import type { TransportType } from "../types/transportType";

export const transportIcons: Record<TransportType | "UNKNOWN", JSX.Element> = {
  TRAIN: <FaTrain className="text-blue-600" />,
  BUS: <FaBus className="text-yellow-500" />,
  METRO: <FaTrainSubway className="text-purple-600" />,
  TRAM: <FaTrainTram className="text-red-500" />,
  BOAT: <FaShip className="text-teal-600" />,
  UNKNOWN: <FaQuestion className="text-gray-400" />,
};

export const iconBgColors: Record<TransportType | "UNKNOWN", string> = {
  TRAIN: "bg-blue-100",
  BUS: "bg-yellow-100",
  METRO: "bg-purple-100",
  TRAM: "bg-red-100",
  BOAT: "bg-teal-100",
  UNKNOWN: "bg-gray-100",
};
