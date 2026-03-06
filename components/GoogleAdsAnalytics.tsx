import React, { useState, useEffect, useCallback } from 'react';
import {
  getStoredCredentials,
  saveCredentials,
  clearCredentials,
  buildOAuthUrl,
  exchangeCodeForTokens,
  fetchOverview,
  fetchCampaigns,
  fetchKeywords,
  fetchSearchTerms,
  fetchAds,
  GoogleAdsCredentials,
  OverviewData,
  CampaignData,
  KeywordData,
  SearchTermData,
  AdData,
  DateRange,
} from '../services/googleAdsApi';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Search,
  Target,
  DollarSign,
  MousePointerClick,
  Eye,
  Percent,
  Link2,
  Unlink,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronDown,
  Settings,
  ExternalLink,
  CheckCircle2,
  KeyRound,
  Info,
  X,
} from 'lucide-react';

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  LAST_7_DAYS: 'Last 7 Days',
  LAST_14_DAYS: 'Last 14 Days',
  LAST_30_DAYS: 'Last 30 Days',
  LAST_90_DAYS: 'Last 90 Days',
  THIS_MONTH: 'This Month',
  LAST_MONTH: 'Last Month',
};

type Tab = 'overview' | 'campaigns' | 'keywords' | 'searchTerms' | 'ads';

const formatCurrency = (val: number) => `$${val.toFixed(2)}`;
const formatPercent = (val: number) => `${(val * 100).toFixed(2)}%`;
const formatNumber = (val: number) => val.toLocaleString();

export default function GoogleAdsAnalytics() {
  const [creds, setCreds] = useState<GoogleAdsCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Setup form
  const [formClientId, setFormClientId] = useState('');
  const [formClientSecret, setFormClientSecret] = useState('');
  const [formDevToken, setFormDevToken] = useState('');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formLoginCustomerId, setFormLoginCustomerId] = useState('');
  const [savingCreds, setSavingCreds] = useState(false);

  // Analytics state
  const [tab, setTab] = useState<Tab>('overview');
  const [dateRange, setDateRange] = useState<DateRange>('LAST_30_DAYS');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [searchTerms, setSearchTerms] = useState<SearchTermData[]>([]);
  const [ads, setAds] = useState<AdData[]>([]);

  useEffect(() => {
    loadCredentials();
    handleOAuthCallback();
  }, []);

  const loadCredentials = async () => {
    setLoading(true);
    try {
      const stored = await getStoredCredentials();
      if (stored?.clientId) {
        setCreds(stored);
        setFormClientId(stored.clientId || '');
        setFormClientSecret(stored.clientSecret || '');
        setFormDevToken(stored.developerToken || '');
        setFormCustomerId(stored.customerId || '');
        setFormLoginCustomerId(stored.loginCustomerId || '');
        if (stored.refreshToken) {
          loadData('overview', 'LAST_30_DAYS', stored);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state === 'gads_connect') {
      // Clean URL immediately
      window.history.replaceState({}, '', window.location.pathname);

      try {
        const stored = await getStoredCredentials();
        if (!stored?.clientId || !stored?.clientSecret) {
          setError('Credentials not found. Please save your API credentials first.');
          return;
        }

        const redirectUri = window.location.origin + window.location.pathname;
        const { refreshToken } = await exchangeCodeForTokens(
          code, stored.clientId, stored.clientSecret, redirectUri
        );

        await saveCredentials({ refreshToken, connectedAt: Date.now() });
        const updated = { ...stored, refreshToken, connectedAt: Date.now() };
        setCreds(updated);
        setSuccess('Google Ads account connected successfully!');
        setTimeout(() => setSuccess(''), 4000);
        loadData('overview', 'LAST_30_DAYS', updated);
      } catch (err: any) {
        setError(`Connection failed: ${err.message}`);
      }
    }

    // Handle errors from OAuth
    const oauthError = params.get('error');
    if (oauthError) {
      window.history.replaceState({}, '', window.location.pathname);
      setError(`OAuth error: ${oauthError}`);
    }
  };

  const handleSaveCredentials = async () => {
    if (!formClientId || !formClientSecret || !formDevToken || !formCustomerId) {
      setError('All fields except Login Customer ID are required.');
      return;
    }
    setSavingCreds(true);
    setError('');
    try {
      const newCreds: GoogleAdsCredentials = {
        clientId: formClientId.trim(),
        clientSecret: formClientSecret.trim(),
        developerToken: formDevToken.trim(),
        customerId: formCustomerId.trim(),
        ...(formLoginCustomerId.trim() ? { loginCustomerId: formLoginCustomerId.trim() } : {}),
        refreshToken: creds?.refreshToken,
        connectedAt: creds?.connectedAt,
      };
      await saveCredentials(newCreds);
      setCreds(newCreds);
      setShowSetup(false);
      setSuccess('Credentials saved!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingCreds(false);
    }
  };

  const handleConnect = () => {
    if (!creds?.clientId) {
      setError('Save your API credentials first.');
      return;
    }
    const redirectUri = window.location.origin + window.location.pathname;
    window.location.href = buildOAuthUrl(creds.clientId, redirectUri);
  };

  const handleDisconnect = async () => {
    await saveCredentials({ refreshToken: '', connectedAt: 0, connectedEmail: '' });
    setCreds(prev => prev ? { ...prev, refreshToken: '', connectedAt: 0 } : null);
    setOverview(null);
    setCampaigns([]);
    setKeywords([]);
    setSearchTerms([]);
    setAds([]);
  };

  const handleClearAll = async () => {
    await clearCredentials();
    setCreds(null);
    setFormClientId('');
    setFormClientSecret('');
    setFormDevToken('');
    setFormCustomerId('');
    setFormLoginCustomerId('');
    setOverview(null);
    setCampaigns([]);
    setKeywords([]);
    setSearchTerms([]);
    setAds([]);
  };

  const loadData = useCallback(async (reportTab: Tab, range?: DateRange, overrideCreds?: GoogleAdsCredentials) => {
    const c = overrideCreds || creds;
    const dr = range || dateRange;
    if (!c?.refreshToken) return;

    setDataLoading(true);
    setError('');
    try {
      switch (reportTab) {
        case 'overview': setOverview(await fetchOverview(c, dr)); break;
        case 'campaigns': setCampaigns(await fetchCampaigns(c, dr)); break;
        case 'keywords': setKeywords(await fetchKeywords(c, dr)); break;
        case 'searchTerms': setSearchTerms(await fetchSearchTerms(c, dr)); break;
        case 'ads': setAds(await fetchAds(c, dr)); break;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDataLoading(false);
    }
  }, [creds, dateRange]);

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    loadData(newTab);
  };

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
    setShowDatePicker(false);
    loadData(tab, newRange);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isConnected = !!creds?.refreshToken;
  const hasCredentials = !!creds?.clientId;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-2">
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">Live Analytics</h2>
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">
          Connect your Google Ads account for real performance data
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <p className="text-sm text-green-700 font-semibold">{success}</p>
        </div>
      )}

      {/* Setup Section */}
      {(!hasCredentials || showSetup) && (
        <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-2xl ring-8 ring-slate-50 overflow-hidden">
          {/* Setup Guide Header */}
          {!hasCredentials && (
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
              <h3 className="text-lg font-black uppercase tracking-widest mb-2">Setup Guide</h3>
              <p className="text-blue-100 text-sm">Connect your own Google Ads API credentials. Your data stays in your account.</p>
            </div>
          )}

          <div className="p-8 space-y-6">
            {/* Instructions */}
            {!hasCredentials && (
              <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-600 flex items-center gap-2">
                  <Info className="w-4 h-4" /> Before you start
                </h4>
                <ol className="space-y-3 text-sm text-slate-600">
                  <li className="flex gap-3">
                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">1</span>
                    <span>Go to <strong>Google Cloud Console</strong> &rarr; Create a project &rarr; Enable the <strong>Google Ads API</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">2</span>
                    <span>Go to <strong>Credentials</strong> &rarr; Create <strong>OAuth 2.0 Client ID</strong> (Web application type)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">3</span>
                    <span>
                      Add this as an <strong>Authorized redirect URI</strong>:
                      <code className="bg-slate-200 px-2 py-0.5 rounded text-xs ml-1 select-all">{window.location.origin + window.location.pathname}</code>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">4</span>
                    <span>In <strong>Google Ads</strong> &rarr; Tools &amp; Settings &rarr; <strong>API Center</strong> &rarr; get your Developer Token</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0">5</span>
                    <span>Your <strong>Customer ID</strong> is the 10-digit number at the top of Google Ads (format: 123-456-7890)</span>
                  </li>
                </ol>
              </div>
            )}

            {/* Credential Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">OAuth Client ID</label>
                <input
                  type="text"
                  value={formClientId}
                  onChange={e => setFormClientId(e.target.value)}
                  placeholder="xxxx.apps.googleusercontent.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">OAuth Client Secret</label>
                <input
                  type="password"
                  value={formClientSecret}
                  onChange={e => setFormClientSecret(e.target.value)}
                  placeholder="GOCSPX-..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Developer Token</label>
                <input
                  type="password"
                  value={formDevToken}
                  onChange={e => setFormDevToken(e.target.value)}
                  placeholder="From Google Ads API Center"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Customer ID</label>
                <input
                  type="text"
                  value={formCustomerId}
                  onChange={e => setFormCustomerId(e.target.value)}
                  placeholder="123-456-7890"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  Manager Account ID <span className="text-slate-400">(optional, for MCC accounts)</span>
                </label>
                <input
                  type="text"
                  value={formLoginCustomerId}
                  onChange={e => setFormLoginCustomerId(e.target.value)}
                  placeholder="Leave empty if not using a Manager account"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveCredentials}
                disabled={savingCreds}
                className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl"
              >
                {savingCreds ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                Save Credentials
              </button>
              {hasCredentials && showSetup && (
                <button onClick={() => setShowSetup(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">
                  Cancel
                </button>
              )}
              {hasCredentials && (
                <button onClick={handleClearAll} className="text-xs font-bold text-red-400 hover:text-red-600 uppercase tracking-widest ml-auto">
                  Remove All Credentials
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Connect Account Button (credentials saved but not connected) */}
      {hasCredentials && !isConnected && !showSetup && (
        <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-2xl ring-8 ring-slate-50 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Link2 className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-tight mb-3">Connect Your Account</h3>
          <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto">
            Your API credentials are saved. Now authorize access to your Google Ads data.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleConnect}
              className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
            >
              <ExternalLink className="w-4 h-4" />
              Authorize with Google
            </button>
            <button
              onClick={() => setShowSetup(true)}
              className="flex items-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 text-slate-600 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
            >
              <Settings className="w-4 h-4" />
              Edit Credentials
            </button>
          </div>
        </div>
      )}

      {/* Analytics Dashboard (connected) */}
      {isConnected && !showSetup && (
        <>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-[2rem] border-2 border-slate-100 shadow-xl ring-8 ring-slate-50/50 px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                Live &mdash; {creds?.customerId}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Date Range */}
              <div className="relative">
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 transition-all"
                >
                  {DATE_RANGE_LABELS[dateRange]}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {showDatePicker && (
                  <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 py-2 min-w-[200px] overflow-hidden">
                    {Object.entries(DATE_RANGE_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => handleDateRangeChange(key as DateRange)}
                        className={`w-full text-left px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition ${dateRange === key ? 'text-blue-600 bg-blue-50' : 'text-slate-600'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => loadData(tab)}
                disabled={dataLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowSetup(true)}
                className="p-2.5 bg-slate-100 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-all"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 transition-all"
              >
                <Unlink className="w-3.5 h-3.5" />
                Disconnect
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto shadow-inner border border-slate-200">
            {([
              ['overview', 'Overview', BarChart3],
              ['campaigns', 'Campaigns', Target],
              ['keywords', 'Keywords', Search],
              ['searchTerms', 'Search Terms', Search],
              ['ads', 'Ads', MousePointerClick],
            ] as [Tab, string, any][]).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  tab === key ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Loading */}
          {dataLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-slate-500 font-bold uppercase text-xs tracking-widest">Fetching live data...</span>
            </div>
          )}

          {/* Tab Content */}
          {!dataLoading && tab === 'overview' && overview && <OverviewTab data={overview} />}
          {!dataLoading && tab === 'campaigns' && <CampaignsTab data={campaigns} />}
          {!dataLoading && tab === 'keywords' && <KeywordsTab data={keywords} />}
          {!dataLoading && tab === 'searchTerms' && <SearchTermsTab data={searchTerms} />}
          {!dataLoading && tab === 'ads' && <AdsTab data={ads} />}
        </>
      )}
    </div>
  );
}

// --- Sub-components ---

const MetricCard = ({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) => (
  <div className="bg-white rounded-2xl border-2 border-slate-100 p-6 hover:shadow-xl transition-shadow ring-4 ring-slate-50/50">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
  </div>
);

function OverviewTab({ data }: { data: OverviewData }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <MetricCard label="Clicks" value={formatNumber(data.clicks)} icon={MousePointerClick} color="bg-blue-100 text-blue-600" />
      <MetricCard label="Impressions" value={formatNumber(data.impressions)} icon={Eye} color="bg-purple-100 text-purple-600" />
      <MetricCard label="CTR" value={formatPercent(data.ctr)} icon={Percent} color="bg-green-100 text-green-600" />
      <MetricCard label="Avg CPC" value={formatCurrency(data.avgCpc)} icon={DollarSign} color="bg-amber-100 text-amber-600" />
      <MetricCard label="Total Cost" value={formatCurrency(data.cost)} icon={DollarSign} color="bg-red-100 text-red-600" />
      <MetricCard label="Conversions" value={formatNumber(data.conversions)} icon={Target} color="bg-emerald-100 text-emerald-600" />
      <MetricCard label="Cost / Conv." value={formatCurrency(data.costPerConversion)} icon={TrendingDown} color="bg-orange-100 text-orange-600" />
      <MetricCard label="Conv. Value" value={formatCurrency(data.conversionValue)} icon={TrendingUp} color="bg-teal-100 text-teal-600" />
      <MetricCard label="All Conv." value={formatNumber(data.allConversions)} icon={Target} color="bg-indigo-100 text-indigo-600" />
      <MetricCard label="Impr. Share" value={formatPercent(data.searchImpressionShare)} icon={BarChart3} color="bg-sky-100 text-sky-600" />
    </div>
  );
}

function CampaignsTab({ data }: { data: CampaignData[] }) {
  if (!data.length) return <EmptyState message="No campaign data for this period." />;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-xl ring-4 ring-slate-50/50">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Campaign', 'Status', 'Clicks', 'Impr.', 'CTR', 'Avg CPC', 'Cost', 'Conv.', 'Cost/Conv.'].map(h => (
                <th key={h} className={`px-4 py-3 font-black text-[10px] uppercase tracking-widest text-slate-500 ${h === 'Campaign' || h === 'Status' ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((c, i) => (
              <tr key={c.id || i} className="border-b border-slate-50 hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-bold text-slate-900 max-w-[200px] truncate">{c.name}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{formatNumber(c.clicks)}</td>
                <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{formatNumber(c.impressions)}</td>
                <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{formatPercent(c.ctr)}</td>
                <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{formatCurrency(c.avgCpc)}</td>
                <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">{formatCurrency(c.cost)}</td>
                <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{formatNumber(c.conversions)}</td>
                <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{c.conversions > 0 ? formatCurrency(c.costPerConversion) : '-'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-black">
              <td className="px-4 py-3 text-xs uppercase tracking-widest">Total</td>
              <td></td>
              <td className="px-4 py-3 text-right tabular-nums">{formatNumber(data.reduce((s, c) => s + c.clicks, 0))}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatNumber(data.reduce((s, c) => s + c.impressions, 0))}</td>
              <td className="px-4 py-3 text-right">-</td>
              <td className="px-4 py-3 text-right">-</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(data.reduce((s, c) => s + c.cost, 0))}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatNumber(data.reduce((s, c) => s + c.conversions, 0))}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function KeywordsTab({ data }: { data: KeywordData[] }) {
  if (!data.length) return <EmptyState message="No keyword data for this period." />;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-xl ring-4 ring-slate-50/50">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Keyword', 'Match', 'Campaign', 'QS', 'Clicks', 'Impr.', 'CTR', 'CPC', 'Cost', 'Conv.'].map(h => (
                <th key={h} className={`px-4 py-3 font-black text-[10px] uppercase tracking-widest text-slate-500 ${['Keyword', 'Match', 'Campaign'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((k, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-bold text-slate-900 max-w-[180px] truncate">{k.keyword}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-slate-100 text-slate-500 uppercase">
                    {k.matchType?.replace('MATCH_TYPE_', '') || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 max-w-[130px] truncate text-xs">{k.campaign}</td>
                <td className="px-4 py-3 text-right">{k.qualityScore != null ? <QualityScoreBadge score={k.qualityScore} /> : '-'}</td>
                <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{formatNumber(k.clicks)}</td>
                <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{formatNumber(k.impressions)}</td>
                <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{formatPercent(k.ctr)}</td>
                <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{formatCurrency(k.avgCpc)}</td>
                <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">{formatCurrency(k.cost)}</td>
                <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{formatNumber(k.conversions)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SearchTermsTab({ data }: { data: SearchTermData[] }) {
  if (!data.length) return <EmptyState message="No search term data for this period." />;

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 overflow-hidden shadow-xl ring-4 ring-slate-50/50">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Search Term', 'Status', 'Campaign', 'Clicks', 'Impr.', 'CTR', 'Cost', 'Conv.'].map(h => (
                <th key={h} className={`px-4 py-3 font-black text-[10px] uppercase tracking-widest text-slate-500 ${['Search Term', 'Status', 'Campaign'].includes(h) ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((s, i) => (
              <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-bold text-slate-900 max-w-[220px] truncate">{s.searchTerm}</td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-3 text-slate-500 max-w-[130px] truncate text-xs">{s.campaign}</td>
                <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{formatNumber(s.clicks)}</td>
                <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{formatNumber(s.impressions)}</td>
                <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{formatPercent(s.ctr)}</td>
                <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">{formatCurrency(s.cost)}</td>
                <td className="px-4 py-3 text-right text-slate-700 tabular-nums">{formatNumber(s.conversions)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdsTab({ data }: { data: AdData[] }) {
  if (!data.length) return <EmptyState message="No ad data for this period." />;

  return (
    <div className="space-y-4">
      {data.map((ad, i) => (
        <div key={ad.adId || i} className="bg-white rounded-2xl border-2 border-slate-100 p-6 hover:shadow-xl transition-shadow ring-4 ring-slate-50/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{ad.campaign} &gt; {ad.adGroup}</div>
              <StatusBadge status={ad.approvalStatus} />
            </div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{ad.adType?.replace(/_/g, ' ')}</span>
          </div>

          {ad.headlines.length > 0 && (
            <div className="mb-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Headlines</div>
              <div className="flex flex-wrap gap-1.5">
                {ad.headlines.map((h, j) => (
                  <span key={j} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg font-bold">{h}</span>
                ))}
              </div>
            </div>
          )}

          {ad.descriptions.length > 0 && (
            <div className="mb-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Descriptions</div>
              {ad.descriptions.map((d, j) => (
                <p key={j} className="text-sm text-slate-600 leading-relaxed">{d}</p>
              ))}
            </div>
          )}

          <div className="grid grid-cols-5 gap-4 pt-4 border-t border-slate-100">
            {[
              ['Clicks', formatNumber(ad.clicks)],
              ['Impressions', formatNumber(ad.impressions)],
              ['CTR', formatPercent(ad.ctr)],
              ['Conversions', formatNumber(ad.conversions)],
              ['Cost', formatCurrency(ad.cost)],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</div>
                <div className="font-black text-slate-900">{value}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Helpers ---

function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toUpperCase();
  let color = 'bg-slate-100 text-slate-500';
  if (s === 'ENABLED' || s === 'ACTIVE' || s === 'APPROVED') color = 'bg-green-100 text-green-700';
  else if (s === 'PAUSED') color = 'bg-amber-100 text-amber-700';
  else if (s === 'REMOVED' || s === 'DISAPPROVED') color = 'bg-red-100 text-red-700';
  else if (s === 'ADDED' || s === 'NONE') color = 'bg-blue-100 text-blue-700';

  return (
    <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${color}`}>
      {s.replace(/_/g, ' ') || 'UNKNOWN'}
    </span>
  );
}

function QualityScoreBadge({ score }: { score: number }) {
  let color = 'text-red-600 bg-red-50 ring-red-100';
  if (score >= 7) color = 'text-green-600 bg-green-50 ring-green-100';
  else if (score >= 5) color = 'text-amber-600 bg-amber-50 ring-amber-100';

  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ring-2 ${color}`}>
      {score}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-slate-100 p-16 text-center ring-4 ring-slate-50/50">
      <Search className="w-10 h-10 text-slate-200 mx-auto mb-4" />
      <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">{message}</p>
    </div>
  );
}
