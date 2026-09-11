/**
 * Health check function for LTA DataMall service configuration
 * Form (a): Standalone file at api/health.js for Vercel
 * Form (b): Imported by server.ts for local dev and Cloud Run
 */

export default async function handler(req, res) {
  const ltaKey = process.env.LTA_ACCOUNT_KEY;
  const keyConfigured = Boolean(ltaKey && typeof ltaKey === 'string' && ltaKey.trim().length > 0);

  if (!keyConfigured) {
    return res.status(200).json({
      keyConfigured: false,
      ltaAnswered: false,
      upstreamStatus: null,
      message: 'LTA_ACCOUNT_KEY is not configured',
    });
  }

  try {
    const testUrl = 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121';
    const upstreamRes = await fetch(testUrl, {
      method: 'GET',
      headers: {
        AccountKey: ltaKey.trim(),
      },
    });

    return res.status(200).json({
      keyConfigured: true,
      ltaAnswered: true,
      upstreamStatus: upstreamRes.status,
      upstreamOk: upstreamRes.ok,
      message: upstreamRes.ok
        ? 'LTA service answered successfully'
        : `LTA answered with status ${upstreamRes.status}`,
    });
  } catch {
    return res.status(200).json({
      keyConfigured: true,
      ltaAnswered: false,
      upstreamStatus: null,
      message: 'LTA upstream request failed',
    });
  }
}
