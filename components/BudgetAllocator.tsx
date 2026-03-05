
import React, { useState } from 'react';
import { generateMultiPlatformAllocation } from '../services/gemini';
import { DollarSign, TrendingUp, AlertTriangle, Loader2, Zap, Globe, Check, ArrowRight, ShieldCheck, ListOrdered } from 'lucide-react';

const PLATFORM_COLORS: Record<string, string> = {
  'Google Search Ads': 'bg-blue-500',
  'Google Performance Max': 'bg-indigo-500',
  'Meta Ads': 'bg-[#1877F2]',
  'YouTube Ads': 'bg-red-500',
  'Microsoft/Bing Ads': 'bg-teal-500',
  'LinkedIn Ads': 'bg-sky-700',
  'TikTok Ads': 'bg-pink-500',
};

const getPlatformColor = (platform: string) => {
  for (const key of Object.keys(PLATFORM_COLORS)) {
    if (platform.toLowerCase().includes(key.toLowerCase().split(' ')[0].toLowerCase())) {
      return PLATFORM_COLORS[key];
    }
  }
  return 'bg-slate-500';
};

const BudgetAllocator: React.FC = () => {
  const [form, setForm] = useState({
    totalBudget: '',
    goal: 'Leads',
    industry: '',
    businessInfo: '',
  });
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.totalBudget || !form.industry) return;
    setIsLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await generateMultiPlatformAllocation(
        `$${form.totalBudget}/mo`,
        form.goal,
        form.industry,
        form.businessInfo || `${form.industry} business targeting ${form.goal.toLowerCase()}`
      );
      setResult(data);
    } catch (err: any) {
      setError('Allocation failed. Check your API key and try again.');
      console.error(err);
    }
    setIsLoading(false);
  };

  return (
    <div className="animate-fade-in-up space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">Budget Allocator</h2>
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Distribute your spend across platforms for maximum multi-channel ROI.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-10 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Monthly Budget ($)</label>
              <input
                required
                name="totalBudget"
                type="number"
                min="500"
                value={form.totalBudget}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg text-blue-900"
                placeholder="e.g. 10000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Primary Goal</label>
              <select name="goal" value={form.goal} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold h-[52px]">
                <option value="Leads">Generate Leads</option>
                <option value="Sales / E-commerce">Drive Sales / E-commerce</option>
                <option value="Brand Awareness">Brand Awareness</option>
                <option value="App Installs">App Installs</option>
                <option value="Store Visits">Store Visits</option>
                <option value="B2B Pipeline">B2B Pipeline</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Industry / Niche</label>
            <input
              required
              name="industry"
              value={form.industry}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
              placeholder="e.g. Personal Injury Law, SaaS, Home Renovation"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Business Context (Optional)</label>
            <textarea
              name="businessInfo"
              value={form.businessInfo}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none text-sm"
              placeholder="e.g. B2B SaaS targeting mid-market HR teams, avg deal size $12k/year, have 3 months of Google Ads data, no Meta presence yet"
            />
          </div>

          {error && <div className="text-red-600 text-sm font-bold bg-red-50 border border-red-100 p-3 rounded-xl">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-google-blue text-white font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-blue-700 transition flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Calculating...</> : <><Zap className="w-5 h-5 fill-white" /> Calculate Allocation</>}
          </button>
        </form>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div className="bg-google-blue w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(26,115,232,0.4)] mb-8">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-3xl font-black tracking-tighter uppercase">Analyzing Platforms...</h3>
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mt-4">Gemini 2.5 Pro calculating optimal multi-channel ROI split</p>
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-fade-in">
          {/* Summary Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[2rem] p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-xl"><TrendingUp className="w-6 h-6 text-green-400" /></div>
              <h3 className="text-2xl font-black uppercase tracking-tight">Strategic Allocation</h3>
            </div>
            <p className="text-slate-300 leading-relaxed mb-6">{result.summary}</p>
            <div className="bg-white/10 border border-white/10 rounded-xl p-4">
              <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Funnel Strategy</div>
              <p className="text-sm text-white font-medium">{result.funnelStrategy}</p>
            </div>
          </div>

          {/* Allocation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.allocations?.map((alloc: any, i: number) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`${getPlatformColor(alloc.platform)} h-2`}></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-slate-900 text-lg">{alloc.platform}</h4>
                      <div className="text-2xl font-black text-google-blue mt-1">{alloc.amount}<span className="text-sm font-normal text-slate-500">/mo</span></div>
                    </div>
                    <div className={`${getPlatformColor(alloc.platform)} text-white px-3 py-1.5 rounded-full text-sm font-black`}>
                      {alloc.percentage}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{alloc.reasoning}</p>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-slate-400 font-bold uppercase">Est. Leads</div>
                      <div className="font-black text-slate-800 text-sm">{alloc.expectedLeads}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-slate-400 font-bold uppercase">Est. CPA</div>
                      <div className="font-black text-slate-800 text-sm">{alloc.expectedCpa}</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                      <div className="text-xs text-slate-400 font-bold uppercase">Key Metric</div>
                      <div className="font-black text-slate-800 text-xs leading-tight">{alloc.keyMetric}</div>
                    </div>
                  </div>

                  {alloc.topTip && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-2">
                      <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800 font-medium leading-relaxed">{alloc.topTip}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Launch Sequence */}
          {result.priorityOrder && result.priorityOrder.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <ListOrdered className="w-5 h-5 text-google-blue" />
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Recommended Launch Sequence</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {result.priorityOrder.map((platform: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2">
                    <div className="w-6 h-6 rounded-full bg-google-blue text-white flex items-center justify-center text-xs font-black">{i + 1}</div>
                    <span className="text-sm font-bold text-slate-700">{platform}</span>
                    {i < result.priorityOrder.length - 1 && <ArrowRight className="w-4 h-4 text-slate-300 ml-1" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning Flags */}
          {result.warningFlags && result.warningFlags.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-amber-900 uppercase tracking-tight">Watch Out For</h3>
              </div>
              <ul className="space-y-2">
                {result.warningFlags.map((flag: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-amber-800">
                    <span className="text-amber-500 font-black shrink-0">⚠</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-center">
            <button onClick={() => { setResult(null); setForm({ totalBudget: '', goal: 'Leads', industry: '', businessInfo: '' }); }} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-google-blue bg-white px-8 py-3 rounded-2xl border border-slate-200 shadow-sm transition flex items-center gap-3">
              <ArrowRight className="w-4 h-4 rotate-180" /> New Allocation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetAllocator;
