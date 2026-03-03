
import React, { useState } from 'react';
import { ClipboardList, Activity, Calculator, FileText, HelpCircle, Upload, Image as ImageIcon, Loader2, Globe, Settings, Target } from 'lucide-react';
import { extractMetricsFromImage, analyzeWebsite } from '../services/gemini';

interface AuditInputFormProps {
  onSubmit: (data: string) => void;
}

const AuditInputForm: React.FC<AuditInputFormProps> = ({ onSubmit }) => {
  const [inputMode, setInputMode] = useState<'manual' | 'raw'>('manual');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  
  // Manual Form State
  const [metrics, setMetrics] = useState({
    // Performance
    spend: '',
    conversions: '',
    clicks: '',
    impressions: '',
    conversionValue: '', // For ROAS
    optimizationScore: '', // New
    
    // Settings & Context
    biddingStrategy: 'Unknown',
    networks: 'Search Only',
    qualityScore: 'Unknown',
    
    // Business
    businessName: '', // New
    productService: '', // New
    industry: '',
    goal: 'Leads',
    problem: '',
  });

  const [rawText, setRawText] = useState('');

  const handleMetricChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMetrics(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsProcessingImage(true);
      try {
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64String = (reader.result as string).split(',')[1];
              const extracted = await extractMetricsFromImage(base64String);
              
              if (extracted) {
                  setMetrics(prev => ({
                      ...prev,
                      spend: extracted.spend || prev.spend,
                      conversions: extracted.conversions || prev.conversions,
                      clicks: extracted.clicks || prev.clicks,
                      impressions: extracted.impressions || prev.impressions,
                      conversionValue: extracted.conversionValue || prev.conversionValue,
                      optimizationScore: extracted.optimizationScore || prev.optimizationScore,
                      biddingStrategy: extracted.biddingStrategy || prev.biddingStrategy
                  }));
                  setInputMode('manual');
              } else {
                  alert("Could not extract data. Please try a clearer image or enter manually.");
              }
              setIsProcessingImage(false);
          };
          reader.readAsDataURL(file);
      } catch (error) {
          console.error(error);
          setIsProcessingImage(false);
          alert("Error processing image.");
      }
  };

  const handleUrlAnalysis = async () => {
      if (!urlInput) return;
      setIsProcessingUrl(true);
      try {
          const result = await analyzeWebsite(urlInput);
          if (result.industry) {
              setMetrics(prev => ({
                  ...prev,
                  businessName: result.businessName || prev.businessName,
                  industry: result.industry || prev.industry,
                  productService: result.productService || prev.productService,
                  // goal: result.goal || prev.goal // analyzeWebsite result type mismatch if I use goal, let's keep it safe
              }));
          }
      } catch (error) {
          console.error(error);
      }
      setIsProcessingUrl(false);
  };

  const calculateStats = () => {
    const s = parseFloat(metrics.spend) || 0;
    const c = parseFloat(metrics.clicks) || 0;
    const conv = parseFloat(metrics.conversions) || 0;
    const i = parseFloat(metrics.impressions) || 0;
    const val = parseFloat(metrics.conversionValue) || 0;

    return {
      ctr: i > 0 ? ((c / i) * 100).toFixed(2) + '%' : '-',
      cpc: c > 0 ? '$' + (s / c).toFixed(2) : '-',
      cpa: conv > 0 ? '$' + (s / conv).toFixed(2) : '-',
      roas: s > 0 && val > 0 ? ((val / s)).toFixed(2) + 'x' : '-',
    };
  };

  const stats = calculateStats();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputMode === 'raw') {
        if (rawText.trim().length < 50) {
            alert("Please provide more data for a meaningful audit.");
            return;
        }
        onSubmit(rawText);
    } else {
        // Construct blob from manual inputs
        const blob = `
        AUDIT DATA SOURCE: Manual Form Entry
        
        PERFORMANCE METRICS (Last 30 Days):
        - Total Spend: $${metrics.spend}
        - Total Conversions: ${metrics.conversions}
        - Total Revenue/Value: $${metrics.conversionValue || '0'}
        - Total Clicks: ${metrics.clicks}
        - Total Impressions: ${metrics.impressions}
        - Optimization Score: ${metrics.optimizationScore || 'N/A'}
        
        CALCULATED METRICS:
        - Avg CPC: ${stats.cpc}
        - CTR: ${stats.ctr}
        - CPA: ${stats.cpa}
        - ROAS: ${stats.roas}
        
        CAMPAIGN SETTINGS:
        - Bidding Strategy: ${metrics.biddingStrategy}
        - Networks: ${metrics.networks}
        - Est. Quality Score: ${metrics.qualityScore}
        
        CONTEXT:
        - Business Name: ${metrics.businessName}
        - Industry/Niche: ${metrics.industry}
        - Services Offered: ${metrics.productService}
        - Campaign Goal: ${metrics.goal}
        - Main Issue Reported: ${metrics.problem}
        ${urlInput ? `- Website URL: ${urlInput}` : ''}
        `;
        onSubmit(blob);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-8 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
           <Activity className="w-6 h-6" />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Campaign Audit & Optimization</h2>
            <p className="text-slate-500 text-sm">Analyze performance to find wasted spend and growth opportunities.</p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
            <button
                type="button"
                onClick={() => setInputMode('manual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${inputMode === 'manual' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <Calculator className="w-4 h-4" /> Guided Wizard
            </button>
            <button
                type="button"
                onClick={() => setInputMode('raw')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${inputMode === 'raw' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                <FileText className="w-4 h-4" /> Paste Raw Data
            </button>
        </div>

        {/* Screenshot Upload Button */}
        {inputMode === 'manual' && (
             <div className="relative">
                <input 
                    type="file" 
                    id="screenshot-upload" 
                    accept="image/png, image/jpeg" 
                    className="hidden" 
                    onChange={handleImageUpload}
                    disabled={isProcessingImage}
                />
                <label 
                    htmlFor="screenshot-upload" 
                    className={`cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-lg border border-purple-200 flex items-center gap-2 text-sm font-medium transition ${isProcessingImage ? 'opacity-70 pointer-events-none' : ''}`}
                >
                    {isProcessingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    {isProcessingImage ? 'Analyzing Screenshot...' : 'Upload Dashboard Screenshot'}
                </label>
             </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {inputMode === 'manual' ? (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Metrics Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
                            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">Step 1</span>
                            <h3 className="font-semibold text-slate-700">The Numbers (30 Days)</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Cost</label>
                                <input
                                    required
                                    type="number"
                                    name="spend"
                                    value={metrics.spend}
                                    onChange={handleMetricChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none transition text-slate-800 font-medium"
                                    placeholder="$ Spend"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Revenue (Optional)</label>
                                <input
                                    type="number"
                                    name="conversionValue"
                                    value={metrics.conversionValue}
                                    onChange={handleMetricChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
                                    placeholder="$ Value"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Conversions</label>
                                <input
                                    required
                                    type="number"
                                    name="conversions"
                                    value={metrics.conversions}
                                    onChange={handleMetricChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
                                    placeholder="# Conv."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Clicks</label>
                                <input
                                    required
                                    type="number"
                                    name="clicks"
                                    value={metrics.clicks}
                                    onChange={handleMetricChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
                                    placeholder="# Clicks"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Impressions</label>
                                <input
                                    required
                                    type="number"
                                    name="impressions"
                                    value={metrics.impressions}
                                    onChange={handleMetricChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
                                    placeholder="# Impressions"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Opt. Score</label>
                                <input
                                    type="number"
                                    name="optimizationScore"
                                    value={metrics.optimizationScore}
                                    onChange={handleMetricChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none transition"
                                    placeholder="0-100"
                                />
                            </div>
                        </div>

                        {/* Live Calculated Stats */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">
                            <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex justify-between">
                                <span>Calculated KPIs</span>
                                {stats.roas !== '-' && <span className="text-green-600">ROAS Active</span>}
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-center">
                                <div className="bg-white p-2 rounded border border-slate-100 shadow-sm">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">CTR</div>
                                    <div className="font-bold text-slate-700 text-sm">{stats.ctr}</div>
                                </div>
                                <div className="bg-white p-2 rounded border border-slate-100 shadow-sm">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">CPC</div>
                                    <div className="font-bold text-slate-700 text-sm">{stats.cpc}</div>
                                </div>
                                <div className="bg-white p-2 rounded border border-slate-100 shadow-sm">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">CPA</div>
                                    <div className={`font-bold text-sm ${stats.cpa !== '-' ? 'text-purple-600' : 'text-slate-700'}`}>{stats.cpa}</div>
                                </div>
                                <div className="bg-white p-2 rounded border border-slate-100 shadow-sm">
                                    <div className="text-[10px] text-slate-400 uppercase font-bold">ROAS</div>
                                    <div className={`font-bold text-sm ${stats.roas !== '-' ? 'text-green-600' : 'text-slate-300'}`}>{stats.roas}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Context Column */}
                    <div className="space-y-6">
                         
                        {/* URL Auto-fill */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                             <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Auto-fill Context from Website</label>
                             <div className="flex gap-2">
                                <input 
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="https://example.com"
                                    className="flex-1 px-3 py-1.5 rounded border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleUrlAnalysis}
                                    disabled={!urlInput || isProcessingUrl}
                                    className="bg-white px-3 py-1.5 rounded border border-slate-300 text-slate-600 hover:text-purple-600 hover:border-purple-300 transition"
                                >
                                    {isProcessingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                                </button>
                             </div>
                        </div>

                        {/* Step 2: Settings */}
                        <div>
                             <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
                                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">Step 2</span>
                                <h3 className="font-semibold text-slate-700">Settings & Context</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                 <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Bidding Strategy</label>
                                    <select
                                        name="biddingStrategy"
                                        value={metrics.biddingStrategy}
                                        onChange={handleMetricChange}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none bg-white text-sm"
                                    >
                                        <option value="Unknown">I don't know</option>
                                        <option value="Maximize Clicks">Maximize Clicks</option>
                                        <option value="Maximize Conversions">Maximize Conversions</option>
                                        <option value="Target CPA">Target CPA</option>
                                        <option value="Target ROAS">Target ROAS</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Networks</label>
                                    <select
                                        name="networks"
                                        value={metrics.networks}
                                        onChange={handleMetricChange}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none bg-white text-sm"
                                    >
                                        <option value="Search Only">Search Only</option>
                                        <option value="Search + Display Exp">Search + Display Expansion</option>
                                        <option value="Performance Max">Performance Max</option>
                                        <option value="Display Only">Display Only</option>
                                        <option value="Unknown">I don't know</option>
                                    </select>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Est. Quality Score</label>
                                    <select
                                        name="qualityScore"
                                        value={metrics.qualityScore}
                                        onChange={handleMetricChange}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none bg-white text-sm"
                                    >
                                        <option value="Unknown">Unknown</option>
                                        <option value="High (7-10)">High (7-10) - Very Relevant</option>
                                        <option value="Average (4-6)">Average (4-6)</option>
                                        <option value="Low (1-3)">Low (1-3) - Needs Work</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Business Name</label>
                                <input
                                    name="businessName"
                                    value={metrics.businessName}
                                    onChange={handleMetricChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                    placeholder="e.g. Joe's Pizza"
                                />
                            </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Industry / Niche</label>
                                <input
                                    required
                                    name="industry"
                                    value={metrics.industry}
                                    onChange={handleMetricChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                    placeholder="e.g. Local Plumbing"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Services / Products</label>
                                <input
                                    name="productService"
                                    value={metrics.productService}
                                    onChange={handleMetricChange}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                                    placeholder="e.g. Emergency Repairs, Installation"
                                />
                            </div>
                             <div className="space-y-2 mt-3">
                                <label className="text-xs font-bold text-slate-500 uppercase">Main Issue</label>
                                <textarea
                                    name="problem"
                                    value={metrics.problem}
                                    onChange={handleMetricChange}
                                    rows={2}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none resize-none text-sm"
                                    placeholder="e.g. CPA too high, low leads..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        ) : (
            <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 flex gap-3">
                    <HelpCircle className="w-5 h-5 shrink-0" />
                    <div>
                        <p className="font-bold mb-1">For Advanced Users:</p>
                        <p>Paste data from your Google Ads dashboard. Include columns like Campaign Name, Clicks, Impr., Cost, Conversions, Search Impression Share.</p>
                    </div>
                </div>
                <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition font-mono text-sm"
                    placeholder="Paste CSV data or copy rows directly from Google Ads interface..."
                />
            </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition transform active:scale-95 flex items-center gap-2"
          >
            Run Audit Analysis
            <ClipboardList className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuditInputForm;
