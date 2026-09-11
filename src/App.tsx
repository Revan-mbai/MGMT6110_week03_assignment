import React, { useState } from 'react';
import { Header } from './components/Header';
import { IncidentCarousel } from './components/IncidentCarousel';
import { NearbyStopsScreen } from './components/NearbyStopsScreen';
import { BusStopDetailScreen } from './components/BusStopDetailScreen';
import { LiveBusArrivalPanel } from './components/LiveBusArrivalPanel';
import { BUS_STOPS_DATA, TRAFFIC_INCIDENTS_DATA } from './data';
import { BusStop } from './types';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'stops' | 'arrivals'>('stops');
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

        {/* Screen 1: Nearby Bus Stops & Traffic Advisory Carousel & Live Panel */}
        {currentScreen === 'stops' && (
          <>
            {/* Below header carousel showing latest traffic incidents */}
            <IncidentCarousel incidents={TRAFFIC_INCIDENTS_DATA} />

            <div className="max-w-xl mx-auto px-4 pt-4">
              {/* Real-time Live Bus Arrival Panel fed by /api/bus */}
              <LiveBusArrivalPanel
                currentStopCode={activeApiStopCode}
                onSelectStopCode={(code) => setActiveApiStopCode(code)}
              />
            </div>

            {/* List of nearby bus stops with expandable dropdowns */}
            <NearbyStopsScreen
              busStops={BUS_STOPS_DATA}
              onSelectStop={handleSelectStop}
            />
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
