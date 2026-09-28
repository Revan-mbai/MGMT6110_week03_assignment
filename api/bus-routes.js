/**
 * Serverless handler for LTA DataMall Bus Routes
 * Form (a): Standalone file at api/bus-routes.js for Vercel
 * Form (b): Mounted by server.ts for local development
 *
 * Fetches all bus routes from LTA DataMall BusRoutes (/ltaodataservice/BusRoutes),
 * builds the stop-to-services mapping for every bus stop in Singapore,
 * and caches it in-memory on the server for 24 hours (86,400,000 ms).
 */

let cachedBusRoutes = null;
let busRoutesCacheTime = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Helper to sort Singapore bus service numbers naturally (e.g. 2, 7, 10, 14, 14A, 65, 106, 410G)
function sortBusServices(services) {
  return services.sort((a, b) => {
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);
    if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
      return numA - numB;
    }
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });
}

export default async function handler(req, res) {
  const nowMs = Date.now();

  // Return server-cached mapping if valid
  if (cachedBusRoutes && nowMs - busRoutesCacheTime < CACHE_TTL_MS) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200');
    return res.status(200).json(cachedBusRoutes);
  }

  const ltaKey = process.env.LTA_ACCOUNT_KEY;

  if (ltaKey && typeof ltaKey === 'string' && ltaKey.trim()) {
    try {
      const stopToServices = new Map();
      let skip = 0;
      let hasMore = true;

      while (hasMore) {
        const endpoint = `https://datamall2.mytransport.sg/ltaodataservice/BusRoutes?$skip=${skip}`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            AccountKey: ltaKey.trim(),
          },
        });

        if (!response.ok) {
          throw new Error(`LTA DataMall BusRoutes HTTP ${response.status}`);
        }

        const data = await response.json();
        const batch = Array.isArray(data?.value) ? data.value : [];

        for (const item of batch) {
          const rawCode = String(item.BusStopCode || '').trim();
          const svcNo = String(item.ServiceNo || '').trim();
          if (rawCode && svcNo) {
            // Normalize stop code (pad 4 digits to 5)
            const code = rawCode.length === 4 ? `0${rawCode}` : rawCode;
            if (!stopToServices.has(code)) {
              stopToServices.set(code, new Set());
            }
            stopToServices.get(code).add(svcNo);
          }
        }

        if (batch.length < 500) {
          hasMore = false;
        } else {
          skip += 500;
        }

        // Safety break
        if (skip > 60000) break;
      }

      if (stopToServices.size > 0) {
        const servicesByStop = {};
        for (const [code, svcSet] of stopToServices.entries()) {
          servicesByStop[code] = sortBusServices(Array.from(svcSet));
        }

        const payload = {
          isReal: true,
          source: 'LTA DataMall BusRoutes',
          fetchedAt: new Date().toISOString(),
          totalStops: Object.keys(servicesByStop).length,
          servicesByStop,
        };

        cachedBusRoutes = payload;
        busRoutesCacheTime = nowMs;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200');
        return res.status(200).json(payload);
      }
    } catch (err) {
      // Fall through to fallback on upstream failure
    }
  }

  // Fallback: extract mappings from bundled data without inventing fake services
  try {
    const { BUS_STOPS_DATA } = await import('../src/data.js').catch(async () => {
      return await import('../src/data.ts');
    });

    const fallbackServices = {};
    for (const stop of BUS_STOPS_DATA) {
      if (stop.code && Array.isArray(stop.busServices)) {
        fallbackServices[stop.code] = stop.busServices;
      }
    }

    const payload = {
      isReal: false,
      source: 'Bundled Bus Routes Mapping',
      fetchedAt: new Date().toISOString(),
      totalStops: Object.keys(fallbackServices).length,
      servicesByStop: fallbackServices,
    };

    cachedBusRoutes = payload;
    busRoutesCacheTime = nowMs;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).json(payload);
  } catch (e) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      isReal: false,
      source: 'Empty Routes Mapping',
      fetchedAt: new Date().toISOString(),
      totalStops: 0,
      servicesByStop: {},
    });
  }
}
