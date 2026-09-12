import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Play,
  X,
  MapPin,
  Info,
  Navigation
} from 'lucide-react';

interface IncidentCarouselProps {
  incidents: TrafficIncident[];
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

export const IncidentCarousel: React.FC<IncidentCarouselProps> = ({ incidents }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [liveOffset, setLiveOffset] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<TrafficIncident | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Swipe & Click-and-Drag gesture detection state
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef<boolean>(false);
  const hasMoved = useRef<boolean>(false);

  const total = incidents.length;

  useEffect(() => {
    // Only auto-play if user is not viewing details modal and not dragging
    if (isAutoPlaying && total > 0 && !selectedIncident) {
      timerRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % total);
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, total, selectedIncident]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedIncident) {
        setSelectedIncident(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIncident]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  // Window-level mouse listeners for rock-solid desktop click-and-drag across entire screen
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || dragStartX.current === null) return;
      const deltaX = e.clientX - dragStartX.current;
      if (Math.abs(deltaX) > 6) {
        hasMoved.current = true;
        setLiveOffset(deltaX);
      }
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
      if (isDragging.current && dragStartX.current !== null) {
        const deltaX = e.clientX - dragStartX.current;
        const deltaY = e.clientY - (dragStartY.current ?? e.clientY);

        // Threshold of 25px horizontal drag
        if (Math.abs(deltaX) > 25 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) {
            handleNext();
          } else {
            handlePrev();
          }
        }
      }
      isDragging.current = false;
      dragStartX.current = null;
      dragStartY.current = null;
      setLiveOffset(0);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [total]);

  // Mouse drag handlers on the card
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only primary left button
    if (e.button !== 0) return;
    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    isDragging.current = true;
    hasMoved.current = false;
    setLiveOffset(0);
  };

  // Touch swipe handlers for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartX.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
    hasMoved.current = false;
    setLiveOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartX.current === null) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - dragStartX.current;
    if (Math.abs(deltaX) > 6) {
      hasMoved.current = true;
      setLiveOffset(deltaX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartX.current !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - dragStartX.current;
      const deltaY = touchEndY - (dragStartY.current ?? touchEndY);

      if (Math.abs(deltaX) > 25 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    dragStartX.current = null;
    dragStartY.current = null;
    setLiveOffset(0);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (!hasMoved.current) {
      setSelectedIncident(currentIncident);
    }
    hasMoved.current = false;
  };

  const currentIncident = incidents[currentIndex];

  const getIncidentTheme = (type: TrafficIncident['type']) => {
    switch (type) {
      case 'Accident':
        return {
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" />,
          accentBorder: 'border-rose-400',
          cardBg: 'bg-rose-50/40',
        };
      case 'Heavy Traffic':
        return {
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-200',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
          accentBorder: 'border-amber-400',
          cardBg: 'bg-amber-50/40',
        };
      case 'Road Works':
        return {
          badgeBg: 'bg-orange-100 text-orange-900 border-orange-200',
          icon: <Construction className="w-3.5 h-3.5 text-orange-600" />,
          accentBorder: 'border-orange-400',
          cardBg: 'bg-orange-50/40',
        };
      case 'Vehicle Breakdown':
        return {
          badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-200',
          icon: <Wrench className="w-3.5 h-3.5 text-yellow-700" />,
          accentBorder: 'border-yellow-400',
          cardBg: 'bg-yellow-50/40',
        };
      default:
        return {
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: <AlertCircle className="w-3.5 h-3.5 text-slate-600" />,
          accentBorder: 'border-slate-300',
          cardBg: 'bg-slate-50/40',
        };
    }
  };

  if (!currentIncident) return null;

  const theme = getIncidentTheme(currentIncident.type);
  const modalTheme = selectedIncident ? getIncidentTheme(selectedIncident.type) : null;

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
            <span className="text-[10px] text-amber-700/80 font-normal hidden sm:inline">
              • Swipe to browse advisories
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
          </div>
        </div>

        {/* Incident Card Container with sliding animation & live drag/swipe */}
        <div
          id="incident-card-slider"
          role="button"
          tabIndex={0}
          onDragStart={(e) => e.preventDefault()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onClick={handleCardClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedIncident(currentIncident);
            }
          }}
          title="Swipe or drag to browse, click to read detailed traffic advisory"
          className="relative overflow-hidden bg-white rounded-lg shadow-2xs border border-slate-200 hover:border-amber-400 hover:shadow-xs transition-colors cursor-grab active:cursor-grabbing group text-left block w-full focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 touch-pan-y select-none"
        >
          <div
            className="w-full"
            style={{
              transform: liveOffset !== 0 ? `translateX(${liveOffset}px)` : undefined,
              transition: isDragging.current ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentIncident.id}
                id={`incident-slide-${currentIncident.id}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.15 },
                }}
                className="px-2.5 py-2 space-y-1 w-full bg-white"
              >
                {/* Top row: Type badge, Delay, Location, Read more cue & Time */}
                <div className="flex items-center justify-between gap-1.5 min-w-0 pointer-events-none">
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
                    <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-900 transition-colors">
                      {currentIncident.location}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium whitespace-nowrap shrink-0">
                    <span className="text-amber-700 font-semibold group-hover:underline hidden xs:inline">
                      Details
                    </span>
                    <Clock className="w-2.5 h-2.5 ml-1" />
                    <span>{currentIncident.reportedTimeAgo}</span>
                  </div>
                </div>

                {/* Bottom row: Impact description & affected buses */}
                <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100/90 pointer-events-none">
                  <p className="text-[11px] text-slate-600 truncate flex-1 group-hover:text-slate-900 transition-colors">
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
              </motion.div>
            </AnimatePresence>
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
              onClick={() => {
                setDirection(index >= currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
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

      {/* Traffic Advisory Detailed Read-More Modal */}
      {selectedIncident && modalTheme && (
        <div
          id="traffic-advisory-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSelectedIncident(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="traffic-modal-title"
        >
          <div
            id="traffic-advisory-modal-content"
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-4 pb-3 border-b border-slate-100 bg-amber-50/50">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${modalTheme.badgeBg}`}>
                  {modalTheme.icon}
                  <span>{selectedIncident.type}</span>
                </span>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
                  +{selectedIncident.delayMinutes} min delay
                </span>
              </div>
              <button
                type="button"
                id="close-traffic-modal-btn"
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close traffic advisory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              {/* Incident Location */}
              <div>
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Location</span>
                </div>
                <h2 id="traffic-modal-title" className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {selectedIncident.location}
                </h2>
                {selectedIncident.lanesAffected && (
                  <p className="text-xs text-slate-600 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                    <strong className="text-slate-700 font-semibold">Lanes Impacted: </strong>
                    {selectedIncident.lanesAffected}
                  </p>
                )}
              </div>

              {/* Traffic Impact Description */}
              <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  <span>Traffic Conditions & Impact</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedIncident.impactDescription}
                </p>
              </div>

              {/* Commuter Guidance / Advisory Recommendation */}
              {selectedIncident.advice && (
                <div className="bg-amber-50/80 rounded-xl p-3.5 border border-amber-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                    <Navigation className="w-3.5 h-3.5 text-amber-700" />
                    <span>Travel Recommendation & Detour</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
                    {selectedIncident.advice}
                  </p>
                </div>
              )}

              {/* Affected Bus Services */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>Affected Bus Services</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    Delays expected on routes
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedIncident.affectedBuses.map((busNo) => (
                    <div
                      key={busNo}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300/80 text-amber-950 font-bold text-sm rounded-lg"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      <span>Bus {busNo}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata: Reported time, Estimated Clearance, Data Source */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Reported: {selectedIncident.reportedTimeAgo}</span>
                  </span>
                  {selectedIncident.estimatedClearance && (
                    <span className="font-medium text-slate-700">
                      Est. Clearance: {selectedIncident.estimatedClearance}
                    </span>
                  )}
                </div>
                {selectedIncident.source && (
                  <p className="text-[11px] text-slate-400">
                    Source: {selectedIncident.source}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer with Previous / Next / Close */}
            <div className="p-3 sm:px-5 sm:py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="modal-prev-incident-btn"
                  onClick={() => {
                    const nextIdx = (currentIndex - 1 + total) % total;
                    setCurrentIndex(nextIdx);
                    setSelectedIncident(incidents[nextIdx]);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  id="modal-next-incident-btn"
                  onClick={() => {
                    const nextIdx = (currentIndex + 1) % total;
                    setCurrentIndex(nextIdx);
                    setSelectedIncident(incidents[nextIdx]);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 flex items-center gap-1 transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                id="modal-dismiss-btn"
                onClick={() => setSelectedIncident(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
