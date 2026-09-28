import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BusStop, MeasuringLocation } from '../types';
import { 
  MEASURING_LOCATIONS, 
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
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface FindAStopScreenProps {
  busStops: BusStop[];
  onSelectStop: (stop: BusStop) => void;
  savedStopCodes: string[];
  onToggleSaveStop: (code: string) => void;
  selectedLocation: MeasuringLocation;
  onLocationChange: (location: MeasuringLocation) => void;
}

export const FindAStopScreen: React.FC<FindAStopScreenProps> = ({
  busStops,
  onSelectStop,
  savedStopCodes,
  onToggleSaveStop,
  selectedLocation,
  onLocationChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [postalInput, setPostalInput] = useState('');
  const [postalError, setPostalError] = useState<string | null>(null);
  const [isPostalSearching, setIsPostalSearching] = useState(false);
  const [showMoreNearby, setShowMoreNearby] = useState(false);

  // In-flight network lookup tracking for main search box
  const [isNetworkCallInFlight, setIsNetworkCallInFlight] = useState(false);
  const [networkCallMessage, setNetworkCallMessage] = useState<string | null>(null);
  const [postalSearchResult, setPostalSearchResult] = useState<{
    postalCode: string;
    locationName: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [postalSearchError, setPostalSearchError] = useState<string | null>(null);

  // Active abort controllers to abandon in-flight calls if user changes input
  const mainSearchAbortRef = useRef<AbortController | null>(null);
  const pickerAbortRef = useRef<AbortController | null>(null);

  // Clean up abort controllers on unmount
  useEffect(() => {
    return () => {
      if (mainSearchAbortRef.current) mainSearchAbortRef.current.abort();
      if (pickerAbortRef.current) pickerAbortRef.current.abort();
    };
  }, []);

  // Main search box input effect: fires a network call ONLY when input is complete
  // (6 digits for a postal code), not on every keystroke and not on a timer.
  useEffect(() => {
    const trimmed = searchQuery.trim();
    const cleanDigits = trimmed.replace(/\D/g, '');

    // Reset postal search result if input is no longer 6 digits
    if (trimmed.length !== 6 || cleanDigits.length !== 6) {
      if (mainSearchAbortRef.current) {
        mainSearchAbortRef.current.abort();
        mainSearchAbortRef.current = null;
      }
      setIsNetworkCallInFlight(false);
      setNetworkCallMessage(null);
      setPostalSearchResult(null);
      setPostalSearchError(null);
    }

    // Only fire network call when the 6-digit postal code input is COMPLETE
    if (cleanDigits.length === 6 && trimmed.length === 6) {
      if (mainSearchAbortRef.current) {
        mainSearchAbortRef.current.abort();
      }

      const controller = new AbortController();
      mainSearchAbortRef.current = controller;

      setIsNetworkCallInFlight(true);
      setNetworkCallMessage(`Looking up postal code ${cleanDigits} with OneMap...`);
      setPostalSearchError(null);
      setPostalSearchResult(null);

      fetch(`/api/postal?postalCode=${encodeURIComponent(cleanDigits)}`, {
        signal: controller.signal,
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok || !data.found) {
            throw new Error(data.error || `Postal code ${cleanDigits} not found in Singapore.`);
          }
          return data;
        })
        .then((data) => {
          setIsNetworkCallInFlight(false);
          setNetworkCallMessage(null);
          setPostalSearchResult({
            postalCode: cleanDigits,
            locationName: data.name,
            latitude: data.latitude,
            longitude: data.longitude,
          });
          // Also update active location so measuring context persists
          onLocationChange({
            id: `postal-${cleanDigits}`,
            name: `${data.name} (${cleanDigits})`,
            label: `${data.name} (${cleanDigits})`,
            postalCode: cleanDigits,
            latitude: data.latitude,
            longitude: data.longitude,
          });
        })
        .catch((err) => {
          if (err.name === 'AbortError') {
            // Call was abandoned because user changed input: do not update UI
            return;
          }
          setIsNetworkCallInFlight(false);
          setNetworkCallMessage(null);
          setPostalSearchResult(null);
          setPostalSearchError(err.message || `No location found for postal code ${cleanDigits}.`);
        });
    }
  }, [searchQuery, onLocationChange]);

  // Handler for Change Location modal postal search
  const handleLookupPickerPostal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = postalInput.trim().replace(/\D/g, '');

    if (clean.length !== 6) {
      setPostalError('Please enter a valid 6-digit Singapore postal code.');
      return;
    }

    if (pickerAbortRef.current) {
      pickerAbortRef.current.abort();
    }

    const controller = new AbortController();
    pickerAbortRef.current = controller;

    setPostalError(null);
    setIsPostalSearching(true);

    fetch(`/api/postal?postalCode=${encodeURIComponent(clean)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.found) {
          throw new Error(data.error || `Postal code ${clean} not found.`);
        }
        return data;
      })
      .then((data) => {
        setIsPostalSearching(false);
        onLocationChange({
          id: `postal-${clean}`,
          name: `${data.name} (${clean})`,
          label: `${data.name} (${clean})`,
          postalCode: clean,
          latitude: data.latitude,
          longitude: data.longitude,
        });
        setPostalInput('');
        setShowLocationPicker(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setIsPostalSearching(false);
        setPostalError(err.message || 'Unable to resolve postal code.');
      });
  };

  // Requirement (d): Inline recognition messages as user types into search box
  const inputValidationFeedback = useMemo(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return null;

    const isNumeric = /^\d+$/.test(trimmed);

    if (isNumeric) {
      if (trimmed.length < 5) {
        return {
          type: 'info' as const,
          message: `Entering bus stop code: 5 digits needed (e.g. 09048, 50161) or 6-digit postal code. [${trimmed.length} digits typed]`,
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
          message: `Stop code ${trimmed} does not exist in registry. Try another 5-digit code or enter a stop name.`,
        };
      }
      if (trimmed.length === 6) {
        if (isNetworkCallInFlight) {
          return {
            type: 'info' as const,
            message: `Resolving postal code ${trimmed} with OneMap...`,
          };
        }
        if (postalSearchResult) {
          return {
            type: 'success' as const,
            message: `6-digit postal code verified: ${postalSearchResult.locationName}`,
          };
        }
        if (postalSearchError) {
          return {
            type: 'warning' as const,
            message: postalSearchError,
          };
        }
        return {
          type: 'info' as const,
          message: `6-digit postal code entered.`,
        };
      }
      return {
        type: 'warning' as const,
        message: 'Input exceeds 6 digits. Singapore stop codes have 5 digits; postal codes have 6 digits.',
      };
    }

    return {
      type: 'info' as const,
      message: 'Searching held stops catalog by name or road...',
    };
  }, [searchQuery, busStops, isNetworkCallInFlight, postalSearchResult, postalSearchError]);

  // Results matching the current search query
  // Stop name search never calls the network; searches held set and orders by distance from selectedLocation
  const matchingStops = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const isNumeric = /^\d+$/.test(q);

    // 1) 6-digit Postal Code Search: ranks all stops by distance from the OneMap coordinates
    if (isNumeric && q.length === 6) {
      if (!postalSearchResult) return [];
      const { latitude, longitude } = postalSearchResult;

      return [...busStops]
        .map((stop) => {
          const dist = getDistanceInMeters(latitude, longitude, stop.latitude, stop.longitude);
          const walk = Math.max(1, Math.round(dist / 75));
          return {
            ...stop,
            distanceMeters: dist,
            walkingTimeMins: walk,
          };
        })
        .filter((stop) => stop.distanceMeters <= 1500) // Nothing beyond 1.5 km
        .sort((a, b) => a.distanceMeters - b.distanceMeters);
    }

    // 2) 5-digit Stop Code Search
    if (isNumeric && q.length === 5) {
      const found = busStops.filter((s) => s.code === q);
      return found.map((stop) => {
        const dist = getDistanceInMeters(
          selectedLocation.latitude,
          selectedLocation.longitude,
          stop.latitude,
          stop.longitude
        );
        return {
          ...stop,
          distanceMeters: dist,
          walkingTimeMins: Math.max(1, Math.round(dist / 75)),
        };
      });
    }

    // 3) Stop Name / Road Search (e.g. "Bedok", "Siglap", "Siglap Community Centre")
    // Never calls network; searches held stop list and orders by distance from selected location
    const matched = busStops.filter((stop) => {
      const matchName = stop.name.toLowerCase().includes(q);
      const matchRoad = stop.road.toLowerCase().includes(q);
      const matchCode = stop.code.toLowerCase().includes(q);
      const matchPostal = stop.postalCode?.toLowerCase().includes(q);
      const matchService = stop.busServices.some(
        (svc) => svc.toLowerCase() === q || svc.toLowerCase().startsWith(q)
      );
      return matchName || matchRoad || matchCode || matchPostal || matchService;
    });

    return matched
      .map((stop) => {
        const dist = getDistanceInMeters(
          selectedLocation.latitude,
          selectedLocation.longitude,
          stop.latitude,
          stop.longitude
        );
        return {
          ...stop,
          distanceMeters: dist,
          walkingTimeMins: Math.max(1, Math.round(dist / 75)),
        };
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [searchQuery, busStops, postalSearchResult, selectedLocation]);

  // Stops measured from the active location, filtered strictly to 1.5 km (1500m)
  const nearbyStopsUnder1500m = useMemo(() => {
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
      .filter((stop) => stop.distanceMeters <= 1500) // Rule: Nothing beyond 1.5 km is listed
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }, [busStops, selectedLocation]);

  const displayedNearbyStops = showMoreNearby
    ? nearbyStopsUnder1500m.slice(0, 15)
    : nearbyStopsUnder1500m.slice(0, 5);

  const hasSearchActive = searchQuery.trim().length > 0;
  const isSearchFailed =
    hasSearchActive && !isNetworkCallInFlight && matchingStops.length === 0;

  return (
    <section id="find-a-stop-screen" className="max-w-xl mx-auto px-4 py-4 space-y-4">
      {/* Requirement (c): One line stating what this screen is for and what to give it */}
      <div
        id="screen-purpose-line"
        className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-emerald-900 leading-snug"
      >
        Find a bus stop by entering its stop name, 6-digit postal code, or 5-digit stop code, or pick a stop near the location below.
      </div>

      {/* Screen Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Find a Stop
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Search all Singapore stops or locate stops by postal code
          </p>
        </div>
      </div>

      {/* Search Input Box: Heading is true about what can be searched */}
      <div className="space-y-1.5">
        <label
          htmlFor="bus-stop-search-input"
          className="block text-xs font-bold text-slate-700"
        >
          Search by stop name, road, 6-digit postal code, or 5-digit stop code
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="bus-stop-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. Bedok, Siglap, 545078, 09048, or Siglap CC..."
            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-16 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
            autoComplete="off"
            spellCheck="false"
          />
          {searchQuery && (
            <button
              id="clear-search-btn"
              type="button"
              onClick={() => {
                setSearchQuery('');
                setPostalSearchResult(null);
                setPostalSearchError(null);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Live typing inline recognition (Requirement d) */}
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
            {!isNetworkCallInFlight && (
              <span className="text-xs font-semibold text-slate-500">
                {matchingStops.length} stop{matchingStops.length === 1 ? '' : 's'} found
              </span>
            )}
          </div>

          {/* Network Call in flight indicator: screen says so where results will appear */}
          {isNetworkCallInFlight && (
            <div
              id="search-inflight-indicator"
              className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-4 flex items-center justify-center gap-2 text-xs font-bold text-emerald-800 shadow-2xs"
            >
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>{networkCallMessage || 'Connecting to OneMap service...'}</span>
            </div>
          )}

          {/* Requirement (e): When a search fails, results from previous search are cleared */}
          {isSearchFailed && (
            <div
              id="search-failed-empty-state"
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center space-y-1.5"
            >
              <p className="text-sm font-bold text-amber-900">
                No matching bus stops found for &ldquo;{searchQuery}&rdquo;
              </p>
              <p className="text-xs text-amber-700">
                Previous results have been cleared. Try searching by stop name (e.g. &ldquo;Bedok&rdquo;, &ldquo;Siglap&rdquo;), 6-digit postal code (e.g. 545078), or 5-digit stop code (e.g. 09048, 50161).
              </p>
            </div>
          )}

          {/* Matching Stops List */}
          {!isNetworkCallInFlight && matchingStops.length > 0 && (
            <div className="space-y-2">
              {/* Radius context note if searching by postal code */}
              {postalSearchResult && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600">
                  {matchingStops.length < 5
                    ? `Showing all ${matchingStops.length} stop${matchingStops.length === 1 ? '' : 's'} located within 1.5 km of ${postalSearchResult.locationName}.`
                    : `Showing nearest stops within 1.5 km of ${postalSearchResult.locationName}.`}
                </div>
              )}

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
                          {stop.distanceMeters !== undefined && (
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              {stop.distanceMeters}m · ~{stop.walkingTimeMins} min walk
                            </span>
                          )}
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
                        {stop.busServices && stop.busServices.length > 0 && (
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
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
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
                          <Star
                            className={`w-4 h-4 ${
                              isSaved ? 'fill-amber-400 text-amber-500' : ''
                            }`}
                          />
                        </button>

                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform mt-2">
                          View <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Proximity Location Section */}
      <div id="nearby-stops-section" className="space-y-3 pt-2">
        {/* Line on screen naming which location list is measured from & control to change it */}
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

          {/* Change Location Control: allows typing a 6-digit postal code anywhere in Singapore + shortcuts */}
          {showLocationPicker && (
            <div
              id="location-picker-menu"
              className="pt-2 border-t border-slate-100 space-y-3"
            >
              <form onSubmit={handleLookupPickerPostal} className="space-y-1.5">
                <label
                  htmlFor="change-location-postal-input"
                  className="block text-xs font-bold text-slate-700"
                >
                  Enter any 6-digit Singapore Postal Code:
                </label>
                <div className="flex gap-2">
                  <input
                    id="change-location-postal-input"
                    type="text"
                    value={postalInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPostalInput(val);
                      setPostalError(null);
                      // Auto-trigger when exactly 6 digits are complete
                      if (val.trim().replace(/\D/g, '').length === 6) {
                        const clean = val.trim().replace(/\D/g, '');
                        setIsPostalSearching(true);
                        fetch(`/api/postal?postalCode=${encodeURIComponent(clean)}`)
                          .then((r) => r.json())
                          .then((data) => {
                            setIsPostalSearching(false);
                            if (data.found) {
                              onLocationChange({
                                id: `postal-${clean}`,
                                name: `${data.name} (${clean})`,
                                label: `${data.name} (${clean})`,
                                postalCode: clean,
                                latitude: data.latitude,
                                longitude: data.longitude,
                              });
                              setPostalInput('');
                              setShowLocationPicker(false);
                            } else {
                              setPostalError(data.error || 'Postal code not found in Singapore.');
                            }
                          })
                          .catch(() => {
                            setIsPostalSearching(false);
                            setPostalError('Unable to resolve postal code.');
                          });
                      }
                    }}
                    placeholder="e.g. 545078 (Sengkang), 469661 (Bedok)..."
                    maxLength={6}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isPostalSearching}
                    className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    {isPostalSearching && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span>Locate</span>
                  </button>
                </div>
                {postalError && (
                  <p className="text-[11px] font-semibold text-rose-600">{postalError}</p>
                )}
              </form>

              {/* Preserved one-tap shortcuts */}
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  One-tap Shortcuts:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {MEASURING_LOCATIONS.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        onLocationChange(loc);
                        setShowLocationPicker(false);
                      }}
                      className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        selectedLocation.id === loc.id
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {loc.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* List of stops near the chosen location (strictly <= 1.5 km, no stops beyond 1.5km) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Stops Within 1.5 km of {selectedLocation.name.split('(')[0].trim()}
            </h3>
            <span className="text-xs font-medium text-slate-500">
              {nearbyStopsUnder1500m.length} found
            </span>
          </div>

          {nearbyStopsUnder1500m.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-xs text-slate-600">
              No bus stops found within 1.5 km of {selectedLocation.name}. Use &ldquo;Change Location&rdquo; to pick another postal code or shortcut.
            </div>
          ) : (
            <>
              {nearbyStopsUnder1500m.length < 5 && (
                <p className="text-xs text-slate-500 font-medium px-1">
                  Showing all {nearbyStopsUnder1500m.length} bus stop{nearbyStopsUnder1500m.length === 1 ? '' : 's'} inside the 1.5 km radius.
                </p>
              )}

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
                        {stop.busServices && stop.busServices.length > 0 && (
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
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
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
                          <Star
                            className={`w-4 h-4 ${
                              isSaved ? 'fill-amber-400 text-amber-500' : ''
                            }`}
                          />
                        </button>

                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform mt-2">
                          View <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {nearbyStopsUnder1500m.length > 5 && (
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
                      <span>Show all {nearbyStopsUnder1500m.length} stops within 1.5 km</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};
