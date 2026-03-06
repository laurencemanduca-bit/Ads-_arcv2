import type { VercelRequest, VercelResponse } from '@vercel/node';

const GOOGLE_ADS_API_VERSION = 'v18';
const BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, customerId, accessToken, developerToken, loginCustomerId } = req.body || {};

  if (!query || !customerId || !accessToken || !developerToken) {
    return res.status(400).json({
      error: 'Missing required fields: query, customerId, accessToken, developerToken',
    });
  }

  const cleanCustomerId = String(customerId).replace(/-/g, '');

  try {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json',
    };

    // If using a manager account, set the login-customer-id header
    if (loginCustomerId) {
      headers['login-customer-id'] = String(loginCustomerId).replace(/-/g, '');
    }

    const resp = await fetch(
      `${BASE_URL}/customers/${cleanCustomerId}/googleAds:searchStream`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ query }),
      }
    );

    if (!resp.ok) {
      const errText = await resp.text();
      let parsed;
      try { parsed = JSON.parse(errText); } catch { parsed = null; }

      // Extract a user-friendly error message
      const errorDetail = parsed?.error?.message
        || parsed?.[0]?.error?.message
        || errText;

      return res.status(resp.status).json({ error: errorDetail });
    }

    const data = await resp.json();

    // searchStream returns array of batches with results arrays
    const results: any[] = [];
    if (Array.isArray(data)) {
      for (const batch of data) {
        if (batch.results) results.push(...batch.results);
      }
    }

    return res.json({ results });
  } catch (err: any) {
    console.error('Google Ads proxy error:', err);
    return res.status(500).json({ error: err.message || 'Proxy request failed' });
  }
}
