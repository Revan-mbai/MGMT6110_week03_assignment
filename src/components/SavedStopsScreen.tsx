import React, { useState } from 'react';
import { BusStop } from '../types';
import { 
  Star, 
  MapPin, 
  ArrowRight, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Trash2,
  BookmarkCheck
} from 'lucide-react';

interface SavedStopsScreenProps {
  allBusStops: BusStop[];
  savedStopCodes: string[];
  onToggleSaveStop: (code: string) => void;
  onSelectStop: (stop: BusStop) => void;
  onGoToFindStops: () => void;
}

export const SavedStopsScreen: React.FC<SavedStopsScreenProps> = ({
  allBusStops,
  savedStopCodes,
  onToggleSaveStop,
  onSelectStop,
  onGoToFindStops,
}) => {
  const [showAllSaved, setShowAllSaved] = useState(false);

  // Resolve saved stops from the centralized allBusStops array
  const savedStops: BusStop[] = savedStopCodes
    .map((code) => allBusStops.find((s) => s.code === code))
    .filter((stop): stop is BusStop => Boolean(stop));

  // Limit to 5 stops with show more / show less as per previous design criteria
  const displayedSavedStops = showAllSaved ? savedStops : savedStops.slice(0, 5);

  return (
    <section id="saved-stops-screen" className="max-w-xl mx-auto px-4 py-4 space-y-4">
      {/* Requirement (c): One line stating what this screen is for and what to give it */}
      <div id="screen-purpose-line" className="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-emerald-900 leading-snug">
        Save your regular bus stops for quick one-tap access to live arrival times and alerts.
      </div>

      {/* Screen Title & Guidance Text */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>Saved Stops</span>
          </h2>
          {/* Preserved guidance text on saved-stops screen that classmates praised */}
          <p id="saved-stops-guidance-text" className="text-xs text-slate-500 font-medium mt-0.5">
            Tap any saved stop to check its next arrivals. Tap the star to remove a stop in one tap.
          </p>
        </div>

        <span
          id="saved-stops-count-badge"
          className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300"
        >
          {savedStops.length} saved
        </span>
      </div>

      {/* Empty State */}
      {savedStops.length === 0 ? (
        <div
          id="saved-stops-empty-state"
          className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-3 shadow-2xs"
        >
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-500">
            <Star className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              No saved bus stops yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              When viewing any stop in &ldquo;Find a Stop&rdquo; or &ldquo;This Stop&rdquo;, tap the star icon to save it here for fast one-tap checking anytime you commute.
            </p>
          </div>
          <button
            id="empty-state-find-stops-btn"
            type="button"
            onClick={onGoToFindStops}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl transition-colors shadow-2xs"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Find a Stop Now</span>
          </button>
        </div>
      ) : (
        /* Saved Stops List */
        <div className="space-y-2.5">
          <div id="saved-stops-list" className="space-y-2">
            {displayedSavedStops.map((stop) => {
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
                    {stop.busServices && stop.busServices.length > 0 ? (
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
                    ) : (
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Services:
                        </span>
                        <span className="text-xs text-slate-400 italic">
                          Not known
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {/* Requirement (f): Save/unsave control identical to other screens; unsaves in one tap */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSaveStop(stop.code);
                      }}
                      className="p-1.5 rounded-lg border bg-amber-50 border-amber-300 text-amber-500 fill-amber-400 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-500 hover:fill-rose-400 transition-all"
                      title="Remove from saved stops"
                      aria-label={`Unsave ${stop.name}`}
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    </button>

                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform mt-2">
                      Arrivals <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show More / Show Less Controls (5 stops limit as requested) */}
          {savedStops.length > 5 && (
            <div className="pt-1 text-center">
              {showAllSaved ? (
                <button
                  id="show-less-saved-btn"
                  type="button"
                  onClick={() => setShowAllSaved(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg shadow-2xs transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                  <span>Show less (display top 5)</span>
                </button>
              ) : (
                <button
                  id="show-more-saved-btn"
                  type="button"
                  onClick={() => setShowAllSaved(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg shadow-2xs transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                  <span>Show all {savedStops.length} saved stops</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
