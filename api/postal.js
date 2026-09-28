/**
 * Serverless handler for OneMap Postal Code Geocoding
 * Form (a): Standalone file at api/postal.js for Vercel
 * Form (b): Mounted by server.ts for local development
 */

export default async function handler(req, res) {
  let postalCode = '';
  if (req.query && req.query.postalCode) {
    postalCode = String(req.query.postalCode).trim();
  } else if (req.url) {
    try {
      const url = new URL(req.url, 'http://localhost');
      postalCode = url.searchParams.get('postalCode') || '';
    } catch {
      // fallback
    }
  }

  const cleanPostal = postalCode.replace(/\D/g, '');
  if (cleanPostal.length !== 6) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).json({
      error: 'Singapore postal codes must be exactly 6 digits.',
      found: false,
    });
  }

  const endpoint = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(cleanPostal)}&returnGeom=Y&getAddrDetails=Y`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'SGBusTracker/1.0',
      },
    });

    if (!response.ok) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(response.status).json({
        error: `OneMap service returned HTTP ${response.status}`,
        found: false,
      });
    }

    const data = await response.json();
    if (!data || !data.results || data.results.length === 0 || data.found === 0) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).json({
        error: `No location found in Singapore for postal code ${cleanPostal}.`,
        found: false,
      });
    }

    const first = data.results[0];
    const latitude = parseFloat(first.LATITUDE);
    const longitude = parseFloat(first.LONGITUDE);

    if (isNaN(latitude) || isNaN(longitude)) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(502).json({
        error: 'OneMap returned invalid coordinates for this postal code.',
        found: false,
      });
    }

    const locationName =
      first.BUILDING && first.BUILDING !== 'NIL'
        ? `${first.BUILDING} (${first.ROAD_NAME || 'Singapore'})`
        : first.ADDRESS || `Postal ${cleanPostal}`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json({
      found: true,
      postalCode: cleanPostal,
      name: locationName,
      address: first.ADDRESS || `${first.ROAD_NAME}, Singapore ${cleanPostal}`,
      latitude,
      longitude,
    });
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(502).json({
      error: 'Failed to communicate with OneMap service.',
      found: false,
    });
  }
}
