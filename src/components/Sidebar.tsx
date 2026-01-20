import type { Stop } from "../types/stop";
import { useDepartures } from "../hooks/useDepartures";
import {FaTrain, FaBus, FaShip, FaQuestion} from "react-icons/fa";
import { FaTrainTram, FaTrainSubway  } from "react-icons/fa6";
import type { TransportMode } from "../types/transport";
import type { JSX } from "react";

export const transportIcons: Record<TransportMode | "UNKNOWN", JSX.Element> = {
  TRAIN: <FaTrain className="text-blue-600" />,
  BUS: <FaBus className="text-yellow-500" />,
  METRO: <FaTrainSubway className="text-purple-600" />,
  TRAM: <FaTrainTram className="text-red-500" />,
  FERRY: <FaShip className="text-teal-600" />,
  UNKNOWN: <FaQuestion className="text-gray-400" />,
};

type SidebarProps = {
  stop: Stop | null;
  onClose: () => void;
};

export function Sidebar({ stop, onClose }: SidebarProps) {
  const isOpen = Boolean(stop);
  const { data: departures, isLoading, error } = useDepartures(stop?.id ?? null);

 return (
    <aside
      className={`
        fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-20
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">{stop?.name ?? ""}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-black">
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-500">
          Upcoming departures
        </p>
      {/* Loading */}
        {isLoading && (
          <div className="text-sm text-gray-400">Loading departures…</div>
        )}

        {/* Error */}
        {error && (
          <div className="text-sm text-red-500">
            Failed to load departures
          </div>
        )}

        {/* No departures */}
        {!isLoading && !error && departures?.length === 0 && (
          <div className="text-sm text-gray-400">
            No upcoming departures
          </div>
        )}

        {/* Departure list */}
        {departures?.map((dep, i) => (
          <div
            key={i}
            className="flex justify-between items-center border-b pb-2 text-sm"
          >
            <div className="flex items-center gap-2">
              <div>{transportIcons[dep.type]}</div>
              <div>
                <div className="font-medium">Line {dep.line}</div>
                <div className="text-gray-500">{dep.destination}</div>
              </div>
            </div>
            <div className="font-semibold">
              {new Date(dep.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
