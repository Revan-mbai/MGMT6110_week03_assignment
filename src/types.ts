export type IncidentSeverity = 'moderate' | 'heavy' | 'critical';

export interface TrafficIncident {
  id: string;
  location: string;
  type: 'Accident' | 'Heavy Traffic' | 'Road Works' | 'Vehicle Breakdown' | 'Lane Closure';
  impactDescription: string;
  affectedBuses: string[];
  delayMinutes: number;
  issuedTime: string;
  reportedTimeAgo: string;
  lastCheckedTime?: string;
  advice?: string;
  lanesAffected?: string;
  estimatedClearance?: string;
  source?: string;
  isExampleData: boolean;
}

export interface BusArrivalPrediction {
  arrivalMinutes: number; // 0 means "Arr"
  load: 'Seats Available' | 'Standing Available' | 'Limited Standing';
  type: 'Single Deck' | 'Double Deck';
  wheelchairAccessible: boolean;
}

export interface BusArrivalInfo {
  busNumber: string;
  destination: string;
  isDelayed: boolean;
  delayReason?: string;
  delayMinutes?: number;
  nextBus: BusArrivalPrediction;
  subsequentBus?: BusArrivalPrediction;
  thirdBus?: BusArrivalPrediction;
  noThirdArrivalReason?: string; // Stated in words when third arrival does not exist, e.g. "Only two arrivals scheduled" or "No more buses tonight"
}

export interface BusStop {
  id: string;
  code: string; // 5-digit code e.g. "09048"
  name: string;
  road: string;
  postalCode: string; // 6-digit Singapore postal code e.g. "248649"
  latitude: number;
  longitude: number;
  distanceMeters?: number;
  walkingTimeMins?: number;
  busServices: string[];
  buses: BusArrivalInfo[];
}
