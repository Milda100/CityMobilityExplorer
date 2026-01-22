import type { Stop } from "../types/stop";
import { useDepartures } from "../hooks/useDepartures";
import { transportIcons, iconBgColors } from "../utils/iconConfig";

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
        fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-20
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 h-16 flex items-center justify-between px-4 shadow-lg bg-gradient-to-r from-[#3276c3] to-[#1f4e91]">
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
        {isLoading && <div className="text-sm text-gray-400">Loading departures…</div>}
        {error && <div className="text-sm text-red-500">Failed to load departures</div>}
        {!isLoading && !error && departures?.length === 0 && (
          <div className="text-sm text-gray-400">No upcoming departures</div>
        )}

        {/* Departure list */}
        {departures?.map((dep) => (
          <div key={`${dep.line}-${dep.time}`} className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-100 transition cursor-pointer">
            <div className="flex items-center gap-3">

              {/* Colored circle for line type */}
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${iconBgColors[dep.type]}`}>
                {transportIcons[dep.type]}
              </div>
              <div className="flex flex-col">
                <div className="font-medium text-gray-800">{dep.line}</div>
                <div className="text-sm text-gray-500">{dep.destination}</div>
                {/* {dep.status && (
                  <div
                    className={`text-xs font-semibold mt-0.5 ${
                      dep.status === "delayed" ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {dep.status}
                  </div>
                )} */}
              </div>
            </div>

            <div className="font-semibold text-gray-800 text-sm">
              {new Date(dep.time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

