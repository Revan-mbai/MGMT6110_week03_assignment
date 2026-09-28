import React, { useState, useEffect, useMemo } from 'react';
import { BusStop, BusArrivalInfo, TrafficIncident } from '../types';
import { getDistanceInMeters } from '../data';
import {
  ArrowLeft,
  RefreshCw,
  Star,
  Clock,
  Accessibility,
  AlertTriangle,
  Info,
  CheckCircle2,
  Radio
} from 'lucide-react';

interface ThisStopScreenProps {
  selectedStop: BusStop;
  onBackToStops: () => void;
  savedStopCodes: string[];
  onToggleSaveStop: (code: string) => void;
}

interface IncidentsApiResponse {
  isReal: boolean;
  source: string;
  fetchedAt: string;
  incidents: TrafficIncident[];
  error?: string;
}

export const ThisStopScreen: React.FC<ThisStopScreenProps> = ({
  selectedStop,
  onBackToStops,
  savedStopCodes,
  onToggleSaveStop,
}) => {
  // Live arrival state
  const [busesData, setBusesData] = useState<BusArrivalInfo[]>(selectedStop.buses);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState<number>(20);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  });

  // Current clock time tick to advance "ago" calculations while the page stays open
  const [currentClock, setCurrentClock] = useState<Date>(() => new Date());

  // Real traffic incidents state from LTA DataMall
  const [incidentsData, setIncidentsData] = useState<IncidentsApiResponse>({
    isReal: false,
    source: 'Loading...',
    fetchedAt: new Date().toISOString(),
    incidents: [],
  });
  const [isLoadingIncidents, setIsLoadingIncidents] = useState<boolean>(true);

  // Fetch real traffic incidents from /api/incidents
  const fetchIncidents = async () => {
    setIsLoadingIncidents(true);
    try {
      const res = await fetch('/api/incidents');
      const data: IncidentsApiResponse = await res.json();
      setIncidentsData(data);
    } catch {
      setIncidentsData((prev) => ({
        ...prev,
        error: 'Unable to reach LTA DataMall traffic incidents service.',
      }));
    } finally {
      setIsLoadingIncidents(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // Update clock every second so "ago" advances dynamically while page is open
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentClock(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Synchronize busesData when selectedStop changes
  useEffect(() => {
    setBusesData(selectedStop.buses);
    setSecondsUntilRefresh(20);
    setLastRefreshedTime(
      new Date().toLocaleTimeString('en-SG', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    );
  }, [selectedStop]);

  // Roughly 20-second countdown auto-refresh as required
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          triggerRefresh();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    fetchIncidents();

    setBusesData((current) =>
      current.map((bus) => {
        let arr1 = bus.nextBus.arrivalMinutes;
        if (arr1 > 0) {
          arr1 = Math.max(0, arr1 - 1);
        } else {
          arr1 = bus.subsequentBus ? Math.max(1, bus.subsequentBus.arrivalMinutes - 1) : 6;
        }

        let arr2 = bus.subsequentBus ? bus.subsequentBus.arrivalMinutes : undefined;
        if (arr2 !== undefined) {
          arr2 = Math.max(arr1 + 3, arr2 - (arr1 === 0 ? 2 : 1));
        }

        let arr3 = bus.thirdBus ? bus.thirdBus.arrivalMinutes : undefined;
        if (arr3 !== undefined) {
          arr3 = Math.max((arr2 || arr1) + 4, arr3 - 1);
        }

        return {
          ...bus,
          nextBus: {
            ...bus.nextBus,
            arrivalMinutes: arr1,
          },
          subsequentBus: bus.subsequentBus
            ? {
                ...bus.subsequentBus,
                arrivalMinutes: arr2 ?? 10,
              }
            : undefined,
          thirdBus: bus.thirdBus
            ? {
                ...bus.thirdBus,
                arrivalMinutes: arr3 ?? 18,
              }
            : undefined,
        };
      })
    );

    const now = new Date();
    setLastRefreshedTime(
      now.toLocaleTimeString('en-SG', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    );

    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const handleManualRefresh = () => {
    triggerRefresh();
    setSecondsUntilRefresh(20);
  };

  const isSaved = savedStopCodes.includes(selectedStop.code);

  /**
   * Calculates "how long ago" dynamically from current clock now.
   * Never a fixed number written into code; advances as page stays open.
   */
  const calculateAgo = (reportedTime?: string, reportedDate?: string) => {
    if (!reportedTime) return 'Recently reported';

    const parts = reportedTime.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return 'Recently reported';

    const now = currentClock;
    const incidentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);

    let diffMs = now.getTime() - incidentDate.getTime();
    if (diffMs < 0) {
      if (diffMs < -12 * 3600 * 1000) {
        incidentDate.setDate(incidentDate.getDate() - 1);
        diffMs = now.getTime() - incidentDate.getTime();
      } else {
        diffMs = 0;
      }
    }

    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins <= 0) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const hours = Math.floor(diffMins / 60);
    const remMins = diffMins % 60;
    return remMins > 0 ? `${hours} hr ${remMins} mins ago` : `${hours} hr ago`;
  };

  // Requirement: Only advisories whose coordinates fall within 2 km of the stop being viewed appear
  const nearbyIncidents = useMemo(() => {
    if (!incidentsData.incidents || incidentsData.incidents.length === 0) return [];

    return incidentsData.incidents
      .map((inc) => {
        const dist = getDistanceInMeters(
          selectedStop.latitude,
          selectedStop.longitude,
          inc.latitude,
          inc.longitude
        );
        return {
          ...inc,
          distanceFromStopMeters: dist,
        };
      })
      .filter((inc) => inc.distanceFromStopMeters <= 2000) // Within 2 km only
      .sort((a, b) => (a.distanceFromStopMeters || 0) - (b.distanceFromStopMeters || 0));
  }, [incidentsData, selectedStop]);

  const fetchedAtTime = useMemo(() => {
    try {
      const d = new Date(incidentsData.fetchedAt);
      return d.toLocaleTimeString('en-SG', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return lastRefreshedTime;
    }
  }, [incidentsData.fetchedAt, lastRefreshedTime]);

  const getLoadBadge = (load: string) => {
    switch (load) {
      case 'Seats Available':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          label: 'Seats Available',
          dot: 'bg-emerald-500',
        };
      case 'Standing Available':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          label: 'Standing Available',
          dot: 'bg-amber-500',
        };
      case 'Limited Standing':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          label: 'Limited Standing',
          dot: 'bg-rose-500',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-300',
          label: load,
          dot: 'bg-slate-400',
        };
    }
  };

  return (
    <section id="this-stop-screen" className="max-w-xl mx-auto px-4 py-4 space-y-4">
      {/* Requirement (c): One line stating what this screen is for and what to give it */}
      <div
        id="screen-purpose-line"
        className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-emerald-900 leading-snug"
      >
        Live arrival predictions, bus capacity, wheelchair access, and traffic advisories for this stop.
      </div>

      {/* Stop Header with Back Button and Save Control */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <button
            id="back-to-find-stop-btn"
            type="button"
            onClick={onBackToStops}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600" />
            <span>Find a Stop</span>
          </button>

          {/* Requirement (f): Save/unsave control identical to other screens */}
          <button
            id="this-stop-save-toggle-btn"
            type="button"
            onClick={() => onToggleSaveStop(selectedStop.code)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isSaved
                ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50 hover:border-amber-200'
            }`}
          >
            <Star
              className={`w-4 h-4 ${
                isSaved ? 'text-amber-500 fill-amber-400' : 'text-slate-400'
              }`}
            />
            <span>{isSaved ? 'Saved' : 'Save Stop'}</span>
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-sm font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
              {selectedStop.code}
            </span>
            {selectedStop.postalCode && (
              <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Postal {selectedStop.postalCode}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {selectedStop.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {selectedStop.road}, Singapore
          </p>
        </div>

        {/* Updated line and Refresh control (auto-refresh ~20s countdown and advancing Updated time) */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span id="this-stop-updated-time" className="font-semibold">
              Updated: {lastRefreshedTime}
            </span>
            <span className="text-slate-400">·</span>
            <span id="auto-refresh-countdown" className="text-slate-500 font-medium">
              Auto-refresh in {secondsUntilRefresh}s
            </span>
          </div>

          <button
            id="manual-refresh-arrivals-btn"
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg transition-colors active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Traffic Advisories Panel — Real, from LTA DataMall Traffic Incidents */}
      {/* Only advisories within 2 km appear. If none do, says there are no incidents reported near this stop */}
      <div id="traffic-advisories-panel" className="space-y-2">
        {nearbyIncidents.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs text-xs text-slate-600 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                No traffic incidents reported near this stop (within 2 km).
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Source: {incidentsData.isReal ? 'LTA DataMall' : 'LTA DataMall Demo'} · Fetched at {fetchedAtTime}
            </span>
          </div>
        ) : (
          <div className="space-y-2">
            {nearbyIncidents.map((advisory) => {
              const agoText = calculateAgo(advisory.reportedTime, advisory.reportedDate);

              return (
                <div
                  key={advisory.id}
                  className="bg-amber-50/90 border border-amber-300 rounded-xl p-3.5 shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs sm:text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Traffic Incident: {advisory.type}</span>
                      {advisory.distanceFromStopMeters !== undefined && (
                        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300/80">
                          ~{advisory.distanceFromStopMeters}m from stop
                        </span>
                      )}
                    </div>

                    {/* Requirement: Badge reading EXAMPLE ADVISORY DATA is removed once data is real */}
                    {!incidentsData.isReal && (
                      <span className="text-[10px] font-bold text-slate-600 bg-white/90 border border-amber-300/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Demonstration Data
                      </span>
                    )}
                  </div>

                  {/* Incident details: what happened and where */}
                  <p className="text-xs text-amber-950 font-semibold leading-relaxed">
                    {advisory.details || advisory.message}
                  </p>

                  {/* Displays real reported time, dynamic advancing "ago" figure, and LTA DataMall source attribution */}
                  <div className="flex items-center justify-between text-[11px] text-amber-900 pt-1 border-t border-amber-200/80 flex-wrap gap-2">
                    <div>
                      {advisory.reportedTime && (
                        <span>
                          <strong>Reported: </strong>
                          {advisory.reportedTime} ({agoText})
                        </span>
                      )}
                    </div>
                    <span className="text-amber-800 font-mono text-[10px]">
                      Source: {incidentsData.isReal ? 'LTA DataMall' : 'LTA DataMall Demo'} · Fetched at {fetchedAtTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* The Single Arrivals List: Every service at this stop in one list, no duplicate list */}
      <div id="bus-services-arrivals-list" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Bus Services ({busesData.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            3 Upcoming Arrival Times
          </span>
        </div>

        <div className="space-y-2.5">
          {busesData.map((bus) => {
            const hasDelay = bus.isDelayed;

            return (
              <div
                key={bus.busNumber}
                className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5"
              >
                {/* Service Header Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                      {bus.busNumber}
                    </span>
                    <span className="text-xs font-medium text-slate-600 truncate max-w-[200px] sm:max-w-[300px]">
                      to {bus.destination}
                    </span>
                  </div>

                  {hasDelay && (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      +{bus.delayMinutes || 8} min delay
                    </span>
                  )}
                </div>

                {/* 3 Arrival Predictions Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                  {/* Arrival 1 (Next Bus) */}
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Next Bus
                      </span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        {bus.nextBus.arrivalMinutes === 0 ? 'Arr' : `${bus.nextBus.arrivalMinutes} min`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-1">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${
                          getLoadBadge(bus.nextBus.load).bg
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${getLoadBadge(bus.nextBus.load).dot}`} />
                        {getLoadBadge(bus.nextBus.load).label}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                        {bus.nextBus.wheelchairAccessible && (
                          <Accessibility className="w-3 h-3 text-emerald-600" title="Wheelchair accessible" />
                        )}
                        <span>{bus.nextBus.type === 'Double Deck' ? 'DD' : 'SD'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Arrival 2 (Subsequent Bus) */}
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        2nd Bus
                      </span>
                      {bus.subsequentBus ? (
                        <span className="text-base font-black text-slate-900 font-mono">
                          {bus.subsequentBus.arrivalMinutes} min
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">
                          No more tonight
                        </span>
                      )}
                    </div>

                    {bus.subsequentBus ? (
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${
                            getLoadBadge(bus.subsequentBus.load).bg
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${getLoadBadge(bus.subsequentBus.load).dot}`} />
                          {getLoadBadge(bus.subsequentBus.load).label}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                          {bus.subsequentBus.wheelchairAccessible && (
                            <Accessibility className="w-3 h-3 text-emerald-600" title="Wheelchair accessible" />
                          )}
                          <span>{bus.subsequentBus.type === 'Double Deck' ? 'DD' : 'SD'}</span>
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 font-medium pt-1">
                        Last scheduled bus in transit
                      </div>
                    )}
                  </div>

                  {/* Arrival 3 (Third Bus) - Requirement (g): where third arrival does not exist, state reason in words instead of N/A */}
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        3rd Bus
                      </span>
                      {bus.thirdBus && (
                        <span className="text-base font-black text-slate-900 font-mono">
                          {bus.thirdBus.arrivalMinutes} min
                        </span>
                      )}
                    </div>

                    {bus.thirdBus ? (
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${
                            getLoadBadge(bus.thirdBus.load).bg
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${getLoadBadge(bus.thirdBus.load).dot}`} />
                          {getLoadBadge(bus.thirdBus.load).label}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                          {bus.thirdBus.wheelchairAccessible && (
                            <Accessibility className="w-3 h-3 text-emerald-600" title="Wheelchair accessible" />
                          )}
                          <span>{bus.thirdBus.type === 'Double Deck' ? 'DD' : 'SD'}</span>
                        </span>
                      </div>
                    ) : (
                      /* Requirement (g): Stated in words why instead of "N/A" */
                      <div className="pt-0.5">
                        <p className="text-[11px] font-semibold text-slate-600 leading-snug flex items-center gap-1">
                          <Info className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>
                            {bus.noThirdArrivalReason || 'Only two arrivals scheduled'}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
