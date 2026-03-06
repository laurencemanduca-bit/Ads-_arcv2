
import React, { useState } from 'react';
import { UserInput } from '../types';
import { Search, Loader2, DollarSign, TrendingUp, Calendar, Swords, Globe, Star, Layers, Facebook, Target } from 'lucide-react';
import { analyzeWebsite } from '../services/gemini';

interface InputFormProps {
  initialData: UserInput;
  onSubmit: (data: UserInput) => void;
  onAutoDiscoverCompetitors: (partialData: Pick<UserInput, 'businessName' | 'productService' | 'location'>) => Promise<string>;
  isAnalyzingCompetitors: boolean;
  platform?: 'google' | 'meta'; // New prop
}

const InputForm: React.FC<InputFormProps> = ({ initialData, onSubmit, onAutoDiscoverCompetitors, isAnalyzingCompetitors, platform = 'google' }) => {
  const [formData, setFormData] = useState<UserInput>(initialData);
  const [urlInput, setUrlInput] = useState('');
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);

  const isMeta = platform === 'meta';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCompetitorDiscovery = async () => {
    if (!formData.businessName || !formData.productService || !formData.location) {
      alert("Please fill in Business Name, Product/Service, and Location first to use Auto Discovery.");
      return;
    }
    const competitors = await onAutoDiscoverCompetitors({
      businessName: formData.businessName,
      productService: formData.productService,
      location: formData.location
    });

    if (!competitors || competitors.trim() === "" || competitors.includes("Could not identify")) {
       alert("Competitor discovery could not find exact matches. Please verify the business details or enter competitors manually.");
    }
    
    setFormData(prev => ({ ...prev, competitors: competitors }));
  };

  const handleUrlAnalysis = async () => {
    if (!urlInput) return;
    setIsAnalyzingUrl(true);
    try {
        const result = await analyzeWebsite(urlInput);
        
        // Check if we got meaningful data (ignoring if result is empty object)
        const hasData = result && (result.businessName || result.industry || result.productService);
        
        if (!hasData) {
             alert("Could not extract meaningful business details from this URL. Please verify the link or enter details manually.");
        } else {
             setFormData(prev => ({
                ...prev,
                website: urlInput,
                businessName: result.businessName || prev.businessName || '',
                industry: result.industry || prev.industry || '',
                productService: result.productService || prev.productService || '',
                location: result.location || prev.location || '',
                targetAudience: result.targetAudience || prev.targetAudience || '',
                usps: result.usps || prev.usps || ''
            }));
        }
    } catch (e) {
        console.error(e);
        alert("An error occurred while analyzing the website. Please check the URL and try again.");
    }
    setIsAnalyzingUrl(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <span className={`text-white rounded-lg p-1.5 text-sm ${isMeta ? 'bg-blue-600' : 'bg-google-blue'}`}>1</span>
        {isMeta ? 'Meta (FB/IG) Discovery' : 'Google Ads Discovery'}
      </h2>

      {/* URL Import Feature */}
      <div className="mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
         <label className="text-sm font-bold text-slate-700 mb-2 block flex items-center gap-2">
            <Globe className={`w-4 h-4 ${isMeta ? 'text-blue-600' : 'text-google-blue'}`} /> Import from Website
         </label>
         <div className="flex gap-2">
            <input 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://yourwebsite.com"
                className={`flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 outline-none ${isMeta ? 'focus:ring-blue-600' : 'focus:ring-google-blue'}`}
            />
            <button
                type="button"
                onClick={handleUrlAnalysis}
                disabled={!urlInput || isAnalyzingUrl}
                className={`bg-white px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition flex items-center gap-2 min-w-[100px] justify-center ${isMeta ? 'hover:border-blue-600 hover:text-blue-600' : 'hover:border-google-blue hover:text-google-blue'}`}
            >
                {isAnalyzingUrl ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Analyzing
                    </>
                ) : "Analyze"}
            </button>
         </div>
         <p className="text-xs text-slate-500 mt-2">Enter your URL to automatically fill in business details.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: BUSINESS BASICS */}
        <div>
           <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-100 pb-2 mb-4">Business Basics</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Business Name</label>
                    <input
                    required
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:border-transparent outline-none transition ${isMeta ? 'focus:ring-blue-600' : 'focus:ring-google-blue'}`}
                    placeholder="e.g. Ace Plumbing"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Website URL</label>
                    <input
                    required
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:border-transparent outline-none transition ${isMeta ? 'focus:ring-blue-600' : 'focus:ring-google-blue'}`}
                    placeholder="e.g. aceplumbing.com"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Industry / Niche (Be Specific)</label>
                    <input
                    required
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:border-transparent outline-none transition ${isMeta ? 'focus:ring-blue-600' : 'focus:ring-google-blue'}`}
                    placeholder="e.g. Personal Injury Lawyer (not just Legal)"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Product / Service</label>
                    <input
                    required
                    name="productService"
                    value={formData.productService}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:border-transparent outline-none transition ${isMeta ? 'focus:ring-blue-600' : 'focus:ring-google-blue'}`}
                    placeholder="e.g. Emergency Residential Plumbing"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                         <Layers className="w-4 h-4 text-slate-400" /> {isMeta ? 'Desired Ad Set Count' : 'Desired Ad Group Count'}
                    </label>
                    <input
                    name="targetAdGroupCount"
                    value={formData.targetAdGroupCount}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:border-transparent outline-none transition ${isMeta ? 'focus:ring-blue-600' : 'focus:ring-google-blue'}`}
                    placeholder="e.g. 3 (Optional - Leave blank for AI auto)"
                    />
                    <p className="text-xs text-slate-500">
                        {isMeta ? "Target different audiences (e.g., Broad, Interests, Lookalikes)." : "If you have multiple services, we'll auto-split them."}
                    </p>
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Star className="w-4 h-4 text-google-yellow fill-google-yellow" />
                        Top 3 Unique Selling Points (USPs)
                    </label>
                    <textarea
                    required
                    name="usps"
                    value={formData.usps}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:border-transparent outline-none transition resize-none ${isMeta ? 'focus:ring-blue-600' : 'focus:ring-google-blue'}`}
                    placeholder={`1. 24/7 Service Response\n2. Family Owned Since 1990\n3. Lowest Price Guarantee`}
                    />
                </div>
           </div>
        </div>

        {/* SECTION 2: OBJECTIVE / GOALS (Moved Up for better visibility) */}
        <div>
           <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-slate-500" /> Campaign Objective
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Primary Goal</label>
                    <select
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:border-transparent outline-none transition bg-white ${isMeta ? 'focus:ring-blue-600' : 'focus:ring-google-blue'}`}
                    >
                    <option value="Leads">Generate Leads (Form Fills)</option>
                    <option value="Sales">Drive Sales (E-commerce)</option>
                    <option value="Calls">Get Phone Calls</option>
                    <option value="Store Visits">Drive Store Visits</option>
                    <option value="Brand Awareness">Brand Awareness & Reach</option>
                    <option value="App Promotion">App Installs & Engagement</option>
                    <option value="Website Traffic">Website Traffic</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Success Definition</label>
                    <input
                    name="conversionDefinition"
                    value={formData.conversionDefinition}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:border-transparent outline-none transition ${isMeta ? 'focus:ring-blue-600' : 'focus:ring-google-blue'}`}
                    placeholder="e.g. Thank you page load after signup"
                    />
                </div>
           </div>
        </div>

        {/* SECTION 3: TARGETING & COMPETITION */}
        <div>
           <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-100 pb-2 mb-4">Targeting & Competition</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Target Location</label>
                    <input
                    required
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:border-transparent outline-none transition ${isMeta ? 'focus:ring-blue-600' : 'focus:ring-google-blue'}`}
                    placeholder="e.g. Chicago, IL (Metro Area)"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Top Competitors</label>
                    <div className="flex gap-2">
                    <input
                        name="competitors"
                        value={formData.competitors}
                        onChange={handleChange}
                        className={`flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:border-transparent outline-none transition ${isMeta ? 'focus:ring-blue-600' : 'focus:ring-google-blue'}`}
                        placeholder="e.g. Bob's Pipes, CityWide..."
                    />
                    <button
                        type="button"
                        onClick={handleCompetitorDiscovery}
                        disabled={isAnalyzingCompetitors}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 transition border border-slate-300 text-sm font-medium disabled:opacity-50 min-w-[80px] justify-center"
                    >
                        {isAnalyzingCompetitors ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        <span className="hidden sm:inline">Auto</span>
                    </button>
                    </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Target Audience & Pain Points</label>
                    <textarea
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleChange}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:border-transparent outline-none transition resize-none ${isMeta ? 'focus:ring-blue-600' : 'focus:ring-google-blue'}`}
                    placeholder="e.g. Homeowners 30-60. Pain: Burst pipes at night, overpriced rates."
                    />
                </div>
           </div>
        </div>

        {/* SECTION 4: ECONOMICS */}
        <div className={`${isMeta ? 'bg-blue-50 border-blue-100' : 'bg-blue-50 border-blue-100'} p-6 rounded-xl border`}>
           <h3 className={`text-lg font-bold border-b pb-2 mb-4 flex items-center gap-2 ${isMeta ? 'text-blue-900 border-blue-200' : 'text-blue-900 border-blue-200'}`}>
               <DollarSign className="w-5 h-5" /> Economics & Budget
           </h3>
           <p className="text-sm text-blue-700 mb-4">Used to calculate your break-even CPA and ideal budget health.</p>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-blue-900">Avg. Sale Value ($)</label>
                    <input
                    name="avgSaleValue"
                    value={formData.avgSaleValue}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="e.g. 250"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-blue-900">Profit Margin (%)</label>
                    <input
                    name="profitMargin"
                    value={formData.profitMargin}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="e.g. 40"
                    />
                </div>
                 <div className="space-y-2">
                    <label className="text-sm font-semibold text-blue-900">Max CPA Limit ($)</label>
                    <div className="text-xs text-blue-700 mb-1 opacity-80">Most you'd pay for 1 customer</div>
                    <input
                    name="maxCpa"
                    value={formData.maxCpa}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="e.g. 100"
                    />
                </div>
           </div>
           
           <div className="w-full h-px bg-blue-200 my-4"></div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
               <div className="space-y-2">
                    <label className="text-sm font-semibold text-blue-900">Target Leads / Sales per Month</label>
                    <input
                    name="targetLeadsPerMonth"
                    value={formData.targetLeadsPerMonth}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="e.g. 50"
                    />
               </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-blue-900">Existing Monthly Budget ($)</label>
                    <input
                    name="monthlyBudget"
                    value={formData.monthlyBudget}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Leave blank to calculate"
                    />
                </div>
           </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className={`font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition transform active:scale-95 flex items-center gap-2 text-white ${isMeta ? 'bg-blue-600 hover:bg-blue-700' : 'bg-google-blue hover:bg-blue-700'}`}
          >
            {isMeta ? 'Generate Meta Strategy' : 'Generate Google Strategy'}
            <span className="text-xl">✨</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default InputForm;
