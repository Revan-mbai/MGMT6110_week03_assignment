import React, { useState, useMemo } from 'react';
import { BusStop } from '../types';
import { 
  MEASURING_LOCATIONS, 
  MeasuringLocation, 
  getDistanceInMeters 
} from '../data';
import { 
  Search, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  ArrowRight, 
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react';

interface FindAStopScreenProps {
  busStops: BusStop[];
  onSelectStop: (stop: BusStop) => void;
  savedStopCodes: string[];
  onToggleSaveStop: (code: string) => void;
}

export const FindAStopScreen: React.FC<FindAStopScreenProps> = ({
  busStops,
  onSelectStop,
  savedStopCodes,
  onToggleSaveStop,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<MeasuringLocation>(MEASURING_LOCATIONS[0]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showMoreNearby, setShowMoreNearby] = useState(false);

  // Requirement (d): Live validation message as user types into search box
  const inputValidationFeedback = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return null;

    const isNumeric = /^\d+$/.test(trimmed);

    if (isNumeric) {
      if (trimmed.length < 5) {
        return {
          type: 'info' as const,
          message: `Entering bus stop code: 5 digits needed (e.g. 09048, 50161). [${trimmed.length}/5 digits typed]`,
        };
      }
      if (trimmed.length === 5) {
        const found = busStops.find((s) => s.code === trimmed);
        if (found) {
          return {
            type: 'success' as const,
            message: `5-digit stop code recognised: ${found.name} (${found.road})`,
          };
        }
        return {
          type: 'warning' as const,
          message: `Stop code ${trimmed} does not exist in registry. Try another 5-digit code or enter stop name.`,
        };
      }
      if (trimmed.length === 6) {
        const found = busStops.find((s) => s.postalCode === trimmed);
        if (found) {
          return {
            type: 'success' as const,
            message: `6-digit postal code recognised: ${found.name} (${found.road})`,
          };
        }
        return {
          type: 'warning' as const,
          message: `No bus stop found at postal code ${trimmed}. Try stop name or 5-digit code.`,
        };
      }
      return {
        type: 'warning' as const,
        message: 'Input exceeds 6 digits. Singapore stop codes are 5 digits; postal codes are 6 digits.',
      };
    }

    // Letters/mixed input
    return {
      type: 'info' as const,
      message: 'Searching stops by name, road, or bus service...',
    };
  }, [searchQuery, busStops]);

  // Search filtering
  const matchingStops = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return busStops.filter((stop) => {
      const matchCode = stop.code.toLowerCase().includes(q);
      const matchPostal = stop.postalCode?.toLowerCase().includes(q);
      const matchName = stop.name.toLowerCase().includes(q);
      const matchRoad = stop.road.toLowerCase().includes(q);
      const matchService = stop.busServices.some((svc) => svc.toLowerCase() === q || svc.toLowerCase().startsWith(q));
      return matchCode || matchPostal || matchName || matchRoad || matchService;
    });
  }, [searchQuery, busStops]);

  // Stops measured from the chosen location, sorted by proximity
  const sortedNearbyStops = useMemo(() => {
    return [...busStops]
      .map((stop) => {
        const distance = getDistanceInMeters(
          selectedLocation.latitude,
          selectedLocation.longitude,
          stop.latitude,
          stop.longitude
        );
        const walkingMins = Math.max(1, Math.round(distance / 75));
        return {
          ...stop,
          distanceMeters: distance,
          walkingTimeMins: walkingMins,
        };
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [busStops, selectedLocation]);

  const displayedNearbyStops = showMoreNearby
    ? sortedNearbyStops.slice(0, 15)
    : sortedNearbyStops.slice(0, 5);

  const hasSearchActive = searchQuery.trim().length > 0;
  const isSearchFailed = hasSearchActive && matchingStops.length === 0;

  return (
    <section id="find-a-stop-screen" className="max-w-xl mx-auto px-4 py-4 space-y-4">
      {/* Requirement (c): One line stating what this screen is for and what to give it */}
      <div id="screen-purpose-line" className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-emerald-900 leading-snug">
        Find a bus stop by entering its stop name, 6-digit postal code, or 5-digit stop code, or pick a stop near the location below.
      </div>

      {/* Screen Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Find a Stop
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Search anywhere in Singapore or browse nearby stops
          </p>
        </div>
      </div>

      {/* Unified Search Box with Clear Button */}
      <div className="space-y-1.5">
        <label htmlFor="bus-stop-search-input" className="block text-xs font-bold text-slate-700">
          Search stop name, postal code, or 5-digit code
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="bus-stop-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. Orchard, 248649, 09048, or Thomson Plaza..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-16 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
            autoComplete="off"
            spellCheck="false"
          />
          {searchQuery && (
            <button
              id="clear-search-btn"
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Live typing feedback (Requirement d) */}
        {inputValidationFeedback && (
          <p
            id="search-input-live-feedback"
            className={`text-xs font-medium px-1 flex items-center gap-1.5 ${
              inputValidationFeedback.type === 'success'
                ? 'text-emerald-700'
                : inputValidationFeedback.type === 'warning'
                ? 'text-amber-700'
                : 'text-slate-600'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{inputValidationFeedback.message}</span>
          </p>
        )}
      </div>

      {/* Search Results Area */}
      {hasSearchActive && (
        <div id="search-results-section" className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Search Results
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              {matchingStops.length} stop{matchingStops.length === 1 ? '' : 's'} found
            </span>
          </div>

          {/* Requirement (e): When search fails, clear previous results & plainly mark as no longer current */}
          {isSearchFailed ? (
            <div
              id="search-failed-empty-state"
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center space-y-1.5"
            >
              <p className="text-sm font-bold text-amber-900">
                No matching bus stops found for &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-xs text-amber-700">
                Previous search results have been cleared. Please verify your stop name, 6-digit postal code (e.g. 248649), or 5-digit stop code (e.g. 09048, 50161).
              </p>
            </div>
          ) : (
            <div id="matching-stops-list" className="space-y-2">
              {matchingStops.map((stop) => {
                const isSaved = savedStopCodes.includes(stop.code);
                return (
                  <div
                    key={stop.code}
                    className="bg-white rounded-xl border border-slate-200 hover:border-emerald-400 p-3.5 shadow-2xs transition-all flex items-start justify-between gap-3 group cursor-pointer"
                    onClick={() => onSelectStop(stop)}
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300">
                          {stop.code}
                        </span>
                        {stop.postalCode && (
                          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            Postal {stop.postalCode}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                        {stop.name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">
                        {stop.road}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Services:
                        </span>
                        {stop.busServices.map((svc) => (
                          <span
                            key={svc}
                            className="text-xs font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200 font-mono"
                          >
                            {svc}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {/* Consistent save/unsave control (Requirement f) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSaveStop(stop.code);
                        }}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isSaved
                            ? 'bg-amber-50 border-amber-300 text-amber-500 fill-amber-400'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200'
                        }`}
                        title={isSaved ? 'Unsave stop' : 'Save stop'}
                        aria-label={isSaved ? `Unsave ${stop.name}` : `Save ${stop.name}`}
                      >
                        <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-500' : ''}`} />
                      </button>

                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform mt-2">
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Proximity Location Section: Always visible below search box */}
      <div id="nearby-stops-section" className="space-y-3 pt-2">
        {/* Line on screen naming which location that list is measured from & control to change it */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-xs">
                <span className="text-slate-500 font-medium">Stops measured from: </span>
                <span id="measuring-location-name" className="font-bold text-slate-900">
                  {selectedLocation.name}
                </span>
              </div>
            </div>
            <button
              id="change-location-btn"
              type="button"
              onClick={() => setShowLocationPicker((prev) => !prev)}
              className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{showLocationPicker ? 'Close' : 'Change Location'}</span>
            </button>
          </div>

          {/* Location picker dropdown/list */}
          {showLocationPicker && (
            <div id="location-picker-menu" className="pt-2 border-t border-slate-100 space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Select location to measure distance:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {MEASURING_LOCATIONS.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => {
                      setSelectedLocation(loc);
                      setShowLocationPicker(false);
                    }}
                    className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      selectedLocation.id === loc.id
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* List of stops near the chosen location */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Stops Near {selectedLocation.name.split('(')[0].trim()}
            </h3>
            <span className="text-xs font-medium text-slate-500">
              Showing {displayedNearbyStops.length} nearest
            </span>
          </div>

          <div id="nearby-stops-list" className="space-y-2">
            {displayedNearbyStops.map((stop) => {
              const isSaved = savedStopCodes.includes(stop.code);
              return (
                <div
                  key={stop.code}
                  className="bg-white rounded-xl border border-slate-200 hover:border-emerald-400 p-3.5 shadow-2xs transition-all flex items-start justify-between gap-3 group cursor-pointer"
                  onClick={() => onSelectStop(stop)}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300">
                        {stop.code}
                      </span>
                      {stop.distanceMeters !== undefined && (
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          {stop.distanceMeters}m · ~{stop.walkingTimeMins} min walk
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                      {stop.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">
                      {stop.road} {stop.postalCode ? `· Singapore ${stop.postalCode}` : ''}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Services:
                      </span>
                      {stop.busServices.map((svc) => (
                        <span
                          key={svc}
                          className="text-xs font-bold bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200 font-mono"
                        >
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Consistent save/unsave control (Requirement f) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSaveStop(stop.code);
                      }}
                      className={`p-1.5 rounded-lg border transition-all ${
                        isSaved
                          ? 'bg-amber-50 border-amber-300 text-amber-500 fill-amber-400'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200'
                      }`}
                      title={isSaved ? 'Unsave stop' : 'Save stop'}
                      aria-label={isSaved ? `Unsave ${stop.name}` : `Save ${stop.name}`}
                    >
                      <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>

                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform mt-2">
                      View <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show more / Show less buttons */}
          <div className="pt-2 text-center">
            {showMoreNearby ? (
              <button
                id="show-less-nearby-btn"
                type="button"
                onClick={() => setShowMoreNearby(false)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg shadow-2xs transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
                <span>Show less (display top 5)</span>
              </button>
            ) : (
              <button
                id="show-more-nearby-btn"
                type="button"
                onClick={() => setShowMoreNearby(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg shadow-2xs transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
                <span>Show more nearby stops</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
