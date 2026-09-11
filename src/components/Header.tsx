import React, { useState, useEffect } from 'react';
import { Bus, ArrowLeft, Radio } from 'lucide-react';

interface HeaderProps {
  currentScreen: 'stops' | 'arrivals';
  selectedStopName?: string;
  onBackToStops: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onBackToStops,
}) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-SG', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      id="app-main-header"
      className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800"
    >
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentScreen === 'arrivals' ? (
            <button
              id="header-back-button"
              onClick={onBackToStops}
              className="flex items-center gap-1.5 px-3 py-2 -ml-1 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-100 transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              aria-label="Back to nearby stops"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-400" />
              <span>Back</span>
            </button>
          ) : (
            <div
              id="header-logo-container"
              className="flex items-center gap-2.5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-inner">
                <Bus className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-white leading-tight">
                  SG Bus Tracker
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Live Arrival & Traffic Feed
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Live indicator & Clock */}
        <div
          id="header-live-status-pill"
          className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-full px-3 py-1.5"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-emerald-400 tracking-wider">
            LIVE
          </span>
          <span className="text-slate-500 text-xs">|</span>
          <span className="text-xs font-mono text-slate-200 tabular-nums font-semibold">
            {timeString || '12:00:00'}
          </span>
        </div>
      </div>
    </header>
  );
};
