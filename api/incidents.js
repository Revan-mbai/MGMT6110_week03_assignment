/**
 * Serverless handler for LTA DataMall Traffic Incidents
 * Form (a): Standalone file at api/incidents.js for Vercel
 * Form (b): Mounted by server.ts for local development
 */

// In-memory cache for traffic incidents (60s TTL)
let cachedIncidents = null;
let incidentsCacheTime = 0;
const CACHE_TTL_MS = 60000;

/**
 * Parses LTA DataMall incident message.
 * Format typically begins with: "(28/9)14:23 Accident on..." or "(28/09) 14:23 Heavy Traffic on..."
 */
function parseIncidentMessage(rawMessage) {
  const msg = String(rawMessage || '').trim();
  // Regex to extract date (e.g. 28/9 or 28/09) and time (e.g. 14:23 or 14:23:05)
  const match = msg.match(/^\((\d{1,2}\/\d{1,2})\)\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*(.*)/i);

  if (match) {
    const dateStr = match[1]; // e.g. "28/9"
    const timeStr = match[2]; // e.g. "14:23"
    const cleanDetails = match[3] || msg;
    return {
      reportedDate: dateStr,
      reportedTime: timeStr,
      details: cleanDetails,
    };
  }

  // Fallback if message does not match standard prefix
  return {
    reportedDate: '',
    reportedTime: '',
    details: msg,
  };
}

export default async function handler(req, res) {
  const nowMs = Date.now();

  // Check in-memory cache
  if (cachedIncidents && nowMs - incidentsCacheTime < CACHE_TTL_MS) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Cache', 'HIT');
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(cachedIncidents);
  }

  const ltaKey = process.env.LTA_ACCOUNT_KEY;

  if (!ltaKey || typeof ltaKey !== 'string' || !ltaKey.trim()) {
    // Return structured demo data when LTA_ACCOUNT_KEY is not configured
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMin = Math.max(0, now.getMinutes() - 4).toString().padStart(2, '0');
    const todayDay = now.getDate();
    const todayMonth = now.getMonth() + 1;

    const demoPayload = {
      isReal: false,
      source: 'Demonstration / Simulated Data (LTA_ACCOUNT_KEY not set)',
      fetchedAt: now.toISOString(),
      incidents: [
        {
          id: 'demo-inc-01',
          type: 'Heavy Traffic',
          latitude: 1.3023,
          longitude: 103.8242,
          message: `(${todayDay}/${todayMonth})${currentHour}:${currentMin} Heavy traffic on Orchard Boulevard towards Grange Road. Avoid left lane.`,
          reportedDate: `${todayDay}/${todayMonth}`,
          reportedTime: `${currentHour}:${currentMin}`,
          details: 'Heavy traffic on Orchard Boulevard towards Grange Road. Avoid left lane.',
        },
        {
          id: 'demo-inc-02',
          type: 'Accident',
          latitude: 1.3547,
          longitude: 103.8315,
          message: `(${todayDay}/${todayMonth})${currentHour}:${currentMin} Accident on Upper Thomson Road outside Thomson Plaza. Left lane blocked.`,
          reportedDate: `${todayDay}/${todayMonth}`,
          reportedTime: `${currentHour}:${currentMin}`,
          details: 'Accident on Upper Thomson Road outside Thomson Plaza. Left lane blocked.',
        },
        {
          id: 'demo-inc-03',
          type: 'Road Works',
          latitude: 1.2931,
          longitude: 103.8519,
          message: `(${todayDay}/${todayMonth})07:30 Road works on North Bridge Road near City Hall. Bus lane diverted.`,
          reportedDate: `${todayDay}/${todayMonth}`,
          reportedTime: '07:30',
          details: 'Road works on North Bridge Road near City Hall. Bus lane diverted.',
        },
      ],
    };

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(demoPayload);
  }

  const endpoint = 'https://datamall2.mytransport.sg/ltaodataservice/TrafficIncidents';

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        AccountKey: ltaKey.trim(),
      },
    });

    if (!response.ok) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(response.status).json({
        isReal: false,
        error: `LTA DataMall TrafficIncidents returned HTTP ${response.status}`,
        incidents: [],
      });
    }

    const data = await response.json();
    const rawList = Array.isArray(data?.value) ? data.value : [];

    const incidents = rawList.map((item, idx) => {
      const parsed = parseIncidentMessage(item.Message);
      const lat = parseFloat(item.Latitude);
      const lng = parseFloat(item.Longitude);

      return {
        id: `lta-inc-${idx}-${Date.now()}`,
        type: item.Type || 'Incident',
        latitude: isNaN(lat) ? 0 : lat,
        longitude: isNaN(lng) ? 0 : lng,
        message: item.Message || '',
        reportedDate: parsed.reportedDate,
        reportedTime: parsed.reportedTime,
        details: parsed.details,
      };
    });

    const payload = {
      isReal: true,
      source: 'LTA DataMall',
      fetchedAt: new Date().toISOString(),
      incidents,
    };

    cachedIncidents = payload;
    incidentsCacheTime = nowMs;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(payload);
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(502).json({
      isReal: false,
      error: 'Failed to communicate with LTA DataMall Traffic Incidents service.',
      incidents: [],
    });
  }
}
