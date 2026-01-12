import type { Stop } from "../types/stop";

type SidebarProps = {
  stop: Stop | null;
  onClose: () => void;
};

export function Sidebar({ stop, onClose }: SidebarProps) {
  
  const isOpen = Boolean(stop);

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

        {/* Placeholder states */}
        <div className="text-gray-400 text-sm">
          Loading real-time data…
        </div>
      </div>
    </aside>
  );
}
