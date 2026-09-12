import React, { useState, useEffect, useRef } from 'react';
import { TrafficIncident } from '../types';
import { 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Construction, 
  Wrench, 
  Clock, 
  Pause, 
  Play 
} from 'lucide-react';

interface IncidentCarouselProps {
  incidents: TrafficIncident[];
}

export const IncidentCarousel: React.FC<IncidentCarouselProps> = ({ incidents }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const total = incidents.length;

  useEffect(() => {
    if (isAutoPlaying && total > 0) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % total);
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, total]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const currentIncident = incidents[currentIndex];

  const getIncidentTheme = (type: TrafficIncident['type']) => {
    switch (type) {
      case 'Accident':
        return {
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" />,
          accentBorder: 'border-rose-400',
        };
      case 'Heavy Traffic':
        return {
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
          accentBorder: 'border-amber-400',
        };
      case 'Road Works':
        return {
          badgeBg: 'bg-orange-100 text-orange-900 border-orange-200',
          icon: <Construction className="w-3.5 h-3.5 text-orange-600" />,
          accentBorder: 'border-orange-400',
        };
      case 'Vehicle Breakdown':
        return {
          badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-200',
          icon: <Wrench className="w-3.5 h-3.5 text-yellow-700" />,
          accentBorder: 'border-yellow-400',
        };
      default:
        return {
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: <AlertCircle className="w-3.5 h-3.5 text-slate-600" />,
          accentBorder: 'border-slate-300',
        };
    }
  };

  if (!currentIncident) return null;

  const theme = getIncidentTheme(currentIncident.type);

  return (
    <section
      id="traffic-incidents-carousel-section"
      className="bg-amber-50/70 border-b border-amber-200/70 px-3 py-1.5"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      aria-roledescription="carousel"
      aria-label="Latest Traffic Incidents in Singapore"
    >
      <div className="max-w-xl mx-auto">
        {/* Header line of carousel - slim and sleek */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
              Traffic Advisory ({currentIndex + 1}/{total})
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              id="carousel-play-pause-toggle"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-amber-100/70 transition-colors"
              title={isAutoPlaying ? 'Pause rotation' : 'Resume rotation'}
              aria-label={isAutoPlaying ? 'Pause rotation' : 'Resume rotation'}
            >
              {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              id="carousel-prev-button"
              onClick={handlePrev}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-amber-100/70 active:bg-amber-200/70 transition-colors"
              aria-label="Previous incident"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              id="carousel-next-button"
              onClick={handleNext}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-amber-100/70 active:bg-amber-200/70 transition-colors"
              aria-label="Next incident"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Incident Card - low profile, thin & compact */}
        <div
          id={`incident-slide-${currentIncident.id}`}
          className="bg-white rounded-lg px-2.5 py-2 shadow-2xs border border-slate-200 transition-all space-y-1"
        >
          {/* Top row: Type badge, Delay, Location & Time */}
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
              <span
                id={`incident-badge-${currentIncident.id}`}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 ${theme.badgeBg}`}
              >
                {theme.icon}
                <span>{currentIncident.type}</span>
              </span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded border border-rose-200 shrink-0">
                +{currentIncident.delayMinutes}m
              </span>
              <h3 className="text-xs font-bold text-slate-900 truncate">
                {currentIncident.location}
              </h3>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium whitespace-nowrap shrink-0">
              <Clock className="w-2.5 h-2.5" />
              <span>{currentIncident.reportedTimeAgo}</span>
            </div>
          </div>

          {/* Bottom row: Impact description & affected buses */}
          <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100/90">
            <p className="text-[11px] text-slate-600 truncate flex-1">
              {currentIncident.impactDescription}
            </p>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-medium text-slate-400">Buses:</span>
              <div className="flex items-center gap-1">
                {currentIncident.affectedBuses.map((busNo) => (
                  <span
                    key={busNo}
                    id={`incident-bus-tag-${busNo}`}
                    className="px-1.5 py-0.5 bg-amber-500/15 border border-amber-400/50 text-amber-950 font-bold text-[10px] rounded leading-none"
                  >
                    {busNo}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Carousel indicator dots - thin & subtle */}
        <div
          id="carousel-indicator-dots"
          className="flex items-center justify-center gap-1 mt-1.5"
        >
          {incidents.map((inc, index) => (
            <button
              key={inc.id}
              id={`carousel-dot-${index}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Jump to incident ${index + 1}`}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-4 bg-amber-600'
                  : 'w-1 bg-amber-300 hover:bg-amber-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
