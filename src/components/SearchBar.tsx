// import { useState, useEffect, useRef } from "react";
// import { useSearchLocations } from "../hooks/useSearchLocations";
// import type { Stop } from "../types/stop";

// type Props = {
//   onSelectStop: (stop: Stop) => void;
// };

// export function SearchBar({ onSelectStop }: Props) {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [highlightedIndex, setHighlightedIndex] = useState(0);
//   const { data: searchResults = [] } = useSearchLocations(searchQuery);
//   const inputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => setHighlightedIndex(0), [searchResults]);

//   const handleSelect = (stop: Stop) => {
//     onSelectStop(stop);
//     setSearchQuery("");
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (!searchResults.length) return;

//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setHighlightedIndex((prev) => (prev + 1) % searchResults.length);
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setHighlightedIndex((prev) =>
//         prev === 0 ? searchResults.length - 1 : prev - 1
//       );
//     } else if (e.key === "Enter") {
//       e.preventDefault();
//       handleSelect(searchResults[highlightedIndex]);
//     }
//   };

//   return (
//     <div className="relative">
//       <input
//         ref={inputRef}
//         type="text"
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//         onKeyDown={handleKeyDown}
//         placeholder="Search stations, addresses, POIs..."
//         className="px-3 py-1 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800"
//       />

//       {searchQuery && searchResults.length > 0 && (
//         <div className="absolute top-full mt-1 left-0 w-64 bg-white shadow-lg z-50 rounded-md overflow-hidden max-h-72 overflow-y-auto">
//           {searchResults.map((r: Stop) => (
//             <div
//                 key={r.id}
//                 className="p-2 cursor-pointer hover:bg-blue-100"
//                 onClick={() => handleSelect(r)}
//             >
//                 {r.stopName}
//             </div>
//             ))}
//         </div>
//       )}

//       {searchQuery && searchResults.length === 0 && (
//         <div className="absolute top-full mt-1 left-0 w-64 bg-white shadow-lg z-50 rounded-md p-2 text-gray-400">
//           No results
//         </div>
//       )}
//     </div>
//   );
// }
