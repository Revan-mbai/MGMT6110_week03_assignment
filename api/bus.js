/**
 * Serverless function for Live Bus Arrivals
 * Form (a): Standalone file at api/bus.js for Vercel
 * Form (b): Imported by server.ts for local dev and Cloud Run
 */

export default async function handler(req, res) {
  // Extract BusStopCode query parameter with default to '04121'
  let busStopCode = '04121';
  if (req.query && req.query.BusStopCode) {
    busStopCode = String(req.query.BusStopCode).trim() || '04121';
  } else if (req.url) {
    try {
      const url = new URL(req.url, 'http://localhost');
      const param = url.searchParams.get('BusStopCode');
      if (param && param.trim()) {
        busStopCode = param.trim();
      }
    } catch {
      // Keep default
    }
  }

  // Read credential from environment variable
  const ltaKey = process.env.LTA_ACCOUNT_KEY;

  // BEFORE the fetch, check if variable is missing or empty
  if (!ltaKey || typeof ltaKey !== 'string' || !ltaKey.trim()) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(503).json({
      error: 'LTA_ACCOUNT_KEY is not set. Add it in Vercel and redeploy.',
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

    // AFTER the fetch, check response.ok before reading the body
    if (!response.ok) {
      return res.status(response.status).json({
        upstreamStatus: response.status,
        error: `LTA DataMall upstream returned error status ${response.status}`,
      });
    }

    const data = await response.json();
    const rawServices = Array.isArray(data?.Services) ? data.Services : [];
    const now = Date.now();

    // Map each service to ServiceNo and next two arrival minutes
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
            if (!isNaN(diffMinutes)) {
              arrivals.push(diffMinutes);
            }
          }
        }
      }

      return {
        ServiceNo: serviceNo,
        arrivals: arrivals,
      };
    });

    // Set cache header as LTA refreshes every 20 seconds
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=40');
    return res.status(200).json({
      BusStopCode: busStopCode,
      services: services,
    });
  } catch (err) {
    return res.status(502).json({
      upstreamStatus: 502,
      error: 'Failed to communicate with LTA DataMall service.',
    });
  }
}
