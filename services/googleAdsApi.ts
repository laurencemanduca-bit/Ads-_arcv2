import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { dbInstance } from './firebase';

// --- Credential Storage (Firestore, per-user) ---

export interface GoogleAdsCredentials {
  clientId: string;
  clientSecret: string;
  developerToken: string;
  customerId: string;
  loginCustomerId?: string;
  refreshToken?: string;
  connectedEmail?: string;
  connectedAt?: number;
}

function getUserSettingsRef() {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  return doc(dbInstance, 'users', user.uid, 'settings', 'googleAds');
}

export async function getStoredCredentials(): Promise<GoogleAdsCredentials | null> {
  try {
    const snap = await getDoc(getUserSettingsRef());
    if (!snap.exists()) return null;
    return snap.data() as GoogleAdsCredentials;
  } catch {
    return null;
  }
}

export async function saveCredentials(creds: Partial<GoogleAdsCredentials>): Promise<void> {
  await setDoc(getUserSettingsRef(), creds, { merge: true });
}

export async function clearCredentials(): Promise<void> {
  await setDoc(getUserSettingsRef(), {});
}

// --- OAuth (client-side, Google's token endpoint supports CORS) ---

export function buildOAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/adwords',
    access_type: 'offline',
    prompt: 'consent',
    state: 'gads_connect',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ refreshToken: string; accessToken: string }> {
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error_description || err.error || 'Token exchange failed');
  }

  const data = await resp.json();
  if (!data.refresh_token) {
    throw new Error('No refresh token received. Try revoking app access at myaccount.google.com/permissions and reconnecting.');
  }

  return { refreshToken: data.refresh_token, accessToken: data.access_token };
}

export async function refreshAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<string> {
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error_description || err.error || 'Token refresh failed');
  }

  const data = await resp.json();
  return data.access_token;
}

// --- Google Ads API Queries (via Vercel proxy) ---

async function executeQuery(creds: GoogleAdsCredentials, query: string): Promise<any[]> {
  if (!creds.refreshToken) throw new Error('Account not connected');

  const accessToken = await refreshAccessToken(creds.clientId, creds.clientSecret, creds.refreshToken);

  const resp = await fetch('/api/google-ads/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      customerId: creds.customerId,
      accessToken,
      developerToken: creds.developerToken,
      loginCustomerId: creds.loginCustomerId || undefined,
    }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }));
    throw new Error(err.error || 'Query failed');
  }

  const data = await resp.json();
  return data.results || [];
}

// --- Pre-built Reports ---

export type DateRange = 'LAST_7_DAYS' | 'LAST_14_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'THIS_MONTH' | 'LAST_MONTH';

export interface OverviewData {
  clicks: number;
  impressions: number;
  ctr: number;
  avgCpc: number;
  cost: number;
  conversions: number;
  costPerConversion: number;
  conversionValue: number;
  allConversions: number;
  searchImpressionShare: number;
}

export interface CampaignData {
  id: string;
  name: string;
  status: string;
  channelType: string;
  biddingStrategy: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avgCpc: number;
  cost: number;
  conversions: number;
  costPerConversion: number;
  conversionValue: number;
  searchImpressionShare: number;
}

export interface KeywordData {
  keyword: string;
  matchType: string;
  adGroup: string;
  campaign: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avgCpc: number;
  cost: number;
  conversions: number;
  costPerConversion: number;
  qualityScore: number | null;
}

export interface SearchTermData {
  searchTerm: string;
  status: string;
  campaign: string;
  adGroup: string;
  clicks: number;
  impressions: number;
  ctr: number;
  cost: number;
  conversions: number;
}

export interface AdData {
  adId: string;
  adType: string;
  headlines: string[];
  descriptions: string[];
  finalUrls: string[];
  campaign: string;
  adGroup: string;
  approvalStatus: string;
  clicks: number;
  impressions: number;
  ctr: number;
  conversions: number;
  cost: number;
}

function microsToDollars(micros: string | number): number {
  return Number(micros || 0) / 1_000_000;
}

export async function fetchOverview(creds: GoogleAdsCredentials, dateRange: DateRange): Promise<OverviewData> {
  const results = await executeQuery(creds, `
    SELECT
      metrics.clicks, metrics.impressions, metrics.ctr,
      metrics.average_cpc, metrics.cost_micros, metrics.conversions,
      metrics.cost_per_conversion, metrics.conversions_value,
      metrics.all_conversions, metrics.search_impression_share
    FROM customer
    WHERE segments.date DURING ${dateRange}
  `);

  const r = results[0] || {};
  const m = r.metrics || {};
  return {
    clicks: Number(m.clicks || 0),
    impressions: Number(m.impressions || 0),
    ctr: Number(m.ctr || 0),
    avgCpc: microsToDollars(m.averageCpc),
    cost: microsToDollars(m.costMicros),
    conversions: Number(m.conversions || 0),
    costPerConversion: microsToDollars(m.costPerConversion),
    conversionValue: Number(m.conversionsValue || 0),
    allConversions: Number(m.allConversions || 0),
    searchImpressionShare: Number(m.searchImpressionShare || 0),
  };
}

export async function fetchCampaigns(creds: GoogleAdsCredentials, dateRange: DateRange): Promise<CampaignData[]> {
  const results = await executeQuery(creds, `
    SELECT
      campaign.id, campaign.name, campaign.status,
      campaign.advertising_channel_type, campaign.bidding_strategy_type,
      metrics.clicks, metrics.impressions, metrics.ctr,
      metrics.average_cpc, metrics.cost_micros, metrics.conversions,
      metrics.cost_per_conversion, metrics.conversions_value,
      metrics.search_impression_share
    FROM campaign
    WHERE segments.date DURING ${dateRange}
      AND campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
  `);

  return results.map(r => ({
    id: r.campaign?.id || '',
    name: r.campaign?.name || '',
    status: r.campaign?.status || '',
    channelType: r.campaign?.advertisingChannelType || '',
    biddingStrategy: r.campaign?.biddingStrategyType || '',
    clicks: Number(r.metrics?.clicks || 0),
    impressions: Number(r.metrics?.impressions || 0),
    ctr: Number(r.metrics?.ctr || 0),
    avgCpc: microsToDollars(r.metrics?.averageCpc),
    cost: microsToDollars(r.metrics?.costMicros),
    conversions: Number(r.metrics?.conversions || 0),
    costPerConversion: microsToDollars(r.metrics?.costPerConversion),
    conversionValue: Number(r.metrics?.conversionsValue || 0),
    searchImpressionShare: Number(r.metrics?.searchImpressionShare || 0),
  }));
}

export async function fetchKeywords(creds: GoogleAdsCredentials, dateRange: DateRange): Promise<KeywordData[]> {
  const results = await executeQuery(creds, `
    SELECT
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      ad_group.name, campaign.name,
      metrics.clicks, metrics.impressions, metrics.ctr,
      metrics.average_cpc, metrics.cost_micros, metrics.conversions,
      metrics.cost_per_conversion,
      ad_group_criterion.quality_info.quality_score
    FROM keyword_view
    WHERE segments.date DURING ${dateRange}
    ORDER BY metrics.impressions DESC
    LIMIT 200
  `);

  return results.map(r => ({
    keyword: r.adGroupCriterion?.keyword?.text || '',
    matchType: r.adGroupCriterion?.keyword?.matchType || '',
    adGroup: r.adGroup?.name || '',
    campaign: r.campaign?.name || '',
    clicks: Number(r.metrics?.clicks || 0),
    impressions: Number(r.metrics?.impressions || 0),
    ctr: Number(r.metrics?.ctr || 0),
    avgCpc: microsToDollars(r.metrics?.averageCpc),
    cost: microsToDollars(r.metrics?.costMicros),
    conversions: Number(r.metrics?.conversions || 0),
    costPerConversion: microsToDollars(r.metrics?.costPerConversion),
    qualityScore: r.adGroupCriterion?.qualityInfo?.qualityScore ?? null,
  }));
}

export async function fetchSearchTerms(creds: GoogleAdsCredentials, dateRange: DateRange): Promise<SearchTermData[]> {
  const results = await executeQuery(creds, `
    SELECT
      search_term_view.search_term, search_term_view.status,
      campaign.name, ad_group.name,
      metrics.clicks, metrics.impressions, metrics.ctr,
      metrics.cost_micros, metrics.conversions
    FROM search_term_view
    WHERE segments.date DURING ${dateRange}
    ORDER BY metrics.impressions DESC
    LIMIT 200
  `);

  return results.map(r => ({
    searchTerm: r.searchTermView?.searchTerm || '',
    status: r.searchTermView?.status || '',
    campaign: r.campaign?.name || '',
    adGroup: r.adGroup?.name || '',
    clicks: Number(r.metrics?.clicks || 0),
    impressions: Number(r.metrics?.impressions || 0),
    ctr: Number(r.metrics?.ctr || 0),
    cost: microsToDollars(r.metrics?.costMicros),
    conversions: Number(r.metrics?.conversions || 0),
  }));
}

export async function fetchAds(creds: GoogleAdsCredentials, dateRange: DateRange): Promise<AdData[]> {
  const results = await executeQuery(creds, `
    SELECT
      ad_group_ad.ad.id, ad_group_ad.ad.type,
      ad_group_ad.ad.responsive_search_ad.headlines,
      ad_group_ad.ad.responsive_search_ad.descriptions,
      ad_group_ad.ad.final_urls,
      campaign.name, ad_group.name,
      ad_group_ad.policy_summary.approval_status,
      metrics.clicks, metrics.impressions, metrics.ctr,
      metrics.conversions, metrics.cost_micros
    FROM ad_group_ad
    WHERE segments.date DURING ${dateRange}
      AND ad_group_ad.status != 'REMOVED'
    ORDER BY metrics.impressions DESC
    LIMIT 100
  `);

  return results.map(r => {
    const rsa = r.adGroupAd?.ad?.responsiveSearchAd;
    return {
      adId: r.adGroupAd?.ad?.id || '',
      adType: r.adGroupAd?.ad?.type || '',
      headlines: rsa?.headlines?.map((h: any) => h.text) || [],
      descriptions: rsa?.descriptions?.map((d: any) => d.text) || [],
      finalUrls: r.adGroupAd?.ad?.finalUrls || [],
      campaign: r.campaign?.name || '',
      adGroup: r.adGroup?.name || '',
      approvalStatus: r.adGroupAd?.policySummary?.approvalStatus || '',
      clicks: Number(r.metrics?.clicks || 0),
      impressions: Number(r.metrics?.impressions || 0),
      ctr: Number(r.metrics?.ctr || 0),
      conversions: Number(r.metrics?.conversions || 0),
      cost: microsToDollars(r.metrics?.costMicros),
    };
  });
}
