export type IncidentSeverity = 'moderate' | 'heavy' | 'critical';

export interface TrafficIncident {
  id: string;
  location: string;
  type: 'Accident' | 'Heavy Traffic' | 'Road Works' | 'Vehicle Breakdown' | 'Lane Closure';
  impactDescription: string;
  affectedBuses: string[];
  delayMinutes: number;
  reportedTimeAgo: string;
  advice?: string;
  lanesAffected?: string;
  estimatedClearance?: string;
  source?: string;
}

export interface BusArrivalInfo {
  busNumber: string;
  destination: string;
  isDelayed: boolean;
  delayReason?: string;
  delayMinutes?: number;
  nextBus: {
    arrivalMinutes: number; // 0 = Arr
    load: 'Seats Available' | 'Standing Available' | 'Limited Standing';
    type: 'Single Deck' | 'Double Deck';
    wheelchairAccessible: boolean;
  };
  subsequentBus?: {
    arrivalMinutes: number;
    load: 'Seats Available' | 'Standing Available' | 'Limited Standing';
    type: 'Single Deck' | 'Double Deck';
  };
  thirdBus?: {
    arrivalMinutes: number;
    load: 'Seats Available' | 'Standing Available' | 'Limited Standing';
    type: 'Single Deck' | 'Double Deck';
  };
}

export interface BusStop {
  id: string;
  code: string; // 5-digit code e.g. "09048"
  name: string;
  road: string;
  distanceMeters: number;
  walkingTimeMins: number;
  busServices: string[];
  buses: BusArrivalInfo[];
}
