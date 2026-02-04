import { useState, useRef } from "react";
import Map from "../components/Map";
import { Sidebar } from "../components/Sidebar";
import type { Stop } from "../types/stop";
// import { SearchBar } from "../components/SearchBar";
import maplibregl from "maplibre-gl";

function MapPage() {
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [lineId, setLineId] = useState<string | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 overflow-hidden">
      <header className="h-16 shadow-lg z-10 bg-gradient-to-r from-[#3276c3] to-[#1f4e91] flex items-center px-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          City Mobility Explorer
        </h1>
        {/* <SearchBar
          onSelectStop={(stop) => {
            setSelectedStop(stop);

            if (mapRef.current) {
              mapRef.current.easeTo({
                center: stop.coordinates,
                zoom: 16,
                duration: 400,
              });
            }
          }}
        /> */}
      </header>
      <main className="flex-1 relative">
        <Map selectedStop={selectedStop} onSelectedStop={setSelectedStop} lineId={lineId} mapRef={mapRef} />
        {selectedStop && (
          <Sidebar stop={selectedStop} onClose={() => setSelectedStop(null)} onSelectLine={setLineId} />
        )}
      </main>
    </div>
  );
}

export default MapPage;
