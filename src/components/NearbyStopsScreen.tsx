import React, { useState } from 'react';
import { BusStop } from '../types';
import { 
  MapPin, 
  Navigation, 
  Search, 
  ChevronDown, 
  AlertTriangle, 
  ArrowRight,
  Map as MapIcon,
  List as ListIcon,
  Crosshair,
  Layers,
  Star
} from 'lucide-react';

interface NearbyStopsScreenProps {
  busStops: BusStop[];
  onSelectStop: (stop: BusStop) => void;
  favouriteStopCodes?: string[];
  onToggleFavourite?: (code: string) => void;
}

// Approximate relative positions for central Singapore bus stops
const STOP_COORDINATES: Record<string, { x: number; y: number; landmark: string }> = {
  '09048': { x: 22, y: 36, landmark: 'Orchard Blvd' },
  '08031': { x: 38, y: 44, landmark: 'Somerset' },
  '08057': { x: 52, y: 52, landmark: 'Dhoby Ghaut' },
  '04121': { x: 66, y: 70, landmark: 'City Hall' },
  '01012': { x: 75, y: 38, landmark: 'Bugis' },
  '02049': { x: 84, y: 60, landmark: 'Suntec City' },
};

export const NearbyStopsScreen: React.FC<NearbyStopsScreenProps> = ({
  busStops,
  onSelectStop,
  favouriteStopCodes = [],
  onToggleFavourite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStopCode, setExpandedStopCode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedMapStopCode, setSelectedMapStopCode] = useState<string | null>(null);

  const toggleStopDropdown = (code: string) => {
    setExpandedStopCode((prev) => (prev === code ? null : code));
  };

  const filteredStops = busStops.filter((stop) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchesCode = stop.code.toLowerCase().includes(q);
    const matchesName = stop.name.toLowerCase().includes(q);
    const matchesRoad = stop.road.toLowerCase().includes(q);
    const matchesBus = stop.busServices.some((b) => b.toLowerCase().includes(q));
    return matchesCode || matchesName || matchesRoad || matchesBus;
  });

  const selectedMapStop = busStops.find((s) => s.code === selectedMapStopCode) || filteredStops[0];

  return (
    <main
      id="nearby-stops-screen"
      className="max-w-xl mx-auto px-4 py-5 space-y-4 relative pb-20"
    >
      {/* Title bar & search */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-600 fill-emerald-600/20" />
              Nearby Bus Stops
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {viewMode === 'list' 
                ? 'Select a bus stop to view real-time arrival times' 
                : 'Tap any pin on the map to preview stops and arrival times'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              id="nearby-stops-counter"
              className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200"
            >
              {filteredStops.length} found
            </span>
          </div>
        </div>

        {/* Quick search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="bus-stop-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by bus no., stop name, or code (e.g. 14, Orchard, 09048)..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-xs"
          />
          {searchQuery && (
            <button
              id="clear-search-btn"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 p-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: List View */}
      {viewMode === 'list' && (
        <div id="bus-stops-list" className="space-y-3">
          {filteredStops.length === 0 ? (
            <div
              id="empty-stops-search"
              className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2"
            >
              <p className="text-slate-600 font-bold text-base">
                No matching bus stops found
              </p>
              <p className="text-slate-400 text-xs">
                Try searching for a different bus number or clear the search query.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
              >
                Reset Search
              </button>
            </div>
          ) : (
            filteredStops.map((stop) => {
              const isExpanded = expandedStopCode === stop.code;
              const hasDelayedBus = stop.buses.some((b) => b.isDelayed);
              return (
                <div
                  key={stop.id}
                  id={`bus-stop-dropdown-${stop.code}`}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden transition-all"
                >
                  {/* Bus stop header with separate clickable toggle and favourite button */}
                  <div className="w-full text-left p-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3">
                    <button
                      type="button"
                      id={`bus-stop-card-${stop.code}`}
                      onClick={() => toggleStopDropdown(stop.code)}
                      aria-expanded={isExpanded}
                      className="flex-1 text-left flex items-start gap-2.5 min-w-0 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg group"
                    >
                      <div className="mt-0.5 w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            id={`stop-code-${stop.code}`}
                            className="font-mono text-xs font-black tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                          >
                            {stop.code}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            {stop.road}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug group-hover:text-emerald-700 transition-colors">
                          {stop.name}
                        </h3>
                        <p className="text-xs text-emerald-600 font-semibold mt-1">
                          {isExpanded ? 'Hide available buses' : 'Click to show available buses'}
                        </p>
                      </div>
                    </button>

                    {/* Distance badge, Favourite toggle & Dropdown toggle icon */}
                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5">
                        {onToggleFavourite && (
                          <button
                            type="button"
                            id={`fav-btn-${stop.code}`}
                            onClick={() => onToggleFavourite(stop.code)}
                            title={
                              favouriteStopCodes.includes(stop.code)
                                ? 'Remove from favourites'
                                : 'Add to favourites'
                            }
                            aria-label={
                              favouriteStopCodes.includes(stop.code)
                                ? `Remove ${stop.name} from favourites`
                                : `Add ${stop.name} to favourites`
                            }
                            className={`p-1.5 rounded-lg transition-all ${
                              favouriteStopCodes.includes(stop.code)
                                ? 'text-amber-500 bg-amber-50 hover:bg-amber-100 border border-amber-200'
                                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 border border-transparent'
                            }`}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                favouriteStopCodes.includes(stop.code)
                                  ? 'fill-amber-400 text-amber-500'
                                  : ''
                              }`}
                            />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleStopDropdown(stop.code)}
                          aria-label={`Toggle buses for ${stop.name}`}
                          className="text-right focus:outline-none"
                        >
                          <span className="text-xs font-black text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
                            {stop.distanceMeters}m
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                            ~{stop.walkingTimeMins} min walk
                          </p>
                        </button>
                      </div>
                      <button
                        type="button"
                        id={`toggle-dropdown-btn-${stop.code}`}
                        onClick={() => toggleStopDropdown(stop.code)}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? `Hide buses for ${stop.name}` : `Show buses for ${stop.name}`}
                        className="p-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors mt-0.5 focus:outline-none"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-emerald-600' : 'text-slate-500'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Dropdown content: Only visible after user clicks on the bus stop */}
                  {isExpanded && (
                    <div
                      id={`bus-stop-expanded-content-${stop.code}`}
                      className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-500 block mb-2">
                          Buses at this stop:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {stop.buses.map((bus) => (
                            <button
                              key={bus.busNumber}
                              type="button"
                              id={`stop-${stop.code}-bus-${bus.busNumber}`}
                              onClick={() => onSelectStop(stop)}
                              title={`View arrival times for Bus ${bus.busNumber}`}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-2xs ${
                                bus.isDelayed
                                  ? 'bg-amber-100 text-amber-950 border border-amber-400'
                                  : 'bg-white text-slate-900 border border-slate-300'
                              }`}
                            >
                              <span>{bus.busNumber}</span>
                              {bus.isDelayed && (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {hasDelayedBus && (
                        <div className="bg-amber-50 rounded-xl p-2 text-xs font-medium text-amber-900 flex items-center gap-2 border border-amber-200">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Some buses are experiencing delays due to traffic incidents.</span>
                        </div>
                      )}

                      {/* Button to navigate to Screen 2 for detailed arrival times */}
                      <button
                        type="button"
                        id={`view-arrivals-btn-${stop.code}`}
                        onClick={() => onSelectStop(stop)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-xs transition-colors"
                      >
                        <span>View Real-Time Arrival Times</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: Visual Map View */}
      {viewMode === 'map' && (
        <div id="bus-stops-map-view" className="space-y-4">
          <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-md aspect-[4/3] w-full select-none">
            {/* Map Canvas Background with Singapore Roads & Features */}
            <svg
              className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 400 300"
              preserveAspectRatio="none"
            >
              {/* Marina Bay / Singapore River Water feature */}
              <path
                d="M 230 300 C 240 260, 270 230, 310 210 C 350 190, 380 230, 400 240 L 400 300 Z"
                fill="#0284c7"
                opacity="0.25"
              />
              <path
                d="M 180 300 Q 220 250, 250 240 T 310 220"
                fill="none"
                stroke="#0284c7"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.3"
              />

              {/* Park Greeneries */}
              <circle cx="130" cy="110" r="45" fill="#059669" opacity="0.15" />
              <ellipse cx="250" cy="130" rx="40" ry="25" fill="#059669" opacity="0.15" />

              {/* Primary Arterial Roads */}
              <line x1="0" y1="90" x2="400" y2="180" stroke="#475569" strokeWidth="6" opacity="0.4" />
              <line x1="0" y1="120" x2="400" y2="230" stroke="#64748b" strokeWidth="8" opacity="0.5" />
              <line x1="120" y1="0" x2="280" y2="300" stroke="#64748b" strokeWidth="7" opacity="0.4" />
              <line x1="280" y1="0" x2="330" y2="300" stroke="#475569" strokeWidth="5" opacity="0.4" />
              <line x1="50" y1="0" x2="160" y2="300" stroke="#475569" strokeWidth="4" opacity="0.3" />

              {/* Street Names */}
              <text x="20" y="80" fill="#94a3b8" fontSize="9" fontWeight="600" opacity="0.7">Orchard Boulevard</text>
              <text x="140" y="145" fill="#94a3b8" fontSize="9" fontWeight="600" opacity="0.7">Somerset Rd</text>
              <text x="215" y="195" fill="#94a3b8" fontSize="9" fontWeight="600" opacity="0.7">St. Andrew's Rd</text>
              <text x="270" y="75" fill="#94a3b8" fontSize="9" fontWeight="600" opacity="0.7">Victoria St</text>
            </svg>

            {/* Map Header Overlay */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-2 shadow-xs">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">Central Singapore Route Map</span>
              </div>
              <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700/80 text-[11px] font-mono text-emerald-400 font-bold">
                Live GPS Active
              </div>
            </div>

            {/* User Current Location Indicator */}
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
              style={{ left: '32%', top: '42%' }}
            >
              <span className="relative flex h-6 w-6 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500 border-2 border-white shadow-sm"></span>
              </span>
              <span className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-900/90 text-blue-200 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                You are here
              </span>
            </div>

            {/* Bus Stop Pins */}
            {filteredStops.map((stop) => {
              const coords = STOP_COORDINATES[stop.code] || { x: 50, y: 50, landmark: stop.road };
              const isSelected = selectedMapStop?.code === stop.code;
              const hasDelayedBus = stop.buses.some((b) => b.isDelayed);

              return (
                <button
                  key={stop.id}
                  type="button"
                  id={`map-pin-${stop.code}`}
                  onClick={() => setSelectedMapStopCode(stop.code)}
                  aria-label={`Bus stop ${stop.name} (${stop.code})`}
                  className={`absolute -translate-x-1/2 -translate-y-full group transition-all duration-200 focus:outline-none z-20 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                >
                  <div className="flex flex-col items-center">
                    {/* Floating pill badge above pin */}
                    <div
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-black shadow-md flex items-center gap-1 border transition-colors whitespace-nowrap ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                          : hasDelayedBus
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-slate-800 text-slate-200 border-slate-700'
                      }`}
                    >
                      <span>{stop.code}</span>
                      {hasDelayedBus && (
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-900 shrink-0" />
                      )}
                    </div>

                    {/* Pin pointer icon */}
                    <div className="relative -mt-1">
                      <MapPin
                        className={`w-7 h-7 drop-shadow-md transition-colors ${
                          isSelected
                            ? 'text-emerald-400 fill-emerald-500'
                            : hasDelayedBus
                            ? 'text-amber-400 fill-amber-500'
                            : 'text-slate-200 fill-slate-800'
                        }`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Pin Bottom Info Card */}
          {selectedMapStop && (
            <div
              id="map-selected-stop-card"
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black tracking-wider bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {selectedMapStop.code}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {selectedMapStop.road}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
                      {selectedMapStop.name}
                    </h3>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-2">
                  {onToggleFavourite && (
                    <button
                      type="button"
                      id={`map-fav-btn-${selectedMapStop.code}`}
                      onClick={() => onToggleFavourite(selectedMapStop.code)}
                      title={
                        favouriteStopCodes.includes(selectedMapStop.code)
                          ? 'Remove from favourites'
                          : 'Add to favourites'
                      }
                      aria-label={
                        favouriteStopCodes.includes(selectedMapStop.code)
                          ? `Remove ${selectedMapStop.name} from favourites`
                          : `Add ${selectedMapStop.name} to favourites`
                      }
                      className={`p-2 rounded-xl border transition-colors ${
                        favouriteStopCodes.includes(selectedMapStop.code)
                          ? 'text-amber-500 bg-amber-50 border-amber-200'
                          : 'text-slate-400 hover:text-amber-500 bg-slate-50 border-slate-200'
                      }`}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          favouriteStopCodes.includes(selectedMapStop.code)
                            ? 'fill-amber-400 text-amber-500'
                            : ''
                        }`}
                      />
                    </button>
                  )}
                  <div>
                    <span className="text-xs font-black text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
                      {selectedMapStop.distanceMeters}m
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                      ~{selectedMapStop.walkingTimeMins} min walk
                    </p>
                  </div>
                </div>
              </div>

              {/* Buses available */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-500 mr-1">Buses:</span>
                {selectedMapStop.buses.map((bus) => (
                  <span
                    key={bus.busNumber}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black ${
                      bus.isDelayed
                        ? 'bg-amber-100 text-amber-950 border border-amber-300'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {bus.busNumber}
                    {bus.isDelayed && (
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                    )}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <button
                type="button"
                id="map-view-arrivals-btn"
                onClick={() => onSelectStop(selectedMapStop)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-xs transition-colors"
              >
                <span>View Real-Time Arrival Times</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button (FAB) to Toggle Between List and Visual Map View */}
      <button
        type="button"
        id="toggle-view-fab"
        onClick={() => setViewMode((prev) => (prev === 'list' ? 'map' : 'list'))}
        aria-label={viewMode === 'list' ? 'Switch to map view' : 'Switch to list view'}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 active:bg-emerald-700 text-white font-bold text-sm py-3.5 px-5 rounded-full shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200 border border-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
      >
        {viewMode === 'list' ? (
          <>
            <MapIcon className="w-4 h-4 text-emerald-400" />
            <span>Map View</span>
          </>
        ) : (
          <>
            <ListIcon className="w-4 h-4 text-emerald-400" />
            <span>List View</span>
          </>
        )}
      </button>
    </main>
  );
};

