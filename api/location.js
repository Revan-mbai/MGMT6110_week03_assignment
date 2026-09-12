/**
 * Serverless function for User Live Location & Proximity Bus Stops
 * Form (a): Standalone file at api/location.js for Vercel
 * Form (b): Imported by server.ts for local dev and Cloud Run
 *
 * Accepts query parameters:
 *   - lat / latitude: User's current latitude (defaults to Singapore central: 1.3025)
 *   - lng / lon / longitude: User's current longitude (defaults to Singapore central: 103.8250)
 *   - limit: Number of nearest bus stops to return (default: 5, max: 10)
 *   - includeArrivals: Whether to fetch live arrival predictions for closest stop (default: true)
 */

// Singapore bus stop registry with GPS coordinates and available services
const SINGAPORE_BUS_STOPS = [
  {
    code: '09048',
    name: 'Opp Orchard Boulevard Stn',
    road: 'Orchard Blvd, Singapore 248649',
    lat: 1.3023,
    lng: 103.8242,
    services: ['14', '65', '106', '111', '174'],
  },
  {
    code: '08057',
    name: 'Somerset Station Gate B',
    road: 'Somerset Rd, Singapore 238162',
    lat: 1.3006,
    lng: 103.8378,
    services: ['7', '14', '16', '65', '106', '111', '123', '175'],
  },
  {
    code: '08031',
    name: 'Dhoby Ghaut Station Plaza',
    road: 'Orchard Rd, Singapore 238826',
    lat: 1.2988,
    lng: 103.8458,
    services: ['7', '14', '16', '36', '65', '77', '106', '111', '124', '167', '174', '190'],
  },
  {
    code: '04121',
    name: 'Opp City Hall Complex',
    road: 'North Bridge Rd, Singapore 179098',
    lat: 1.2931,
    lng: 103.8519,
    services: ['32', '51', '61', '63', '80', '124', '145', '166', '174', '197'],
  },
  {
    code: '01012',
    name: 'Bugis Junction North',
    road: 'Victoria St, Singapore 188067',
    lat: 1.3005,
    lng: 103.8560,
    services: ['2', '12', '33', '130', '133', '960'],
  },
  {
    code: '02049',
    name: 'Suntec City / Promenade Stn',
    road: 'Temasek Blvd, Singapore 038983',
    lat: 1.2952,
    lng: 103.8596,
    services: ['36', '70M', '97', '106', '111', '133', '502', '518'],
  },
  {
    code: '03019',
    name: 'Raffles Place Promenade',
    road: 'Collyer Quay, Singapore 049318',
    lat: 1.2847,
    lng: 103.8532,
    services: ['10', '57', '70', '100', '107', '130', '131', '167', '196'],
  },
  {
    code: '10169',
    name: 'HarbourFront Stn / Vivocity',
    road: 'Telok Blangah Rd, Singapore 099419',
    lat: 1.2644,
    lng: 103.8222,
    services: ['10', '30', '57', '61', '97', '100', '131', '143', '166'],
  },
  {
    code: '11111',
    name: 'Queensway Shopping Ctr',
    road: 'Queensway, Singapore 149053',
    lat: 1.2878,
    lng: 103.8034,
    services: ['51', '61', '93', '100', '123', '147', '153', '196', '198'],
  },
  {
    code: '28009',
    name: 'Jurong East Int',
    road: 'Jurong Gateway Rd, Singapore 608544',
    lat: 1.3331,
    lng: 103.7423,
    services: ['41', '49', '51', '52', '66', '78', '79', '97', '98', '105', '143', '160', '183'],
  },
];

// Haversine formula to compute geodesic distance between two GPS coordinates in meters
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Approximate Singapore area label based on coordinates
function getApproximateArea(lat, lng) {
  if (lat > 1.32 && lng < 103.77) return 'Jurong / West Region, Singapore';
  if (lat > 1.33 && lng > 103.85) return 'Toa Payoh / Central North, Singapore';
  if (lat < 1.28 && lng < 103.84) return 'HarbourFront / Telok Blangah, Singapore';
  if (lat < 1.295 && lng > 103.845) return 'Marina Bay / Downtown Core, Singapore';
  if (lat > 1.295 && lat < 1.315 && lng > 103.81 && lng < 103.845) {
    return 'Orchard / Tanglin, Singapore';
  }
  if (lng > 103.85) return 'Bugis / Rochor, Singapore';
  return 'Singapore Central Urban Area';
}

// Fetch live arrival times for a bus stop code from LTA DataMall
async function fetchLtaArrivals(busStopCode, ltaKey) {
  if (!ltaKey || typeof ltaKey !== 'string' || !ltaKey.trim()) {
    return { available: false, reason: 'LTA_ACCOUNT_KEY not configured' };
  }

  const endpoint = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(busStopCode)}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { AccountKey: ltaKey.trim() },
    });

    if (!response.ok) {
      return { available: false, upstreamStatus: response.status };
    }

    const data = await response.json();
    const rawServices = Array.isArray(data?.Services) ? data.Services : [];
    const now = Date.now();

    const services = rawServices.map((service) => {
      const serviceNo = String(service.ServiceNo || '').trim();
      const nextCandidateBuses = [service.NextBus, service.NextBus2];
      const arrivals = [];

      for (const bus of nextCandidateBuses) {
        if (
          bus &&
          typeof bus.EstimatedArrival === 'string' &&
          bus.EstimatedArrival.trim().length > 0
        ) {
          const arrivalTime = new Date(bus.EstimatedArrival).getTime();
          if (!isNaN(arrivalTime)) {
            const diffMinutes = Math.max(0, Math.floor((arrivalTime - now) / 60000));
            arrivals.push(diffMinutes);
          }
        }
      }

      return {
        ServiceNo: serviceNo,
        arrivals,
      };
    });

    return { available: true, services };
  } catch (err) {
    return { available: false, error: 'Upstream fetch failed' };
  }
}

export default async function handler(req, res) {
  // Extract query parameters
  let latParam = null;
  let lngParam = null;
  let limitParam = null;
  let includeArrivalsParam = null;

  if (req.query) {
    latParam = req.query.lat || req.query.latitude;
    lngParam = req.query.lng || req.query.lon || req.query.longitude;
    limitParam = req.query.limit;
    includeArrivalsParam = req.query.includeArrivals;
  } else if (req.url) {
    try {
      const url = new URL(req.url, 'http://localhost');
      latParam = url.searchParams.get('lat') || url.searchParams.get('latitude');
      lngParam =
        url.searchParams.get('lng') ||
        url.searchParams.get('lon') ||
        url.searchParams.get('longitude');
      limitParam = url.searchParams.get('limit');
      includeArrivalsParam = url.searchParams.get('includeArrivals');
    } catch {
      // Keep defaults
    }
  }

  // Parse or assign default coordinates (Orchard Boulevard default: 1.3025, 103.8250)
  const isDefaultLat = !latParam || isNaN(Number(latParam));
  const isDefaultLng = !lngParam || isNaN(Number(lngParam));
  const isDefaultLocation = isDefaultLat || isDefaultLng;

  const userLat = isDefaultLat ? 1.3025 : Number(latParam);
  const userLng = isDefaultLng ? 103.8250 : Number(lngParam);
  const limit = Math.min(10, Math.max(1, limitParam ? parseInt(String(limitParam), 10) || 5 : 5));
  const shouldIncludeArrivals = includeArrivalsParam !== 'false';

  // Compute distances to all stops
  const stopsWithDistance = SINGAPORE_BUS_STOPS.map((stop) => {
    const distanceMeters = calculateDistanceMeters(userLat, userLng, stop.lat, stop.lng);
    const walkingTimeMins = Math.max(1, Math.round(distanceMeters / 80)); // 80m/min walk speed

    return {
      BusStopCode: stop.code,
      name: stop.name,
      road: stop.road,
      distanceMeters,
      walkingTimeMins,
      busServices: stop.services,
      coordinates: {
        lat: stop.lat,
        lng: stop.lng,
      },
    };
  });

  // Sort by closest distance
  stopsWithDistance.sort((a, b) => a.distanceMeters - b.distanceMeters);

  const nearestStops = stopsWithDistance.slice(0, limit);
  const closestStop = nearestStops[0] || null;

  // Optional: fetch live arrival predictions for the closest stop
  let closestStopArrivals = null;
  const ltaKey = process.env.LTA_ACCOUNT_KEY;

  if (closestStop && shouldIncludeArrivals) {
    const arrivalResult = await fetchLtaArrivals(closestStop.BusStopCode, ltaKey);
    closestStopArrivals = arrivalResult;
  }

  // Cache response for 15 seconds
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
    userLocation: {
      latitude: userLat,
      longitude: userLng,
      area: getApproximateArea(userLat, userLng),
      isDefault: isDefaultLocation,
    },
    closestStop: closestStop
      ? {
          ...closestStop,
          arrivals: closestStopArrivals?.available ? closestStopArrivals.services : undefined,
        }
      : null,
    nearestStops,
    ltaKeyConfigured: Boolean(ltaKey && typeof ltaKey === 'string' && ltaKey.trim().length > 0),
  });
}
