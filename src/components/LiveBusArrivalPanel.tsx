import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Bus as BusIcon, 
  Info,
  ShieldAlert
} from 'lucide-react';

interface LiveServiceArrival {
  ServiceNo: string;
  arrivals: number[]; // e.g. [0, 14] or []
}

interface LiveApiResponse {
  BusStopCode?: string;
  services?: LiveServiceArrival[];
  error?: string;
  upstreamStatus?: number;
}

interface LiveBusArrivalPanelProps {
  currentStopCode?: string;
  onSelectStopCode?: (code: string) => void;
}

export const LiveBusArrivalPanel: React.FC<LiveBusArrivalPanelProps> = ({
  currentStopCode = '04121',
  onSelectStopCode,
}) => {
  const [stopCodeInput, setStopCodeInput] = useState<string>(currentStopCode);
  const [activeStopCode, setActiveStopCode] = useState<string>(currentStopCode);
  const [services, setServices] = useState<LiveServiceArrival[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20);
  const [healthStatus, setHealthStatus] = useState<{
    checked: boolean;
    keyConfigured?: boolean;
    ltaAnswered?: boolean;
    upstreamStatus?: number | null;
  }>({ checked: false });

  // Quick bus stop suggestions for Singapore commuters
  const quickStops = [
    { code: '04121', label: 'City Hall (04121)' },
    { code: '09048', label: 'Orchard Blvd (09048)' },
    { code: '08057', label: 'Somerset (08057)' },
    { code: '08031', label: 'Dhoby Ghaut (08031)' },
    { code: '01012', label: 'Bugis (01012)' },
  ];

  // Fetch from /api/bus (shared serverless handler)
  const fetchLiveArrivals = async (codeToFetch: string) => {
    setIsLoading(true);
    setErrorNotice(null);

    try {
      const res = await fetch(`/api/bus?BusStopCode=${encodeURIComponent(codeToFetch)}`);
      const data: LiveApiResponse = await res.json();

      if (!res.ok) {
        if (res.status === 503) {
          setErrorNotice(data.error || 'LTA_ACCOUNT_KEY is not set. Add it in Vercel and redeploy.');
        } else {
          setErrorNotice(
            data.error || `Upstream returned status ${data.upstreamStatus || res.status}.`
          );
        }
        setServices([]);
      } else {
        setServices(Array.isArray(data.services) ? data.services : []);
        setErrorNotice(null);
      }
    } catch {
      setErrorNotice('Unable to connect to local bus arrival API endpoint.');
      setServices([]);
    } finally {
      setIsLoading(false);
      setSecondsRemaining(20);
      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString('en-SG', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    }
  };

  // Check /api/health endpoint
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthStatus({
        checked: true,
        keyConfigured: data.keyConfigured,
        ltaAnswered: data.ltaAnswered,
        upstreamStatus: data.upstreamStatus,
      });
    } catch {
      setHealthStatus({ checked: true, keyConfigured: false, ltaAnswered: false });
    }
  };

  // Sync if prop changes
  useEffect(() => {
    if (currentStopCode && currentStopCode !== activeStopCode) {
      setStopCodeInput(currentStopCode);
      setActiveStopCode(currentStopCode);
    }
  }, [currentStopCode]);

  // Periodic 20s refresh timer matching LTA refresh cycle & cache
  useEffect(() => {
    fetchLiveArrivals(activeStopCode);
    checkHealth();

    const intervalTimer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          fetchLiveArrivals(activeStopCode);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalTimer);
  }, [activeStopCode]);

  const handleApplyStopCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = stopCodeInput.trim();
    if (clean) {
      setActiveStopCode(clean);
      if (onSelectStopCode) onSelectStopCode(clean);
    }
  };

  // Helper to format arrival minutes
  const renderArrivalLabel = (minutes: number | undefined, index: number) => {
    if (minutes === undefined) return null;
    
    // Showing "Arriving" under one minute (< 1 min, i.e. 0)
    const isArriving = minutes < 1;

    return (
      <div
        key={index}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black shadow-2xs ${
          isArriving
            ? 'bg-emerald-600 text-white'
            : minutes <= 3
            ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
            : 'bg-slate-100 text-slate-800 border border-slate-200'
        }`}
      >
        <Clock className={`w-3.5 h-3.5 ${isArriving ? 'text-white' : 'text-slate-500'}`} />
        <span className="font-mono">
          {isArriving ? 'Arriving' : `${minutes} min`}
        </span>
      </div>
    );
  };

  return (
    <section
      id="live-bus-arrival-panel"
      className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-5"
      aria-label="Live LTA Bus Arrival Panel"
    >
      {/* Panel Header */}
      <div className="bg-slate-900 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-tight leading-none">
                Live LTA Bus Arrivals
              </h3>
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                API Live
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time feed via <code className="text-emerald-400 font-mono text-[11px]">/api/bus</code> • 20s cycle
            </p>
          </div>
        </div>

        {/* Refresh status & manual trigger */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 font-medium block">
              Auto-refresh in <strong className="text-emerald-400 font-mono">{secondsRemaining}s</strong>
            </span>
            {lastUpdated && (
              <span className="text-[10px] text-slate-500 font-mono">
                Updated: {lastUpdated}
              </span>
            )}
          </div>
          <button
            id="panel-manual-refresh-btn"
            type="button"
            onClick={() => fetchLiveArrivals(activeStopCode)}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 hover:text-white border border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
            title="Refresh now"
            aria-label="Refresh now"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Bus Stop Selector & Quick Chips */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <form onSubmit={handleApplyStopCode} className="flex items-center gap-2 mb-2.5">
          <label htmlFor="bus-stop-code-input" className="text-xs font-bold text-slate-700 shrink-0">
            Stop Code:
          </label>
          <input
            id="bus-stop-code-input"
            type="text"
            value={stopCodeInput}
            onChange={(e) => setStopCodeInput(e.target.value)}
            placeholder="e.g. 04121"
            className="w-32 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            id="apply-stop-code-btn"
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Load
          </button>
          <span className="text-xs text-slate-500 font-medium ml-1">
            Active: <strong className="font-mono text-slate-800">{activeStopCode}</strong>
          </span>
        </form>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500">Quick stops:</span>
          {quickStops.map((item) => (
            <button
              key={item.code}
              type="button"
              id={`quick-stop-chip-${item.code}`}
              onClick={() => {
                setStopCodeInput(item.code);
                setActiveStopCode(item.code);
                if (onSelectStopCode) onSelectStopCode(item.code);
              }}
              className={`text-xs px-2 py-0.5 rounded-md font-semibold transition-colors ${
                activeStopCode === item.code
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services List or Informational Notice */}
      <div className="p-4">
        {errorNotice ? (
          <div
            id="live-panel-error-notice"
            className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-amber-950 space-y-2"
          >
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Live Feed Status
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  {errorNotice}
                </p>
              </div>
            </div>

            {/* If key is missing, explain clearly */}
            <div className="pt-2 border-t border-amber-200/80 text-[11px] text-amber-900 space-y-1">
              <p>
                <strong>Setup note:</strong> Configure <code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono text-amber-950 font-bold">LTA_ACCOUNT_KEY</code> in Vercel or environment settings to connect live arrivals directly with Singapore LTA DataMall.
              </p>
              <p className="text-amber-800">
                You can verify the backend status at anytime via <code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono">/api/health</code>.
              </p>
            </div>
          </div>
        ) : isLoading && services.length === 0 ? (
          <div className="py-8 text-center text-slate-500 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
            <p className="text-xs font-semibold">Fetching live bus arrivals for stop {activeStopCode}...</p>
          </div>
        ) : services.length === 0 ? (
          /* Empty services array treated as "no buses running", showing a plain sentence */
          <div id="no-services-running-sentence" className="py-6 px-4 bg-slate-50 rounded-xl text-center border border-slate-200">
            <p className="text-sm font-semibold text-slate-700">
              No buses currently running for bus stop {activeStopCode}.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Bus services may not be in operation at this hour or currently scheduled.
            </p>
          </div>
        ) : (
          <div id="live-services-grid" className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-100">
              <span>Service</span>
              <span>Next 2 Arrivals</span>
            </div>

            {services.map((service) => {
              const hasNoBuses = !service.arrivals || service.arrivals.length === 0;

              return (
                <div
                  key={service.ServiceNo}
                  id={`live-service-row-${service.ServiceNo}`}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/80"
                >
                  {/* Service Number Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      id={`live-service-no-${service.ServiceNo}`}
                      className="px-3 py-1 bg-white border border-slate-300 font-mono text-base font-black text-slate-950 rounded-lg shadow-2xs min-w-[52px] text-center"
                    >
                      {service.ServiceNo}
                    </span>
                  </div>

                  {/* Next two arrivals or Plain Sentence when a service has no buses running */}
                  <div className="flex items-center gap-2 justify-end">
                    {hasNoBuses ? (
                      <span
                        id={`no-buses-running-service-${service.ServiceNo}`}
                        className="text-xs text-slate-500 italic font-medium"
                      >
                        No buses currently running for this service.
                      </span>
                    ) : (
                      <>
                        {service.arrivals.slice(0, 2).map((min, idx) =>
                          renderArrivalLabel(min, idx)
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with service check link */}
      {healthStatus.checked && (
        <div className="px-4 py-2 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Backend Health check:</span>
          <span className="font-mono">
            Key: {healthStatus.keyConfigured ? 'Configured' : 'Not set'} • Upstream: {healthStatus.upstreamStatus ?? 'N/A'}
          </span>
        </div>
      )}
    </section>
  );
};
