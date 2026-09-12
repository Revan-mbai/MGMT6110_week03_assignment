import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { BusStop } from '../types';
import { MapPin, Navigation, Crosshair, AlertTriangle, ArrowRight, Layers, KeyRound } from 'lucide-react';

// Exact Singapore central GPS coordinates for nearby bus stops
export const BUS_STOP_GPS_COORDINATES: Record<string, { lat: number; lng: number }> = {
  '09048': { lat: 1.3023, lng: 103.8242 }, // Opp Orchard Boulevard Stn
  '08031': { lat: 1.3006, lng: 103.8378 }, // Somerset Stn
  '08057': { lat: 1.2988, lng: 103.8458 }, // Dhoby Ghaut Stn
  '04121': { lat: 1.2931, lng: 103.8519 }, // City Hall Stn / Opp The Treasury
  '01012': { lat: 1.3005, lng: 103.8560 }, // Bugis Stn Exit A
  '02049': { lat: 1.2952, lng: 103.8596 }, // Suntec City / Promenade Stn
};

// Fallback coordinate generator for custom added stops
export function getStopGpsCoordinates(stop: BusStop, index: number): { lat: number; lng: number } {
  if (BUS_STOP_GPS_COORDINATES[stop.code]) {
    return BUS_STOP_GPS_COORDINATES[stop.code];
  }
  const hash = stop.code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const offsetLat = (((hash * 13) % 100) - 50) * 0.0002;
  const offsetLng = (((hash * 17) % 100) - 50) * 0.0002;
  return {
    lat: 1.3025 + offsetLat,
    lng: 103.8250 + offsetLng,
  };
}

// Controller to smoothly pan map when center changes
function MapPanController({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [map, center]);
  return null;
}

interface NearbyGoogleMapProps {
  busStops: BusStop[];
  selectedStopCode: string | null;
  onSelectStop: (stop: BusStop) => void;
  onHighlightStop?: (code: string) => void;
}

export const NearbyGoogleMap: React.FC<NearbyGoogleMapProps> = ({
  busStops,
  selectedStopCode,
  onSelectStop,
  onHighlightStop,
}) => {
  // Default user location: Orchard Boulevard area (lat: 1.3025, lng: 103.8250)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 1.3025,
    lng: 103.8250,
  });
  const [hasRealLocation, setHasRealLocation] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 1.3025,
    lng: 103.8250,
  });
  const [activeStop, setActiveStop] = useState<BusStop | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || '';

  // Attempt to obtain real user location if permitted
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserLocation(loc);
          setMapCenter(loc);
          setHasRealLocation(true);
        },
        (err) => {
          // Gracefully fallback to Orchard Boulevard default location
          console.debug('Geolocation prompt bypassed or unavailable, using Orchard default:', err?.message);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, []);

  // Update active stop when parent highlights a stop
  useEffect(() => {
    if (selectedStopCode) {
      const match = busStops.find((s) => s.code === selectedStopCode);
      if (match) {
        setActiveStop(match);
        setMapCenter(getStopGpsCoordinates(match, 0));
      }
    }
  }, [selectedStopCode, busStops]);

  const handleRecenterUser = () => {
    setMapCenter({ ...userLocation });
  };

  const handleMarkerClick = (stop: BusStop) => {
    setActiveStop(stop);
    if (onHighlightStop) {
      onHighlightStop(stop.code);
    }
  };

  return (
    <div
      id="nearby-google-maps-container"
      className="w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative"
    >
      {/* Map Header Status Bar */}
      <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-md border border-slate-200/80 pointer-events-auto text-[11px] font-bold text-slate-800">
        <Navigation className="w-3.5 h-3.5 text-blue-600 fill-blue-600/30 shrink-0" />
        <span>Google Maps</span>
        <span className="text-slate-300">•</span>
        <span className="text-emerald-700 font-semibold">{busStops.length} stops nearby</span>
      </div>

      {/* Recenter on User Button */}
      <button
        type="button"
        id="recenter-user-location-btn"
        onClick={handleRecenterUser}
        title="Recenter map to your location"
        aria-label="Recenter map to your location"
        className="absolute top-2.5 right-2.5 z-20 p-2 bg-white/95 hover:bg-white active:bg-slate-100 text-slate-700 hover:text-blue-600 rounded-full shadow-md border border-slate-200/80 transition-all pointer-events-auto active:scale-95"
      >
        <Crosshair className="w-4 h-4" />
      </button>

      {/* Interactive Google Map using @vis.gl/react-google-maps when API key is provided */}
      {apiKey ? (
        <div className="w-full h-72 sm:h-80 relative">
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={mapCenter}
              defaultZoom={15}
              gestureHandling="greedy"
              disableDefaultUI={false}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              className="w-full h-full"
            >
              <MapPanController center={mapCenter} />

              {/* User Location Marker */}
              <AdvancedMarker
                position={userLocation}
                title="Your Location"
                zIndex={100}
              >
                <div className="relative flex items-center justify-center cursor-pointer">
                  <div className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping" />
                  <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span className="absolute -bottom-5 whitespace-nowrap text-[10px] font-black text-blue-900 bg-white/95 px-1.5 py-0.5 rounded shadow-sm border border-blue-200">
                    You {hasRealLocation ? '(GPS)' : ''}
                  </span>
                </div>
              </AdvancedMarker>

              {/* Bus Stops Markers */}
              {busStops.map((stop, idx) => {
                const pos = getStopGpsCoordinates(stop, idx);
                const isSelected = activeStop?.code === stop.code || selectedStopCode === stop.code;
                const hasDelays = stop.buses.some((b) => b.isDelayed);

                return (
                  <AdvancedMarker
                    key={stop.code}
                    position={pos}
                    title={`${stop.name} (${stop.code})`}
                    onClick={() => handleMarkerClick(stop)}
                    zIndex={isSelected ? 50 : 20}
                  >
                    <div
                      className={`cursor-pointer transition-transform duration-150 hover:scale-110 active:scale-95 ${
                        isSelected ? 'scale-110' : ''
                      }`}
                    >
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg shadow-md font-mono text-xs font-black border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300'
                            : hasDelays
                            ? 'bg-amber-600 text-white border-amber-700'
                            : 'bg-slate-900 text-white border-slate-800'
                        }`}
                      >
                        <MapPin className="w-3 h-3 text-emerald-300 shrink-0" />
                        <span>{stop.code}</span>
                      </div>
                    </div>
                  </AdvancedMarker>
                );
              })}

              {/* InfoWindow for the Active / Selected Bus Stop */}
              {activeStop && (
                <InfoWindow
                  position={getStopGpsCoordinates(activeStop, 0)}
                  onCloseClick={() => setActiveStop(null)}
                  headerContent={
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <span className="bg-slate-900 text-white px-1.5 py-0.5 rounded font-mono text-[10px]">
                        {activeStop.code}
                      </span>
                      <span className="truncate max-w-[150px]">{activeStop.name}</span>
                    </div>
                  }
                >
                  <div className="p-1 space-y-2 min-w-[210px] text-xs text-slate-700">
                    <p className="text-[11px] text-slate-500 font-medium">
                      {activeStop.road} • {activeStop.distanceMeters}m (~{activeStop.walkingTimeMins} min walk)
                    </p>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-1">
                        Buses passing this stop:
                      </span>
                      <div className="flex items-center gap-1 flex-wrap">
                        {activeStop.busServices.map((svc) => (
                          <span
                            key={svc}
                            className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-black text-slate-800"
                          >
                            {svc}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectStop(activeStop)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-2xs transition-colors"
                    >
                      <span>View Arrival Times</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        </div>
      ) : (
        /* Visual Interactive Map Preview showing User & Nearby Stops (when API key is pending) */
        <div className="w-full h-72 sm:h-80 relative select-none bg-slate-950">
          {/* SVG Map Canvas with Singapore Road Grid and Waterway */}
          <svg
            className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 500 320"
            preserveAspectRatio="none"
          >
            {/* Waterway / Canal */}
            <path
              d="M 320 320 Q 360 220, 420 180 T 500 150 L 500 320 Z"
              fill="#0369a1"
              opacity="0.25"
            />
            {/* Parks / Green spaces */}
            <circle cx="160" cy="120" r="50" fill="#047857" opacity="0.15" />
            <ellipse cx="330" cy="90" rx="60" ry="35" fill="#047857" opacity="0.12" />

            {/* Singapore Arterials & Expressways */}
            <line x1="0" y1="80" x2="500" y2="180" stroke="#334155" strokeWidth="8" opacity="0.6" />
            <line x1="0" y1="120" x2="500" y2="240" stroke="#475569" strokeWidth="10" opacity="0.7" />
            <line x1="140" y1="0" x2="330" y2="320" stroke="#475569" strokeWidth="8" opacity="0.7" />
            <line x1="330" y1="0" x2="420" y2="320" stroke="#334155" strokeWidth="6" opacity="0.5" />
            <line x1="60" y1="0" x2="190" y2="320" stroke="#334155" strokeWidth="5" opacity="0.4" />

            {/* Road Label Text */}
            <text x="30" y="70" fill="#94a3b8" fontSize="10" fontWeight="600" opacity="0.6">Orchard Boulevard</text>
            <text x="180" y="150" fill="#94a3b8" fontSize="10" fontWeight="600" opacity="0.6">Somerset Road</text>
            <text x="280" y="210" fill="#94a3b8" fontSize="10" fontWeight="600" opacity="0.6">Bras Basah Rd</text>
            <text x="360" y="270" fill="#94a3b8" fontSize="10" fontWeight="600" opacity="0.6">Victoria St</text>
          </svg>

          {/* User Location Marker on the Canvas */}
          <div
            id="user-location-pin"
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: '26%', top: '48%' }}
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute w-9 h-9 rounded-full bg-blue-500/35 animate-ping" />
              <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-xl flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <span className="absolute -bottom-5 whitespace-nowrap text-[10px] font-black text-blue-900 bg-white/95 px-1.5 py-0.5 rounded shadow-sm border border-blue-200">
                You (Your Location)
              </span>
            </div>
          </div>

          {/* Bus Stop Pins on the Canvas */}
          {busStops.map((stop) => {
            // Coordinate mapping for visual canvas
            const coords: Record<string, { left: string; top: string }> = {
              '09048': { left: '33%', top: '44%' },
              '08031': { left: '46%', top: '50%' },
              '08057': { left: '58%', top: '56%' },
              '04121': { left: '72%', top: '72%' },
              '01012': { left: '79%', top: '40%' },
              '02049': { left: '86%', top: '64%' },
            };
            const pos = coords[stop.code] || { left: '50%', top: '50%' };
            const isSelected = activeStop?.code === stop.code || selectedStopCode === stop.code;
            const hasDelays = stop.buses.some((b) => b.isDelayed);

            return (
              <button
                key={stop.code}
                type="button"
                id={`map-stop-pin-${stop.code}`}
                onClick={() => handleMarkerClick(stop)}
                className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-transform duration-150 hover:scale-115 active:scale-95 focus:outline-none ${
                  isSelected ? 'scale-115 z-30' : ''
                }`}
                style={{ left: pos.left, top: pos.top }}
                title={`${stop.name} (${stop.code})`}
              >
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg shadow-lg font-mono text-xs font-black border ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300'
                      : hasDelays
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-900 text-white border-slate-700'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{stop.code}</span>
                </div>
              </button>
            );
          })}

          {/* Selected Stop Preview Overlay Card */}
          {activeStop && (
            <div
              id="map-selected-stop-card"
              className="absolute bottom-2 left-2 right-2 z-30 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-slate-200/90 flex items-center justify-between gap-3 animate-in fade-in duration-150"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                    {activeStop.code}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {activeStop.name}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {activeStop.road} • {activeStop.distanceMeters}m (~{activeStop.walkingTimeMins} min walk)
                </p>
              </div>

              <button
                type="button"
                id="map-preview-view-arrivals-btn"
                onClick={() => onSelectStop(activeStop)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
              >
                <span>Arrivals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
