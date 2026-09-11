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
          icon: <AlertCircle className="w-4 h-4 text-rose-600" />,
          accentBorder: 'border-rose-400',
        };
      case 'Heavy Traffic':
        return {
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          accentBorder: 'border-amber-400',
        };
      case 'Road Works':
        return {
          badgeBg: 'bg-orange-100 text-orange-900 border-orange-200',
          icon: <Construction className="w-4 h-4 text-orange-600" />,
          accentBorder: 'border-orange-400',
        };
      case 'Vehicle Breakdown':
        return {
          badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-200',
          icon: <Wrench className="w-4 h-4 text-yellow-700" />,
          accentBorder: 'border-yellow-400',
        };
      default:
        return {
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: <AlertCircle className="w-4 h-4 text-slate-600" />,
          accentBorder: 'border-slate-300',
        };
    }
  };

  if (!currentIncident) return null;

  const theme = getIncidentTheme(currentIncident.type);

  return (
    <section
      id="traffic-incidents-carousel-section"
      className="bg-amber-50/70 border-b border-amber-200/80 px-4 py-3"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
      aria-roledescription="carousel"
      aria-label="Latest Traffic Incidents in Singapore"
    >
      <div className="max-w-xl mx-auto">
        {/* Header line of carousel */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-900">
              Traffic Advisory ({currentIndex + 1}/{total})
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="carousel-play-pause-toggle"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-amber-100/70 transition-colors"
              title={isAutoPlaying ? 'Pause rotation' : 'Resume rotation'}
              aria-label={isAutoPlaying ? 'Pause rotation' : 'Resume rotation'}
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              id="carousel-prev-button"
              onClick={handlePrev}
              className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-amber-100/70 active:bg-amber-200/70 transition-colors"
              aria-label="Previous incident"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="carousel-next-button"
              onClick={handleNext}
              className="p-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-amber-100/70 active:bg-amber-200/70 transition-colors"
              aria-label="Next incident"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Incident Card */}
        <div
          id={`incident-slide-${currentIncident.id}`}
          className={`bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 transition-all`}
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                id={`incident-badge-${currentIncident.id}`}
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${theme.badgeBg}`}
              >
                {theme.icon}
                <span>{currentIncident.type}</span>
              </span>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                +{currentIncident.delayMinutes}m delay
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium whitespace-nowrap">
              <Clock className="w-3 h-3" />
              <span>{currentIncident.reportedTimeAgo}</span>
            </div>
          </div>

          <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">
            {currentIncident.location}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
            {currentIncident.impactDescription}
          </p>

          {/* Affected bus lines */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500">
              Affected buses:
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {currentIncident.affectedBuses.map((busNo) => (
                <span
                  key={busNo}
                  id={`incident-bus-tag-${busNo}`}
                  className="px-2 py-0.5 bg-amber-500/15 border border-amber-400/50 text-amber-950 font-bold text-xs rounded-md"
                >
                  {busNo}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Carousel indicator dots */}
        <div
          id="carousel-indicator-dots"
          className="flex items-center justify-center gap-1.5 mt-2.5"
        >
          {incidents.map((inc, index) => (
            <button
              key={inc.id}
              id={`carousel-dot-${index}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Jump to incident ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-6 bg-amber-600'
                  : 'w-1.5 bg-amber-300 hover:bg-amber-400'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
