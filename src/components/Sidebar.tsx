import { useDepartures } from "../hooks/useDepartures";
import type { Stop } from "../types/stop";
import { transportConfig } from "../utils/transportIconConfig";

type SidebarProps = {
  stop: Stop | null;
  onClose: () => void;
  onSelectLine: (lineId: string) => void;
};

const statusLabel = (status: string) => {
  switch (status) {
    case "PLANNED":
      return { label: "Scheduled", color: "text-blue-500" };
    case "DRIVING":
      return { label: "On time", color: "text-green-500" };
    case "ARRIVED":
      return { label: "Arrived", color: "text-gray-500" };
    case "PASSED":
      return { label: "Departed", color: "text-gray-400" };
    case "CANCEL":
      return { label: "Cancelled", color: "text-red-500" };
    default:
      return { label: "Unknown", color: "text-gray-400" };
  }
};

export function Sidebar({ stop, onClose, onSelectLine }: SidebarProps) {
  const isOpen = Boolean(stop);
  const {
    data: departures,
    isLoading,
    error,
  } = useDepartures(stop?.tpc ?? null);

  console.log("Departures", departures);

  const getTimeLeftLabel = (departure: string | number | Date) => {
    const now = Date.now();
    const depTime = new Date(departure).getTime();
    const diff = depTime - now;

    if (diff <= 0) return "Departed";

    const minutes = Math.floor(diff / 60000);

    if (minutes === 0) return "Now";
    if (minutes === 1) return "1 min";

    return `${minutes} min`;
  };

  return (
    <aside
      className={`
        fixed bottom-0 right-0 w-full sm:w-96 h-1/2 sm:h-full
        bg-white shadow-xl z-20 rounded-t-lg flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-y-0" : "translate-y-full"}
      `}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 h-16 flex items-center justify-between px-4 shadow-md bg-gradient-to-r from-[#3276c3] to-[#1f4e91] rounded-t-lg">
        <h2 className="text-xl font-semibold text-white">{stop?.name ?? ""}</h2>
        <button
          onClick={onClose}
          className="text-white hover:text-black text-xl"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && (
          <div className="text-sm text-gray-400">Loading departures…</div>
        )}
        {error && (
          <div className="text-sm text-red-500">Failed to load departures</div>
        )}
        {!isLoading && !error && departures?.length === 0 && (
          <div className="text-sm text-gray-400">No upcoming departures</div>
        )}

        {/* Departure list */}
        {departures?.map((d) => {
          const { icon: Icon } = transportConfig[d.type];
          return (
            <div
              key={`${d.vehicleId}`}
              className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              onClick={() => {
                const lineId = d.lineId;
                console.log("Line clicked:", lineId);
                onSelectLine(lineId);
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center`}>
                  <Icon className={`w-10 h-10`} />
                </div>
                <div className="flex flex-col">
                  <div className="font-medium text-gray-800">
                    {d.lineNumber}
                  </div>
                  <div className="text-sm text-gray-500">to {d.destination}</div>
                  {d.status && (
                    <div
                      className={`text-xs font-semibold mt-0.5 ${statusLabel(d.status).color}`}
                    >
                      {statusLabel(d.status).label}
                    </div>
                  )}
                </div>
              </div>

              <div className="font-semibold text-gray-800 text-sm">
                {getTimeLeftLabel(d.expectedDeparture)}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
