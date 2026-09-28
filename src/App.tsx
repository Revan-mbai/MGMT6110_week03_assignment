import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FindAStopScreen } from './components/FindAStopScreen';
import { ThisStopScreen } from './components/ThisStopScreen';
import { SavedStopsScreen } from './components/SavedStopsScreen';
import { DisqusComments } from './components/DisqusComments';
import { BUS_STOPS_DATA, MEASURING_LOCATIONS } from './data';
import { BusStop, MeasuringLocation } from './types';
import { Search, Radio, Star } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'find' | 'this_stop' | 'saved'>('find');
  const [selectedStop, setSelectedStop] = useState<BusStop>(() => BUS_STOPS_DATA[0]);

  // Full held catalog of bus stops, initialized with bundled data and supplemented by /api/bus-stops
  const [allBusStops, setAllBusStops] = useState<BusStop[]>(BUS_STOPS_DATA);

  // Bug Fix 1: The location chosen in Change Location is lost when the user switches tabs and comes back.
  // Persisted in localStorage so it survives tab switching and page reloads.
  const [selectedLocation, setSelectedLocation] = useState<MeasuringLocation>(() => {
    try {
      const saved = localStorage.getItem('sg_bus_active_location');
      return saved ? JSON.parse(saved) : MEASURING_LOCATIONS[0];
    } catch {
      return MEASURING_LOCATIONS[0];
    }
  });

  const handleLocationChange = (location: MeasuringLocation) => {
    setSelectedLocation(location);
    try {
      localStorage.setItem('sg_bus_active_location', JSON.stringify(location));
    } catch {
      // Local storage fallback
    }
  };

  // Bug Fix 2: Saved Stops arrives with stops already in it on a browser that has never opened the site.
  // Starts completely empty: []
  const [savedStopCodes, setSavedStopCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sg_bus_saved_stops');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch full bus stop catalog once and hold it in state
  useEffect(() => {
    fetch('/api/bus-stops')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.stops) && data.stops.length > 0) {
          const existingMap = new Map(BUS_STOPS_DATA.map((s) => [s.code, s]));
          const merged: BusStop[] = data.stops.map((raw: {
            code?: string;
            name?: string;
            road?: string;
            postalCode?: string;
            latitude?: number;
            longitude?: number;
            busServices?: string[];
          }) => {
            const code = String(raw.code || '').trim();
            if (existingMap.has(code)) {
              return existingMap.get(code)!;
            }
            return {
              id: `stop-${code}`,
              code,
              name: raw.name || `Bus Stop ${code}`,
              road: raw.road || 'Singapore Road',
              postalCode: raw.postalCode || '',
              latitude: raw.latitude || 1.3025,
              longitude: raw.longitude || 103.825,
              busServices: raw.busServices || ['14', '65', '106'],
              buses: [
                {
                  busNumber: '14',
                  destination: 'Loop / Terminal',
                  isDelayed: false,
                  nextBus: {
                    arrivalMinutes: 4,
                    load: 'Seats Available' as const,
                    type: 'Double Deck' as const,
                    wheelchairAccessible: true,
                  },
                  subsequentBus: {
                    arrivalMinutes: 11,
                    load: 'Standing Available' as const,
                    type: 'Single Deck' as const,
                    wheelchairAccessible: true,
                  },
                  thirdBus: {
                    arrivalMinutes: 19,
                    load: 'Seats Available' as const,
                    type: 'Double Deck' as const,
                    wheelchairAccessible: true,
                  },
                },
              ],
            };
          });

          // Ensure all bundled stops are preserved
          for (const s of BUS_STOPS_DATA) {
            if (!merged.some((m) => m.code === s.code)) {
              merged.push(s);
            }
          }

          setAllBusStops(merged);
        }
      })
      .catch(() => {
        // Fallback to BUS_STOPS_DATA on fetch error
      });
  }, []);

  // Requirement (f): Unified save/unsave control working identically everywhere
  const handleToggleSaveStop = (code: string) => {
    setSavedStopCodes((prev) => {
      const next = prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code];
      try {
        localStorage.setItem('sg_bus_saved_stops', JSON.stringify(next));
      } catch {
        // Safe fallback
      }
      return next;
    });
  };

  const handleSelectStop = (stop: BusStop) => {
    setSelectedStop(stop);
    setCurrentScreen('this_stop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToFindStops = () => {
    setCurrentScreen('find');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Formatted date string for Singapore Open Data Licence
  const accessedDateString = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      id="bus-tracking-app-root"
      className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-12 antialiased flex flex-col justify-between"
    >
      <div>
        {/* Top Header */}
        <Header
          currentScreen={currentScreen}
          selectedStopName={selectedStop?.name}
          onBackToFindStops={handleBackToFindStops}
        />

        {/* 3 Main Screen Tabs */}
        <div className="max-w-xl mx-auto px-4 pt-3.5">
          <nav
            id="main-screens-nav"
            role="tablist"
            aria-label="Three Main Screens"
            className="grid grid-cols-3 p-1 bg-slate-200/90 rounded-xl border border-slate-300 shadow-2xs gap-1"
          >
            {/* Screen 1: Find a Stop */}
            <button
              type="button"
              role="tab"
              id="tab-find-stop"
              aria-selected={currentScreen === 'find'}
              aria-controls="screen-find-stop"
              onClick={() => setCurrentScreen('find')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                currentScreen === 'find'
                  ? 'bg-white text-slate-900 shadow-2xs scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 active:bg-slate-300/50'
              }`}
            >
              <Search className={`w-3.5 h-3.5 ${currentScreen === 'find' ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span>Find a Stop</span>
            </button>

            {/* Screen 2: This Stop */}
            <button
              type="button"
              role="tab"
              id="tab-this-stop"
              aria-selected={currentScreen === 'this_stop'}
              aria-controls="screen-this-stop"
              onClick={() => setCurrentScreen('this_stop')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                currentScreen === 'this_stop'
                  ? 'bg-white text-slate-900 shadow-2xs scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 active:bg-slate-300/50'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${currentScreen === 'this_stop' ? 'text-emerald-600 animate-pulse' : 'text-slate-500'}`} />
              <span className="truncate">This Stop</span>
            </button>

            {/* Screen 3: Saved Stops */}
            <button
              type="button"
              role="tab"
              id="tab-saved-stops"
              aria-selected={currentScreen === 'saved'}
              aria-controls="screen-saved-stops"
              onClick={() => setCurrentScreen('saved')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                currentScreen === 'saved'
                  ? 'bg-white text-slate-900 shadow-2xs scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900 active:bg-slate-300/50'
              }`}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  currentScreen === 'saved'
                    ? 'text-amber-500 fill-amber-400'
                    : 'text-slate-500'
                }`}
              />
              <span>Saved Stops</span>
              {savedStopCodes.length > 0 && (
                <span className="text-[10px] font-black bg-amber-500 text-white rounded-full px-1.5 py-0.2 leading-none">
                  {savedStopCodes.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Screen 1: Find a Stop */}
        {currentScreen === 'find' && (
          <div id="screen-find-stop" role="tabpanel" aria-labelledby="tab-find-stop">
            <FindAStopScreen
              busStops={allBusStops}
              onSelectStop={handleSelectStop}
              savedStopCodes={savedStopCodes}
              onToggleSaveStop={handleToggleSaveStop}
              selectedLocation={selectedLocation}
              onLocationChange={handleLocationChange}
            />
          </div>
        )}

        {/* Screen 2: This Stop */}
        {currentScreen === 'this_stop' && selectedStop && (
          <div id="screen-this-stop" role="tabpanel" aria-labelledby="tab-this-stop">
            <ThisStopScreen
              selectedStop={selectedStop}
              onBackToStops={handleBackToFindStops}
              savedStopCodes={savedStopCodes}
              onToggleSaveStop={handleToggleSaveStop}
            />
          </div>
        )}

        {/* Screen 3: Saved Stops */}
        {currentScreen === 'saved' && (
          <div id="screen-saved-stops" role="tabpanel" aria-labelledby="tab-saved-stops">
            <SavedStopsScreen
              allBusStops={allBusStops}
              savedStopCodes={savedStopCodes}
              onToggleSaveStop={handleToggleSaveStop}
              onSelectStop={handleSelectStop}
              onGoToFindStops={() => setCurrentScreen('find')}
            />
          </div>
        )}

        {/* Disqus Community Feedback Section - Main Page */}
        <DisqusComments />
      </div>

      {/* Mandatory Singapore Open Data Licence & Privacy Notice Footer */}
      <footer id="app-licence-footer" className="max-w-xl mx-auto px-4 pt-8 pb-4 text-center space-y-3">
        <p className="text-xs text-slate-500 leading-relaxed font-normal">
          Contains information from LTA DataMall Bus Arrival, accessed {accessedDateString}, made available under the terms of the Singapore Open Data Licence version 1.0, data.gov.sg/open-data-licence.
        </p>
        <p id="app-privacy-notice" className="text-xs text-slate-500 leading-relaxed font-normal">
          This page uses Microsoft Clarity and Disqus, which use cookies to record how visitors use the site and to host comments. By using this page you agree that we and Microsoft may collect and use this data. See the{' '}
          <a
            href="https://www.microsoft.com/privacy/privacystatement"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-700"
          >
            Microsoft Privacy Statement
          </a>
          , the{' '}
          <a
            href="https://disqus.com/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-700"
          >
            Disqus privacy policy
          </a>{' '}
          and the{' '}
          <a
            href="https://disqus.com/data-sharing-settings/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-700"
          >
            Disqus data sharing settings
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
