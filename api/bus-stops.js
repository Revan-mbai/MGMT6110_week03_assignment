/**
 * Serverless handler for LTA DataMall Bus Stops
 * Form (a): Standalone file at api/bus-stops.js for Vercel
 * Form (b): Mounted by server.ts for local development
 *
 * Caches the complete set of Singapore bus stops in-memory for 24 hours (86,400,000 ms).
 */

let cachedBusStops = null;
let busStopsCacheTime = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export default async function handler(req, res) {
  const nowMs = Date.now();

  // Return server-cached list if valid
  if (cachedBusStops && nowMs - busStopsCacheTime < CACHE_TTL_MS) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200');
    return res.status(200).json(cachedBusStops);
  }

  const ltaKey = process.env.LTA_ACCOUNT_KEY;

  // If LTA_ACCOUNT_KEY is present, fetch complete paged set from DataMall
  if (ltaKey && typeof ltaKey === 'string' && ltaKey.trim()) {
    try {
      const allStops = [];
      let skip = 0;
      let hasMore = true;

      while (hasMore) {
        const endpoint = `https://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=${skip}`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            AccountKey: ltaKey.trim(),
          },
        });

        if (!response.ok) {
          throw new Error(`LTA DataMall BusStops HTTP ${response.status}`);
        }

        const data = await response.json();
        const batch = Array.isArray(data?.value) ? data.value : [];

        for (const item of batch) {
          allStops.push({
            code: String(item.BusStopCode || '').trim(),
            name: String(item.Description || '').trim(),
            road: String(item.RoadName || '').trim(),
            latitude: parseFloat(item.Latitude) || 0,
            longitude: parseFloat(item.Longitude) || 0,
          });
        }

        if (batch.length < 500) {
          hasMore = false;
        } else {
          skip += 500;
        }

        // Safety break if over 10,000 stops
        if (skip > 10000) break;
      }

      if (allStops.length > 0) {
        const payload = {
          isReal: true,
          source: 'LTA DataMall BusStops',
          fetchedAt: new Date().toISOString(),
          totalStops: allStops.length,
          stops: allStops,
        };

        cachedBusStops = payload;
        busStopsCacheTime = nowMs;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200');
        return res.status(200).json(payload);
      }
    } catch (err) {
      // Fall through to bundled fallback catalog on upstream failure
    }
  }

  // Fallback: bundled Singapore bus stops catalog containing key islandwide stops
  // (including Bedok, Siglap, Siglap Community Centre, Sengkang, etc.)
  try {
    // Dynamic import from data module
    const { BUS_STOPS_DATA } = await import('../src/data.js').catch(async () => {
      return await import('../src/data.ts');
    });

    const fallbackStops = BUS_STOPS_DATA.map((s) => ({
      code: s.code,
      name: s.name,
      road: s.road,
      postalCode: s.postalCode,
      latitude: s.latitude,
      longitude: s.longitude,
      busServices: s.busServices,
    }));

    const payload = {
      isReal: false,
      source: 'Bundled Singapore Bus Stops Catalog',
      fetchedAt: new Date().toISOString(),
      totalStops: fallbackStops.length,
      stops: fallbackStops,
    };

    cachedBusStops = payload;
    busStopsCacheTime = nowMs;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).json(payload);
  } catch (e) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      isReal: false,
      source: 'Fallback Emergency Catalog',
      fetchedAt: new Date().toISOString(),
      totalStops: 0,
      stops: [],
    });
  }
}
