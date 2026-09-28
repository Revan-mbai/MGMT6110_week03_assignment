/**
 * Serverless function for Live Bus Arrivals from LTA DataMall BusArrivalv2
 * Form (a): Standalone file at api/bus.js for Vercel
 * Form (b): Imported by server.ts for local dev and Cloud Run
 *
 * Calls /ltaodataservice/v3/BusArrival?BusStopCode=<code>
 * Caches per stop in-memory with a 20-second TTL matching the on-screen refresh interval.
 * Does not invent fake arrival times if the endpoint is unavailable.
 */

// In-memory cache for bus arrival responses (20s TTL matching on-screen refresh interval)
const busArrivalCache = new Map();
const CACHE_TTL_MS = 20000;

function parseLoad(code) {
  switch (code) {
    case 'SEA':
      return 'Seats Available';
    case 'SDA':
      return 'Standing Available';
    case 'LSD':
      return 'Limited Standing';
    default:
      return 'Seats Available';
  }
}

function parseDeckType(type) {
  if (type === 'DD' || type === 'BD') {
    return 'Double Deck';
  }
  return 'Single Deck';
}

function parseBusArrival(busObj, now) {
  if (!busObj || typeof busObj.EstimatedArrival !== 'string' || !busObj.EstimatedArrival.trim()) {
    return null;
  }

  const arrivalTime = new Date(busObj.EstimatedArrival).getTime();
  if (isNaN(arrivalTime)) {
    return null;
  }

  const diffMinutes = Math.max(0, Math.floor((arrivalTime - now) / 60000));

  return {
    arrivalMinutes: diffMinutes,
    load: parseLoad(busObj.Load),
    type: parseDeckType(busObj.Type),
    wheelchairAccessible: busObj.Feature === 'WAB',
    destinationCode: busObj.DestinationCode ? String(busObj.DestinationCode).trim() : undefined,
    originCode: busObj.OriginCode ? String(busObj.OriginCode).trim() : undefined,
    estimatedArrival: busObj.EstimatedArrival,
  };
}

export default async function handler(req, res) {
  // Extract BusStopCode query parameter
  let rawCode = '';
  if (req.query && req.query.BusStopCode) {
    rawCode = String(req.query.BusStopCode).trim();
  } else if (req.url) {
    try {
      const url = new URL(req.url, 'http://localhost');
      const param = url.searchParams.get('BusStopCode');
      if (param && param.trim()) {
        rawCode = param.trim();
      }
    } catch {
      // Keep rawCode
    }
  }

  if (!rawCode) {
    rawCode = '09048'; // Default
  }

  // Format and validate Singapore bus stop code (numeric 4-5 digits)
  const digits = rawCode.replace(/\D/g, '');
  const busStopCode = digits.length === 4 ? `0${digits}` : digits;

  if (!/^\d{5}$/.test(busStopCode)) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(404).json({
      notFound: true,
      error: 'Bus stop code must be 5 digits.',
    });
  }

  // Check in-memory cache first (20s TTL)
  const cached = busArrivalCache.get(busStopCode);
  const nowMs = Date.now();
  if (cached && (nowMs - cached.timestamp < CACHE_TTL_MS)) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
    return res.status(200).json(cached.data);
  }

  const ltaKey = process.env.LTA_ACCOUNT_KEY;

  if (!ltaKey || typeof ltaKey !== 'string' || !ltaKey.trim()) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(503).json({
      isUnavailable: true,
      error: 'LTA DataMall credentials not configured.',
    });
  }

  const endpoint = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(busStopCode)}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        AccountKey: ltaKey.trim(),
      },
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 400) {
        return res.status(404).json({
          notFound: true,
          error: 'Bus stop code does not exist in LTA DataMall.',
        });
      }
      return res.status(response.status).json({
        isUnavailable: true,
        upstreamStatus: response.status,
        error: `LTA DataMall upstream returned error status ${response.status}`,
      });
    }

    const data = await response.json();
    const rawServices = Array.isArray(data?.Services) ? data.Services : [];
    const now = Date.now();

    const services = rawServices.map((service) => {
      const serviceNo = String(service.ServiceNo || '').trim();
      const operator = String(service.Operator || '').trim();

      const nextBus = parseBusArrival(service.NextBus, now);
      const subsequentBus = parseBusArrival(service.NextBus2, now);
      const thirdBus = parseBusArrival(service.NextBus3, now);

      let noThirdArrivalReason = undefined;
      if (nextBus && subsequentBus && !thirdBus) {
        noThirdArrivalReason = 'Only two arrivals scheduled';
      } else if (nextBus && !subsequentBus) {
        noThirdArrivalReason = 'No more buses tonight (last bus in service)';
      } else if (!nextBus) {
        noThirdArrivalReason = 'No more buses tonight (last bus in service)';
      }

      return {
        ServiceNo: serviceNo,
        Operator: operator,
        nextBus,
        subsequentBus,
        thirdBus,
        noThirdArrivalReason,
      };
    });

    const payload = {
      BusStopCode: busStopCode,
      isReal: true,
      source: 'LTA DataMall BusArrivalv2',
      fetchedAt: new Date().toISOString(),
      services,
    };

    busArrivalCache.set(busStopCode, { data: payload, timestamp: nowMs });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
    return res.status(200).json(payload);
  } catch (err) {
    return res.status(502).json({
      isUnavailable: true,
      error: 'Failed to communicate with LTA DataMall BusArrival service.',
    });
  }
}
