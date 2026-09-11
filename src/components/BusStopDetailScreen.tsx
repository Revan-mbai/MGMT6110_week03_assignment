import React, { useState, useEffect } from 'react';
import { BusStop, BusArrivalInfo } from '../types';
import {
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  MapPin,
  Clock,
  Accessibility,
  CheckCircle2,
  Users,
  Bus as BusIcon,
} from 'lucide-react';

interface BusStopDetailScreenProps {
  selectedStop: BusStop;
  onBack: () => void;
}

export const BusStopDetailScreen: React.FC<BusStopDetailScreenProps> = ({
  selectedStop,
  onBack,
}) => {
  // Live arrival simulation state
  const [busesData, setBusesData] = useState<BusArrivalInfo[]>(selectedStop.buses);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState<number>(15);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('Just now');

  // Periodic real-time countdown
  useEffect(() => {
    setBusesData(selectedStop.buses);
    setSecondsUntilRefresh(15);
  }, [selectedStop]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          // Trigger simulated real-time update
          simulateArrivalTick();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update arrival times slightly to reflect live traffic conditions
  const simulateArrivalTick = () => {
    setIsRefreshing(true);
    setBusesData((current) =>
      current.map((bus) => {
        // Countdown next bus if > 0, or reset when arrived
        let nextMinutes = bus.nextBus.arrivalMinutes;
        if (nextMinutes > 0) {
          // Occasionally decrement
          nextMinutes = Math.max(0, nextMinutes - 1);
        } else {
          // If it was "Arr", reset to subsequent bus minutes
          nextMinutes = bus.subsequentBus ? Math.max(1, bus.subsequentBus.arrivalMinutes - 1) : 8;
        }

        return {
          ...bus,
          nextBus: {
            ...bus.nextBus,
            arrivalMinutes: nextMinutes,
          },
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
    }, 600);
  };

  const handleManualRefresh = () => {
    simulateArrivalTick();
    setSecondsUntilRefresh(15);
  };

  // Helper for load/capacity badge styling
  const getLoadBadge = (load: string) => {
    switch (load) {
      case 'Seats Available':
        return {
          text: 'Seats Avail',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
        };
      case 'Standing Available':
        return {
          text: 'Standing Only',
          color: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
        };
      case 'Limited Standing':
        return {
          text: 'Limited Space',
          color: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
        };
      default:
        return {
          text: 'Normal',
          color: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-400',
        };
    }
  };

  return (
    <main
      id="bus-stop-detail-screen"
      className="max-w-xl mx-auto px-4 py-4 space-y-4"
    >
      {/* Top navigation row */}
      <div className="flex items-center justify-between">
        <button
          id="detail-back-button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-300 shadow-xs text-slate-800 hover:bg-slate-50 active:bg-slate-100 font-bold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600" />
          <span>All Bus Stops</span>
        </button>

        {/* Live countdown & refresh control */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Auto-updates in {secondsUntilRefresh}s
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Refreshed: {lastRefreshedTime}
            </span>
          </div>
          <button
            id="manual-refresh-button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`p-2.5 rounded-xl bg-white border border-slate-300 shadow-xs text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isRefreshing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            title="Refresh real-time arrivals now"
            aria-label="Refresh real-time arrivals now"
          >
            <RefreshCw
              className={`w-4 h-4 text-emerald-600 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Selected Bus Stop Header Banner */}
      <section
        id="selected-stop-banner"
        className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                id="selected-stop-code-badge"
                className="font-mono text-xs font-black tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md"
              >
                {selectedStop.code}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {selectedStop.road}
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-xs text-slate-400">
                {selectedStop.distanceMeters}m away
              </span>
            </div>
            <h2
              id="selected-stop-name"
              className="text-lg font-black text-white leading-snug tracking-tight"
            >
              {selectedStop.name}
            </h2>
          </div>
        </div>
      </section>

      {/* Real-time Buses List */}
      <section id="bus-arrivals-section" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider">
            Available Buses ({busesData.length})
          </h3>
          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Live arrival tracking active
          </span>
        </div>

        <div className="space-y-3">
          {busesData.map((bus) => {
            const nextLoad = getLoadBadge(bus.nextBus.load);
            const isArr = bus.nextBus.arrivalMinutes === 0;

            return (
              <div
                key={bus.busNumber}
                id={`bus-arrival-card-${bus.busNumber}`}
                className={`bg-white rounded-2xl p-4 shadow-sm border transition-all ${
                  bus.isDelayed
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-slate-200'
                }`}
              >
                {/* Header Row: Bus Number + WARNING LABEL (Beside Bus Number) */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Bus Number - Very Large and Readable at phone arm's length */}
                    <span
                      id={`bus-number-display-${bus.busNumber}`}
                      className="text-3xl font-black tracking-tight text-slate-950 font-mono bg-slate-100 px-3 py-1 rounded-xl border border-slate-300 shadow-2xs"
                    >
                      {bus.busNumber}
                    </span>

                    {/* MANDATORY WARNING LABEL: Appears BESIDE the bus number when delayed */}
                    {bus.isDelayed ? (
                      <div
                        id={`bus-delay-warning-badge-${bus.busNumber}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs border border-amber-600 shadow-xs animate-pulse"
                        role="alert"
                        aria-label={`Bus ${bus.busNumber} delayed warning`}
                      >
                        <AlertTriangle className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                        <span>DELAYED {bus.delayMinutes ? `(+${bus.delayMinutes}m)` : ''}</span>
                        {bus.delayReason && (
                          <span className="hidden sm:inline font-bold opacity-90">
                            • {bus.delayReason}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        On Schedule
                      </span>
                    )}
                  </div>

                  {/* Accessibility & Deck type */}
                  <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {bus.nextBus.type === 'Double Deck' ? 'Double Deck' : 'Single Deck'}
                    </span>
                    {bus.nextBus.wheelchairAccessible && (
                      <span
                        title="Wheelchair Accessible"
                        aria-label="Wheelchair Accessible"
                        className="p-1 rounded bg-slate-100 text-slate-600"
                      >
                        <Accessibility className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Destination Line */}
                <p className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1">
                  <span className="text-slate-400">To:</span>
                  <span className="text-slate-800 font-bold">{bus.destination}</span>
                </p>

                {/* Delay reason callout if delayed */}
                {bus.isDelayed && (
                  <div
                    id={`delay-explanation-${bus.busNumber}`}
                    className="mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Heavy Traffic Notice: </span>
                      <span>
                        Bus {bus.busNumber} is experiencing delays due to{' '}
                        <strong>{bus.delayReason || 'incident along route'}</strong>. Arrival
                        times include congestion adjustments.
                      </span>
                    </div>
                  </div>
                )}

                {/* Arrival Times Row (Next Bus, 2nd Bus, 3rd Bus) */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  {/* Next Bus (Primary Large Box) */}
                  <div
                    id={`bus-${bus.busNumber}-next-arrival`}
                    className={`rounded-xl p-2.5 text-center flex flex-col items-center justify-center ${
                      isArr
                        ? 'bg-emerald-600 text-white'
                        : bus.nextBus.arrivalMinutes <= 3
                        ? 'bg-emerald-100/90 text-emerald-950 border border-emerald-300'
                        : 'bg-slate-100 text-slate-900 border border-slate-200'
                    }`}
                  >
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        isArr ? 'text-emerald-100' : 'text-slate-500'
                      }`}
                    >
                      Next Bus
                    </span>
                    <div className="my-0.5">
                      <span
                        className={`font-black font-mono tracking-tight ${
                          isArr ? 'text-2xl text-white' : 'text-2xl text-slate-950'
                        }`}
                      >
                        {isArr ? 'Arr' : `${bus.nextBus.arrivalMinutes}`}
                      </span>
                      {!isArr && (
                        <span className="text-xs font-bold text-slate-600 ml-0.5">
                          min
                        </span>
                      )}
                    </div>
                    {/* Load badge */}
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isArr
                          ? 'bg-white/20 text-white'
                          : `${nextLoad.color} border`
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isArr ? 'bg-white' : nextLoad.dot}`} />
                      <span>{nextLoad.text}</span>
                    </span>
                  </div>

                  {/* 2nd Bus */}
                  <div
                    id={`bus-${bus.busNumber}-second-arrival`}
                    className="rounded-xl p-2.5 text-center flex flex-col items-center justify-center bg-slate-50 border border-slate-200"
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      2nd Bus
                    </span>
                    <div className="my-0.5">
                      {bus.subsequentBus ? (
                        <>
                          <span className="text-xl font-black font-mono text-slate-800">
                            {bus.subsequentBus.arrivalMinutes}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 ml-0.5">
                            min
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">N/A</span>
                      )}
                    </div>
                    {bus.subsequentBus && (
                      <span className="text-[10px] font-medium text-slate-500">
                        {bus.subsequentBus.load === 'Seats Available'
                          ? 'Seats'
                          : 'Standing'}
                      </span>
                    )}
                  </div>

                  {/* 3rd Bus */}
                  <div
                    id={`bus-${bus.busNumber}-third-arrival`}
                    className="rounded-xl p-2.5 text-center flex flex-col items-center justify-center bg-slate-50 border border-slate-200"
                  >
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      3rd Bus
                    </span>
                    <div className="my-0.5">
                      {bus.thirdBus ? (
                        <>
                          <span className="text-xl font-black font-mono text-slate-800">
                            {bus.thirdBus.arrivalMinutes}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 ml-0.5">
                            min
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">N/A</span>
                      )}
                    </div>
                    {bus.thirdBus && (
                      <span className="text-[10px] font-medium text-slate-500">
                        {bus.thirdBus.load === 'Seats Available'
                          ? 'Seats'
                          : 'Standing'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};
