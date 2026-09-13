import React, { useState } from 'react';
import { Header } from './components/Header';
import { IncidentCarousel } from './components/IncidentCarousel';
import { NearbyStopsScreen } from './components/NearbyStopsScreen';
import { FavouritesScreen } from './components/FavouritesScreen';
import { BusStopDetailScreen } from './components/BusStopDetailScreen';
import { LiveBusArrivalPanel } from './components/LiveBusArrivalPanel';
import { BUS_STOPS_DATA, TRAFFIC_INCIDENTS_DATA } from './data';
import { BusStop } from './types';
import { MapPin, Radio, Star } from 'lucide-react';
import { KNOWN_SINGAPORE_BUS_STOPS, buildBusStopObject } from './busStopsRegistry';

const ALL_BUS_STOPS: BusStop[] = [
  ...BUS_STOPS_DATA,
  ...KNOWN_SINGAPORE_BUS_STOPS
    .filter((k) => !BUS_STOPS_DATA.some((b) => b.code === k.code))
    .map((k) => buildBusStopObject(k.code) as BusStop),
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'stops' | 'arrivals'>('stops');
  const [activeTab, setActiveTab] = useState<'nearby' | 'favourites' | 'live'>('nearby');
  const [selectedStop, setSelectedStop] = useState<BusStop>(BUS_STOPS_DATA[0]);
  const [activeApiStopCode, setActiveApiStopCode] = useState<string>('04121');

  // Persisted favourite bus stops state
  const [favouriteStopCodes, setFavouriteStopCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sg_bus_favourite_stops');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleFavourite = (code: string) => {
    setFavouriteStopCodes((prev) => {
      const next = prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code];
      try {
        localStorage.setItem('sg_bus_favourite_stops', JSON.stringify(next));
      } catch {
        // Local storage error handling
      }
      return next;
    });
  };

  const handleAddFavourite = (code: string) => {
    setFavouriteStopCodes((prev) => {
      if (prev.includes(code)) return prev;
      const next = [...prev, code];
      try {
        localStorage.setItem('sg_bus_favourite_stops', JSON.stringify(next));
      } catch {
        // Local storage error handling
      }
      return next;
    });
  };

  const handleSelectStop = (stop: BusStop) => {
    setSelectedStop(stop);
    setActiveApiStopCode(stop.code);
    setCurrentScreen('arrivals');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStops = () => {
    setCurrentScreen('stops');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Formatted date string for the Singapore Open Data Licence
  const accessedDateString = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div id="bus-tracking-app-root" className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-12 antialiased flex flex-col justify-between">
      <div>
        {/* Top Application Header */}
        <Header
          currentScreen={currentScreen}
          selectedStopName={selectedStop?.name}
          onBackToStops={handleBackToStops}
        />

        {/* Screen 1: Tabs for Nearby Bus Stops, Favourites & Live Arrivals */}
        {currentScreen === 'stops' && (
          <>
            {/* Below header carousel showing latest traffic incidents */}
            <IncidentCarousel incidents={TRAFFIC_INCIDENTS_DATA} />

            {/* Navigation Tabs - thin, compact and less bulky */}
            <div className="max-w-xl mx-auto px-4 pt-2.5">
              <nav
                id="main-screen-tabs"
                role="tablist"
                aria-label="Main Navigation Tabs"
                className="grid grid-cols-3 p-1 bg-slate-200/80 rounded-xl border border-slate-300/80 shadow-2xs gap-1"
              >
                {/* Tab 1: Nearby Bus Stops */}
                <button
                  type="button"
                  role="tab"
                  id="tab-nearby-stops"
                  aria-selected={activeTab === 'nearby'}
                  aria-controls="tabpanel-nearby-stops"
                  onClick={() => setActiveTab('nearby')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'nearby'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-900 active:bg-slate-300/50'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${activeTab === 'nearby' ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span>Nearby</span>
                </button>

                {/* Tab 2: Favourites */}
                <button
                  type="button"
                  role="tab"
                  id="tab-favourites"
                  aria-selected={activeTab === 'favourites'}
                  aria-controls="tabpanel-favourites"
                  onClick={() => setActiveTab('favourites')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'favourites'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-900 active:bg-slate-300/50'
                  }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      activeTab === 'favourites'
                        ? 'text-amber-500 fill-amber-400'
                        : 'text-slate-500'
                    }`}
                  />
                  <span>Favourites</span>
                  {favouriteStopCodes.length > 0 && (
                    <span className="text-[9px] font-black bg-amber-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                      {favouriteStopCodes.length}
                    </span>
                  )}
                </button>

                {/* Tab 3: Live Bus Arrivals */}
                <button
                  type="button"
                  role="tab"
                  id="tab-live-arrivals"
                  aria-selected={activeTab === 'live'}
                  aria-controls="tabpanel-live-arrivals"
                  onClick={() => setActiveTab('live')}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'live'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-900 active:bg-slate-300/50'
                  }`}
                >
                  <Radio
                    className={`w-3.5 h-3.5 ${
                      activeTab === 'live' ? 'text-emerald-600 animate-pulse' : 'text-slate-500'
                    }`}
                  />
                  <span>Live Arrivals</span>
                </button>
              </nav>
            </div>

            {/* Tab 1 Panel: Nearby Bus Stops */}
            {activeTab === 'nearby' && (
              <div id="tabpanel-nearby-stops" role="tabpanel" aria-labelledby="tab-nearby-stops">
                <NearbyStopsScreen
                  busStops={ALL_BUS_STOPS}
                  onSelectStop={handleSelectStop}
                  favouriteStopCodes={favouriteStopCodes}
                  onToggleFavourite={handleToggleFavourite}
                />
              </div>
            )}

            {/* Tab 2 Panel: Favourites */}
            {activeTab === 'favourites' && (
              <div id="tabpanel-favourites" role="tabpanel" aria-labelledby="tab-favourites">
                <FavouritesScreen
                  busStops={ALL_BUS_STOPS}
                  allAvailableStops={ALL_BUS_STOPS}
                  favouriteStopCodes={favouriteStopCodes}
                  onToggleFavourite={handleToggleFavourite}
                  onAddFavouriteStop={handleAddFavourite}
                  onSelectStop={handleSelectStop}
                  onBrowseNearby={() => setActiveTab('nearby')}
                />
              </div>
            )}

            {/* Tab 3 Panel: Live Bus Arrival Panel */}
            {activeTab === 'live' && (
              <div id="tabpanel-live-arrivals" role="tabpanel" aria-labelledby="tab-live-arrivals" className="max-w-xl mx-auto px-4 pt-4">
                <LiveBusArrivalPanel
                  currentStopCode={activeApiStopCode}
                  onSelectStopCode={(code) => setActiveApiStopCode(code)}
                />
              </div>
            )}
          </>
        )}

        {/* Screen 2: Selected Bus Stop & Real-Time Bus Arrivals with Delay Warnings */}
        {currentScreen === 'arrivals' && selectedStop && (
          <div className="space-y-4">
            <div className="max-w-xl mx-auto px-4 pt-4">
              <LiveBusArrivalPanel
                currentStopCode={selectedStop.code}
                onSelectStopCode={(code) => setActiveApiStopCode(code)}
              />
            </div>

            <BusStopDetailScreen
              selectedStop={selectedStop}
              onBack={handleBackToStops}
            />
          </div>
        )}
      </div>

      {/* Mandatory Licence Footer */}
      <footer id="app-licence-footer" className="max-w-xl mx-auto px-4 pt-8 pb-4 text-center">
        <p className="text-xs text-slate-500 leading-relaxed font-normal">
          Contains information from LTA DataMall Bus Arrival, accessed {accessedDateString}, made available under the terms of the Singapore Open Data Licence version 1.0, data.gov.sg/open-data-licence.
        </p>
      </footer>
    </div>
  );
}
