import React, { useState } from 'react';
import { BusStop } from '../types';
import { 
  MapPin, 
  Navigation, 
  Search, 
  ChevronDown, 
  AlertTriangle, 
  ArrowRight,
  Star
} from 'lucide-react';

interface NearbyStopsScreenProps {
  busStops: BusStop[];
  onSelectStop: (stop: BusStop) => void;
  favouriteStopCodes?: string[];
  onToggleFavourite?: (code: string) => void;
}

export const NearbyStopsScreen: React.FC<NearbyStopsScreenProps> = ({
  busStops,
  onSelectStop,
  favouriteStopCodes = [],
  onToggleFavourite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStopCode, setExpandedStopCode] = useState<string | null>(null);

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
              Select a bus stop to view real-time arrival times
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

      {/* List View */}
      <div id="bus-stops-list" className="space-y-3">
          {filteredStops.length === 0 ? (
            <div
              id="empty-stops-search"
              className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-2"
            >
              <p className="text-slate-600 font-bold text-base">
                bus stop code does not exist, try another code
              </p>
              <p className="text-slate-400 text-xs">
                Try searching for a different code or clear the search query.
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
    </main>
  );
};

