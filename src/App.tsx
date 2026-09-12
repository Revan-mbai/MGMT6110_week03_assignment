import React, { useState } from 'react';
import { Header } from './components/Header';
import { IncidentCarousel } from './components/IncidentCarousel';
import { NearbyStopsScreen } from './components/NearbyStopsScreen';
import { BusStopDetailScreen } from './components/BusStopDetailScreen';
import { LiveBusArrivalPanel } from './components/LiveBusArrivalPanel';
import { BUS_STOPS_DATA, TRAFFIC_INCIDENTS_DATA } from './data';
import { BusStop } from './types';
import { MapPin, Radio } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'stops' | 'arrivals'>('stops');
  const [activeTab, setActiveTab] = useState<'nearby' | 'live'>('nearby');
  const [selectedStop, setSelectedStop] = useState<BusStop>(BUS_STOPS_DATA[0]);
  const [activeApiStopCode, setActiveApiStopCode] = useState<string>('04121');

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

        {/* Screen 1: Tabs for Nearby Bus Stops & Live Arrivals */}
        {currentScreen === 'stops' && (
          <>
            {/* Below header carousel showing latest traffic incidents */}
            <IncidentCarousel incidents={TRAFFIC_INCIDENTS_DATA} />

            {/* Navigation Tabs */}
            <div className="max-w-xl mx-auto px-4 pt-4">
              <nav
                id="main-screen-tabs"
                role="tablist"
                aria-label="Main Navigation Tabs"
                className="grid grid-cols-2 p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300/80 shadow-2xs"
              >
                <button
                  type="button"
                  role="tab"
                  id="tab-nearby-stops"
                  aria-selected={activeTab === 'nearby'}
                  aria-controls="tabpanel-nearby-stops"
                  onClick={() => setActiveTab('nearby')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                    activeTab === 'nearby'
                      ? 'bg-white text-slate-900 shadow-xs scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-900 active:bg-slate-300/60'
                  }`}
                >
                  <MapPin className={`w-4 h-4 ${activeTab === 'nearby' ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span>Nearby Bus Stops</span>
                </button>

                <button
                  type="button"
                  role="tab"
                  id="tab-live-arrivals"
                  aria-selected={activeTab === 'live'}
                  aria-controls="tabpanel-live-arrivals"
                  onClick={() => setActiveTab('live')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
                    activeTab === 'live'
                      ? 'bg-white text-slate-900 shadow-xs scale-[1.01]'
                      : 'text-slate-600 hover:text-slate-900 active:bg-slate-300/60'
                  }`}
                >
                  <Radio className={`w-4 h-4 ${activeTab === 'live' ? 'text-emerald-600 animate-pulse' : 'text-slate-500'}`} />
                  <span>Live Bus Arrivals</span>
                </button>
              </nav>
            </div>

            {/* Tab 1: Nearby Bus Stops */}
            {activeTab === 'nearby' && (
              <div id="tabpanel-nearby-stops" role="tabpanel" aria-labelledby="tab-nearby-stops">
                <NearbyStopsScreen
                  busStops={BUS_STOPS_DATA}
                  onSelectStop={handleSelectStop}
                />
              </div>
            )}

            {/* Tab 2: Live Bus Arrival Panel */}
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
