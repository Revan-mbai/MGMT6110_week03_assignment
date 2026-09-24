import React, { useState, useRef, useEffect } from 'react';
import { BusStop } from '../types';
import {
  Star,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ArrowRight,
  Plus,
  Search,
  Map as MapIcon,
  List as ListIcon,
  Trash2,
  BookmarkCheck
} from 'lucide-react';
import {
  normalizeStopCode,
  isValidStopCodeFormat,
  KNOWN_SINGAPORE_BUS_STOPS,
  lookupBusStopDetails,
  buildBusStopObject
} from '../busStopsRegistry';

interface FavouritesScreenProps {
  busStops: BusStop[];
  allAvailableStops: BusStop[];
  favouriteStopCodes: string[];
  onToggleFavourite: (code: string) => void;
  onAddFavouriteStop: (code: string) => void;
  onSelectStop: (stop: BusStop) => void;
  onBrowseNearby: () => void;
}

// Approximate relative positions for map pins
const STOP_COORDINATES: Record<string, { x: number; y: number }> = {
  '09048': { x: 22, y: 36 },
  '08031': { x: 38, y: 44 },
  '08057': { x: 52, y: 52 },
  '04121': { x: 66, y: 70 },
  '01012': { x: 75, y: 38 },
  '02049': { x: 84, y: 60 },
};

export const FavouritesScreen: React.FC<FavouritesScreenProps> = ({
  busStops,
  allAvailableStops,
  favouriteStopCodes,
  onToggleFavourite,
  onAddFavouriteStop,
  onSelectStop,
  onBrowseNearby,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStopCode, setExpandedStopCode] = useState<string | null>(null);
  const [showAllStops, setShowAllStops] = useState(false);
  const [showAllNearbyChips, setShowAllNearbyChips] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedMapStopCode, setSelectedMapStopCode] = useState<string | null>(null);
  const [searchBusStopInput, setSearchBusStopInput] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchErrorMessage, setSearchErrorMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Combine available stops with registry stops so users can search/favourite any Singapore stop
  const combinedDirectory = React.useMemo(() => {
    const list: Array<{ code: string; name: string; road: string; distanceMeters?: number }> = [
      ...allAvailableStops,
    ];
    const existingCodes = new Set(allAvailableStops.map((s) => s.code));
    for (const reg of KNOWN_SINGAPORE_BUS_STOPS) {
      if (!existingCodes.has(reg.code)) {
        list.push({
          code: reg.code,
          name: reg.name,
          road: reg.road,
          distanceMeters: 150,
        });
        existingCodes.add(reg.code);
      }
    }
    return list;
  }, [allAvailableStops]);

  // Resolve all favourite stops using busStops + buildBusStopObject so any added stop displays properly
  const favouriteStops = React.useMemo(() => {
    return favouriteStopCodes.map((code) => {
      const existing = busStops.find((s) => s.code === code);
      if (existing) return existing;
      return buildBusStopObject(code) as BusStop;
    });
  }, [busStops, favouriteStopCodes]);

  const toggleStopDropdown = (code: string) => {
    setExpandedStopCode((prev) => (prev === code ? null : code));
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddBusStop = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchBusStopInput.trim();
    if (!query) return;

    const normalized = normalizeStopCode(query);

    // 1. Check if query matches a known stop code or name in directory
    const match = combinedDirectory.find(
      (s) =>
        s.code === normalized ||
        s.code.toLowerCase() === query.toLowerCase() ||
        s.name.toLowerCase() === query.toLowerCase()
    );

    if (match) {
      setSearchErrorMessage(null);
      onAddFavouriteStop(match.code);
      setSearchBusStopInput('');
      setIsDropdownOpen(false);
      return;
    }

    // 2. Check if query matches 5-digit Singapore bus stop code format
    if (isValidStopCodeFormat(normalized)) {
      setSearchErrorMessage(null);
      onAddFavouriteStop(normalized);
      setSearchBusStopInput('');
      setIsDropdownOpen(false);
      return;
    }

    // 3. Invalid bus stop code
    setSearchErrorMessage('bus stop code does not exist, try another code');
  };

  // Search filter within favourites
  const filteredFavouriteStops = favouriteStops.filter((stop) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchesCode = stop.code.toLowerCase().includes(q);
    const matchesName = stop.name.toLowerCase().includes(q);
    const matchesRoad = stop.road.toLowerCase().includes(q);
    const matchesBus = stop.busServices.some((b) => b.toLowerCase().includes(q));
    return matchesCode || matchesName || matchesRoad || matchesBus;
  });

  const displayedFavouriteStops = showAllStops
    ? filteredFavouriteStops
    : filteredFavouriteStops.slice(0, 5);

  const selectedMapStop =
    favouriteStops.find((s) => s.code === selectedMapStopCode) || filteredFavouriteStops[0];

  return (
    <main
      id="favourites-screen"
      className="max-w-xl mx-auto px-4 py-5 space-y-4 relative pb-20"
    >
      {/* Title bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>Favourite Bus Stops</span>
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Bus stops you have saved for fast real-time tracking
          </p>
        </div>
        <span
          id="favourites-counter"
          className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200"
        >
          {favouriteStops.length} added
        </span>
      </div>

      {/* Add Any Bus Stop Section */}
      <section
        id="add-favourite-section"
        className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 space-y-3"
      >
        <div className="flex items-center justify-between">
          <label
            htmlFor="search-bus-stop-code-input"
            className="text-xs font-bold text-slate-800 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Add Any Bus Stop to Favourites</span>
          </label>
        </div>

        {/* Searchable Bus Stop Code Dropdown Bar */}
        <div ref={dropdownRef} className="relative">
          <form onSubmit={handleAddBusStop} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                id="search-bus-stop-code-input"
                value={searchBusStopInput}
                onChange={(e) => {
                  setSearchBusStopInput(e.target.value);
                  setSearchErrorMessage(null);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder="Search bus stop code (e.g. 09048)..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                autoComplete="off"
              />
              <button
                type="button"
                id="toggle-bus-stop-dropdown-btn"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-label="Toggle bus stops list"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>
            </div>

            <button
              type="submit"
              id="add-favourite-btn"
              disabled={!searchBusStopInput.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </form>

          {searchErrorMessage && (
            <p id="search-bus-stop-error-msg" className="text-xs font-semibold text-rose-600 mt-1.5">
              {searchErrorMessage}
            </p>
          )}

          {/* Filtered Dropdown Results List */}
          {isDropdownOpen && (
            <div
              id="bus-stops-search-dropdown-menu"
              className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-200 z-40 max-h-60 overflow-y-auto divide-y divide-slate-100"
            >
              {(() => {
                const q = searchBusStopInput.trim().toLowerCase();
                const normQ = normalizeStopCode(q);
                const matching = combinedDirectory.filter((stop) => {
                  if (!q) return true;
                  return (
                    stop.code.toLowerCase().includes(q) ||
                    stop.code.includes(normQ) ||
                    stop.name.toLowerCase().includes(q) ||
                    stop.road.toLowerCase().includes(q)
                  );
                });

                if (matching.length === 0) {
                  if (isValidStopCodeFormat(normQ)) {
                    return (
                      <div
                        id={`dropdown-stop-option-${normQ}`}
                        onClick={() => {
                          onAddFavouriteStop(normQ);
                          setSearchBusStopInput('');
                          setIsDropdownOpen(false);
                          setSearchErrorMessage(null);
                        }}
                        className="p-3 hover:bg-emerald-50 cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-slate-900 text-white">
                            {normQ}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            Add bus stop code {normQ} to favourites
                          </span>
                        </div>
                        <Plus className="w-4 h-4 text-emerald-600" />
                      </div>
                    );
                  }

                  return (
                    <div className="p-3 text-center space-y-1">
                      <p id="search-bus-stop-dropdown-empty" className="text-xs text-slate-500 font-medium">
                        Search by bus stop code (e.g. 04121, 09048, 10169) or road name
                      </p>
                    </div>
                  );
                }

                return matching.slice(0, 15).map((stop) => {
                  const isAlreadyAdded = favouriteStopCodes.includes(stop.code);
                  return (
                    <div
                      key={stop.code}
                      id={`dropdown-stop-option-${stop.code}`}
                      onClick={() => {
                        if (!isAlreadyAdded) {
                          onAddFavouriteStop(stop.code);
                          setSearchBusStopInput('');
                          setIsDropdownOpen(false);
                        }
                      }}
                      className={`p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-colors ${
                        isAlreadyAdded
                          ? 'bg-slate-50/60 cursor-default'
                          : 'hover:bg-emerald-50/60 cursor-pointer active:bg-emerald-100/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-slate-900 text-white shrink-0">
                          {stop.code}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {stop.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {stop.road} • {stop.distanceMeters}m
                          </p>
                        </div>
                      </div>

                      {isAlreadyAdded ? (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                          ✓ Added
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 shrink-0">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </span>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

        {/* Nearby bus stop chips */}
        <div className="pt-1">
          <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
            Nearby bus stop:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(showAllNearbyChips ? allAvailableStops : allAvailableStops.slice(0, 5)).map((stop) => {
              const isAlreadyAdded = favouriteStopCodes.includes(stop.code);
              return (
                <button
                  key={stop.code}
                  type="button"
                  id={`nearby-bus-stop-chip-${stop.code}`}
                  onClick={() => {
                    if (!isAlreadyAdded) {
                      onAddFavouriteStop(stop.code);
                    }
                  }}
                  disabled={isAlreadyAdded}
                  title={
                    isAlreadyAdded
                      ? `${stop.name} is already in favourites`
                      : `Add ${stop.name} (${stop.code}) to favourites`
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isAlreadyAdded
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 cursor-default opacity-90'
                      : 'bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 border border-slate-200 active:scale-95'
                  }`}
                >
                  {isAlreadyAdded ? (
                    <BookmarkCheck className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Plus className="w-3 h-3 text-emerald-600" />
                  )}
                  <span className="font-bold">{stop.code}</span>
                  <span className="truncate max-w-[120px]">{stop.name}</span>
                </button>
              );
            })}

            {allAvailableStops.length > 5 && (
              <button
                type="button"
                id={showAllNearbyChips ? 'nearby-chips-show-less-btn' : 'nearby-chips-show-more-btn'}
                onClick={() => setShowAllNearbyChips(!showAllNearbyChips)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
                aria-label={showAllNearbyChips ? 'Show less bus stops' : 'Show more bus stops'}
              >
                <span>{showAllNearbyChips ? 'Show less' : 'Show more'}</span>
                {showAllNearbyChips ? (
                  <ChevronUp className="w-3 h-3 text-slate-500" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filter search if multiple favourites exist */}
      {favouriteStops.length > 1 && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowAllStops(false);
            }}
            placeholder="Search within your favourites..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
          />
        </div>
      )}

      {/* Empty State: Only shown if no bus stops have been added */}
      {favouriteStops.length === 0 && (
        <div
          id="empty-favourites-state"
          className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-4 shadow-xs"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-500">
            <Star className="w-7 h-7 fill-amber-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              No Favourite Bus Stops Added Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Add any bus stops you use frequently using the selector above, or tap the star icon on any bus stop in the Nearby tab.
            </p>
          </div>

          <button
            type="button"
            id="browse-nearby-from-fav-btn"
            onClick={onBrowseNearby}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
          >
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Browse Nearby Bus Stops</span>
          </button>
        </div>
      )}

      {/* VIEW 1: List of Added Favourites */}
      {viewMode === 'list' && favouriteStops.length > 0 && (
        <div id="favourite-stops-list" className="space-y-3">
          {displayedFavouriteStops.map((stop) => {
            const isExpanded = expandedStopCode === stop.code;
            const hasDelayedBus = stop.buses.some((b) => b.isDelayed);

            return (
              <div
                key={stop.id}
                id={`favourite-stop-card-${stop.code}`}
                className="bg-white rounded-2xl shadow-sm border border-slate-200/90 overflow-hidden transition-all"
              >
                {/* Clickable bus stop header to toggle dropdown */}
                <div className="p-4 flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleStopDropdown(stop.code)}
                    aria-expanded={isExpanded}
                    className="flex-1 text-left flex items-start gap-2.5 min-w-0 focus:outline-none"
                  >
                    <div className="mt-0.5 w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Star className="w-4 h-4 fill-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          id={`fav-stop-code-${stop.code}`}
                          className="font-mono text-xs font-black tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                        >
                          {stop.code}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {stop.road}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
                        {stop.name}
                      </h3>
                      <p className="text-xs text-emerald-600 font-semibold mt-1">
                        {isExpanded ? 'Hide available buses' : 'Click to show available buses'}
                      </p>
                    </div>
                  </button>

                  {/* Actions & Distance */}
                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        id={`remove-fav-btn-${stop.code}`}
                        onClick={() => onToggleFavourite(stop.code)}
                        title="Remove from favourites"
                        aria-label={`Remove ${stop.name} from favourites`}
                        className="p-1.5 rounded-lg text-amber-500 hover:text-rose-600 hover:bg-rose-50 bg-amber-50 border border-amber-200 transition-colors"
                      >
                        <Star className="w-4 h-4 fill-amber-400 hover:fill-none" />
                      </button>

                      <div>
                        <span className="text-xs font-black text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
                          {stop.distanceMeters}m
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                          ~{stop.walkingTimeMins} min walk
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleStopDropdown(stop.code)}
                      className="p-1 rounded-full bg-slate-100 text-slate-600 mt-0.5"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-emerald-600' : 'text-slate-500'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Dropdown content */}
                {isExpanded && (
                  <div
                    id={`favourite-stop-expanded-${stop.code}`}
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

                    {/* View detailed arrival times */}
                    <button
                      type="button"
                      id={`fav-view-arrivals-btn-${stop.code}`}
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
          })}

          {filteredFavouriteStops.length > 5 && (
            <button
              type="button"
              id={showAllStops ? 'fav-show-less-stops-btn' : 'fav-show-more-stops-btn'}
              onClick={() => setShowAllStops(!showAllStops)}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-slate-900 font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
              aria-label={showAllStops ? 'Show less favourite bus stops' : 'Show more favourite bus stops'}
            >
              <span>{showAllStops ? 'Show less' : 'Show more'}</span>
              {showAllStops ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>
          )}
        </div>
      )}

      {/* VIEW 2: Map View of Favourites */}
      {viewMode === 'map' && favouriteStops.length > 0 && (
        <div id="favourites-map-view" className="space-y-4">
          <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-md aspect-[4/3] w-full select-none">
            {/* Background SVG Map */}
            <svg
              className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 400 300"
              preserveAspectRatio="none"
            >
              <line x1="0" y1="90" x2="400" y2="180" stroke="#475569" strokeWidth="6" opacity="0.4" />
              <line x1="0" y1="120" x2="400" y2="230" stroke="#64748b" strokeWidth="8" opacity="0.5" />
              <line x1="120" y1="0" x2="280" y2="300" stroke="#64748b" strokeWidth="7" opacity="0.4" />
              <line x1="280" y1="0" x2="330" y2="300" stroke="#475569" strokeWidth="5" opacity="0.4" />
            </svg>

            {/* Map Header */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-2 shadow-xs">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-slate-200">Saved Favourite Bus Stops</span>
              </div>
            </div>

            {/* Pins for Favourite Stops */}
            {favouriteStops.map((stop) => {
              const coords = STOP_COORDINATES[stop.code] || { x: 50, y: 50 };
              const isSelected = selectedMapStop?.code === stop.code;

              return (
                <button
                  key={stop.id}
                  type="button"
                  id={`fav-map-pin-${stop.code}`}
                  onClick={() => setSelectedMapStopCode(stop.code)}
                  className={`absolute -translate-x-1/2 -translate-y-full group transition-all duration-200 focus:outline-none z-20 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                >
                  <div className="flex flex-col items-center">
                    <div className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black shadow-md bg-amber-500 text-slate-950 border border-amber-300 flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-slate-950" />
                      <span>{stop.code}</span>
                    </div>
                    <MapPin className="w-7 h-7 drop-shadow-md text-amber-400 fill-amber-500 -mt-1" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Pin Card */}
          {selectedMapStop && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 fill-white" />
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

                <button
                  type="button"
                  onClick={() => onToggleFavourite(selectedMapStop.code)}
                  title="Remove from favourites"
                  className="p-2 rounded-xl text-amber-500 hover:text-rose-600 bg-amber-50 border border-amber-200 transition-colors"
                >
                  <Star className="w-4 h-4 fill-amber-400" />
                </button>
              </div>

              <button
                type="button"
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

      {/* FAB to Toggle Between List and Visual Map View for Favourites */}
      {favouriteStops.length > 0 && (
        <button
          type="button"
          id="toggle-fav-view-fab"
          onClick={() => setViewMode((prev) => (prev === 'list' ? 'map' : 'list'))}
          aria-label={viewMode === 'list' ? 'Switch to map view' : 'Switch to list view'}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 active:bg-emerald-700 text-white font-bold text-sm py-3.5 px-5 rounded-full shadow-xl hover:shadow-2xl active:scale-95 transition-all duration-200 border border-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
        >
          {viewMode === 'list' ? (
            <>
              <MapIcon className="w-4 h-4 text-amber-400" />
              <span>Map View</span>
            </>
          ) : (
            <>
              <ListIcon className="w-4 h-4 text-amber-400" />
              <span>List View</span>
            </>
          )}
        </button>
      )}
    </main>
  );
};
