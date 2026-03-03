
import React, { useState, useEffect } from 'react';
import { analyzeWebsite, analyzeDiscoveryNotes } from '../services/gemini';
import { UserInput, ClientRecord } from '../types';
import { Search, Loader2, DollarSign, TrendingUp, Calendar, Swords, Globe, Star, Layers, Facebook, Target, ArrowRight, Check, Briefcase, Users, Zap, Palette, ChevronLeft, Wallet, Lock, Wand2, Folder, Video, ShoppingBag, MapPin, Smartphone, LayoutGrid, Image as ImageIcon, AlertTriangle, Lightbulb, MousePointerClick, Heart, Megaphone, FileText, Database } from 'lucide-react';

interface OnboardingWizardProps {
  initialData: UserInput;
  onSubmit: (data: UserInput) => void;
  onAutoDiscoverCompetitors?: (partialData: Pick<UserInput, 'businessName' | 'productService' | 'location'>) => Promise<string>;
  isAnalzyingCompetitors?: boolean;
  platform?: 'google' | 'meta';
  clients?: ClientRecord[];
}

const STEPS = [
  { id: 1, title: 'Discovery', icon: FileText, desc: 'Notes & Context' },
  { id: 2, title: 'Identity', icon: Briefcase, desc: 'Business Core' },
  { id: 3, title: 'Market', icon: Globe, desc: 'Location & Audience' },
  { id: 4, title: 'Data', icon: Database, desc: 'AI Foundation' },
  { id: 5, title: 'Strategy', icon: Zap, desc: 'Offer & Voice' },
  { id: 6, title: 'Economics', icon: DollarSign, desc: 'Budget & Goals' }
];

const GOOGLE_CAMPAIGN_TYPES = [
    { id: 'Search', name: 'Search', icon: Search, description: 'High intent text ads on Google Search.', advice: 'Best for capturing existing demand.' },
    { id: 'PMAX', name: 'Performance Max', icon: LayoutGrid, description: 'All-in-one inventory (Search, YouTube, Maps).', advice: 'Great for scaling with AI automation.' },
    { id: 'DemandGen', name: 'Demand Gen', icon: ImageIcon, description: 'Visual storytelling on YouTube & Discover.', advice: 'Create demand before they search.' },
    { id: 'Display', name: 'Display', icon: ImageIcon, description: 'Visual banner ads across 2M+ sites.', advice: 'Use for retargeting and brand awareness.' },
    { id: 'Local', name: 'Local / Calls', icon: MapPin, description: 'Drive store visits and phone calls.', advice: 'Essential for local service businesses.' },
    { id: 'Video', name: 'Video', icon: Video, description: 'YouTube ads for awareness.', advice: 'Build trust with video content.' },
    { id: 'Shopping', name: 'Shopping', icon: ShoppingBag, description: 'Product listings for e-commerce.', advice: 'Required for selling physical goods.' },
];

const META_CAMPAIGN_OBJECTIVES = [
    { id: 'Leads', name: 'Leads', icon: Users, description: 'Instant Forms or calls from FB/IG.', advice: 'Top choice for service businesses.' },
    { id: 'Sales', name: 'Sales', icon: DollarSign, description: 'Website conversions & purchases.', advice: 'Use if you have a Pixel & E-com store.' },
    { id: 'Awareness', name: 'Awareness', icon: Megaphone, description: 'Maximize reach and video views.', advice: 'Good for new market entry.' },
    { id: 'Traffic', name: 'Traffic', icon: MousePointerClick, description: 'Send clicks to website.', advice: 'Avoid for conversions, good for content.' },
    { id: 'Engagement', name: 'Engagement', icon: Heart, description: 'Get likes, comments, and shares.', advice: 'Build social proof.' },
    { id: 'App', name: 'App Promotion', icon: Smartphone, description: 'Drive mobile app installs.', advice: 'Only for app-based businesses.' },
];

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ initialData, onSubmit, onAutoDiscoverCompetitors, isAnalzyingCompetitors, platform = 'google', clients = [] }) => {
  const [formData, setFormData] = useState<UserInput>({
      ...initialData,
      budgetPreference: initialData.budgetPreference || 'fixed',
      accountMaturity: initialData.accountMaturity || 'new',
      assignedClientId: '',
      campaignTypePreference: platform === 'meta' ? 'Leads' : 'Search' 
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [urlInput, setUrlInput] = useState('');
  const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);
  const [isAnalyzingNotes, setIsAnalyzingNotes] = useState(false);

  const isMeta = platform === 'meta';
  const totalSteps = STEPS.length;

  const selectedType = formData.campaignTypePreference;
  const isVisualCampaign = isMeta || ['PMAX', 'Display', 'Video', 'DemandGen'].includes(selectedType || '');
  const groupLabel = isMeta ? 'Target Ad Sets' : (selectedType === 'PMAX' ? 'Target Asset Groups' : selectedType === 'Video' ? 'Target Topics' : 'Target Ad Groups');

  // Ensure default campaign type matches platform on load
  useEffect(() => {
      if (isMeta && !META_CAMPAIGN_OBJECTIVES.find(c => c.id === formData.campaignTypePreference)) {
          setFormData(prev => ({ ...prev, campaignTypePreference: 'Leads' }));
      } else if (!isMeta && !GOOGLE_CAMPAIGN_TYPES.find(c => c.id === formData.campaignTypePreference)) {
          setFormData(prev => ({ ...prev, campaignTypePreference: 'Search' }));
      }
  }, [platform]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 2: // Identity
        if (!formData.businessName || !formData.website || !formData.industry || !formData.productService) {
          alert("Please fill in all required fields: Business Name, Website, Industry, Product/Service.");
          return false;
        }
        return true;
      case 3: // Market
        if (!formData.location) {
           alert("Please enter a Target Location.");
           return false;
        }
        return true;
      case 4: // Data
        if (!formData.crmTool || !formData.trackingStatus) {
            alert("Please select a CRM and Tracking Status.");
            return false;
        }
        return true;
      case 5: // Strategy
        if (!formData.usps) {
            alert("Please enter at least one USP.");
            return false;
        }
        return true;
      case 6: // Economics
        if (formData.budgetPreference === 'fixed' && !formData.monthlyBudget) {
            alert("Please enter a Monthly Budget.");
            return false;
        }
        if (formData.budgetPreference === 'ai' && !formData.targetLeadsPerMonth) {
            alert("Please enter a Target Leads/Sales goal.");
            return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
      if (validateStep(currentStep)) {
          setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      }
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleCompetitorDiscovery = async () => {
    if (!onAutoDiscoverCompetitors) return;
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

  const handleNoteAnalysis = async () => {
    if (!formData.discoveryNotes || formData.discoveryNotes.length < 10) {
        alert("Please enter detailed notes to analyze.");
        return;
    }
    setIsAnalyzingNotes(true);
    try {
        const extracted = await analyzeDiscoveryNotes(formData.discoveryNotes);
        setFormData(prev => ({
            ...prev,
            ...extracted,
            // Preserve existing values if extraction is empty, but overwrite if found
            businessName: extracted.businessName || prev.businessName,
            industry: extracted.industry || prev.industry,
            productService: extracted.productService || prev.productService,
            location: extracted.location || prev.location,
            targetAudience: extracted.targetAudience || prev.targetAudience,
            painPoints: extracted.painPoints || prev.painPoints,
            usps: extracted.usps || prev.usps,
            offers: extracted.offers || prev.offers,
            competitors: extracted.competitors || prev.competitors,
            brandVoice: extracted.brandVoice || prev.brandVoice,
            primaryOffer: extracted.primaryOffer || prev.primaryOffer,
            visualStyle: extracted.visualStyle || prev.visualStyle,
            monthlyBudget: extracted.monthlyBudget || prev.monthlyBudget,
            goal: extracted.goal || prev.goal,
        }));
        alert("Notes analyzed! We've pre-filled the form with extracted details.");
        nextStep(); // Auto advance to review
    } catch (e: any) {
        console.error(e);
        const errorString = e instanceof Error ? e.message : JSON.stringify(e);
        if (errorString.includes("API key not valid") || errorString.includes("API_KEY_INVALID") || errorString.includes("PERMISSION_DENIED")) {
            const win = window as any;
            if (win.aistudio) {
                if (confirm("API Key Invalid or Missing. Would you like to select a paid key to continue?")) {
                    await win.aistudio.openSelectKey();
                }
            } else {
                alert("API Key Invalid. Please check your configuration.");
            }
        } else {
            alert("Failed to analyze notes. Please try again.");
        }
    }
    setIsAnalyzingNotes(false);
  };

  const handleUrlAnalysis = async () => {
    if (!urlInput) return;
    setIsAnalyzingUrl(true);
    try {
        const result = await analyzeWebsite(urlInput);
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
    } catch (e: any) {
        console.error(e);
        const errorString = e instanceof Error ? e.message : JSON.stringify(e);
        if (errorString.includes("API key not valid") || errorString.includes("API_KEY_INVALID") || errorString.includes("PERMISSION_DENIED")) {
            const win = window as any;
            if (win.aistudio) {
                if (confirm("API Key Invalid or Missing. Would you like to select a paid key to continue?")) {
                    await win.aistudio.openSelectKey();
                }
            } else {
                alert("API Key Invalid. Please check your configuration.");
            }
        } else {
            alert("An error occurred while analyzing the website. Please check the URL and try again.");
        }
    }
    setIsAnalyzingUrl(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between items-center mb-10 relative">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
      <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 rounded-full -z-10" style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}></div>
      
      {STEPS.map((step) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        
        return (
          <div key={step.id} className="flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${isActive ? 'bg-white border-blue-500 text-blue-600 shadow-lg scale-110' : isCompleted ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
              {isCompleted ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
            </div>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{step.title}</div>
          </div>
        )
      })}
    </div>
  );

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 md:p-12 max-w-4xl mx-auto animate-fade-in-up relative overflow-hidden">
      {/* Platform Badge */}
      <div className={`absolute top-0 right-0 px-6 py-3 rounded-bl-[2rem] font-black uppercase text-xs tracking-widest text-white shadow-lg ${isMeta ? 'bg-[#1877F2]' : 'bg-google-blue'}`}>
        {isMeta ? 'Meta Ads Engine' : 'Google Ads Engine'}
      </div>

      {renderStepIndicator()}

      {/* URL Import (Visible on Step 2 only - moved from Step 1) */}
      {currentStep === 2 && (
         <div className="mb-8 bg-slate-50/80 p-6 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col sm:flex-row gap-4 items-center animate-fade-in">
             <div className="flex-1 w-full">
                <div className="flex items-center gap-2 mb-2">
                   <Globe className={`w-4 h-4 ${isMeta ? 'text-blue-600' : 'text-google-blue'}`} />
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Auto-Fill from Website</span>
                </div>
                <input 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://yourwebsite.com"
                    className="w-full bg-white px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:border-transparent outline-none transition text-sm font-medium"
                />
             </div>
             <button
                type="button"
                onClick={handleUrlAnalysis}
                disabled={!urlInput || isAnalyzingUrl}
                className="w-full sm:w-auto mt-6 sm:mt-0 bg-white px-6 py-3.5 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 font-black uppercase text-xs tracking-widest transition flex items-center justify-center gap-2 shadow-sm"
             >
                {isAnalyzingUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analyze"}
             </button>
         </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8 min-h-[400px]">
        
        {/* STEP 1: DISCOVERY NOTES */}
        {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600"><FileText className="w-6 h-6" /></div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Discovery Call Intake</h3>
                            <p className="text-sm text-slate-500 mt-1">Paste your raw notes, transcript, or rough ideas here. Our AI will extract the structured data for you.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Raw Notes / Transcript</label>
                    <textarea 
                        name="discoveryNotes" 
                        value={formData.discoveryNotes || ''} 
                        onChange={handleChange} 
                        rows={12} 
                        className="input-elite resize-none font-mono text-sm leading-relaxed" 
                        placeholder={`Client: "We need more leads for our roofing business in Austin..."\n\n- Budget is around $5k/mo\n- Main competitor is XYZ Roofing\n- They offer free inspections`} 
                    />
                </div>

                <div className="flex justify-end">
                    <button 
                        type="button" 
                        onClick={handleNoteAnalysis}
                        disabled={isAnalyzingNotes || !formData.discoveryNotes}
                        className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAnalyzingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        Analyze & Auto-Fill
                    </button>
                </div>
            </div>
        )}

        {/* STEP 2: IDENTITY */}
        {currentStep === 2 && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Folder className="w-4 h-4" /> Save to Client Portfolio
                    </label>
                    <select 
                        name="assignedClientId" 
                        value={formData.assignedClientId} 
                        onChange={handleChange} 
                        className="input-elite bg-slate-100"
                    >
                        <option value="">-- Unassigned (General) --</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Business Name</label>
                    <input required name="businessName" value={formData.businessName} onChange={handleChange} className="input-elite" placeholder="e.g. Ace Plumbing" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Website URL</label>
                    <input required name="website" value={formData.website} onChange={handleChange} className="input-elite" placeholder="e.g. aceplumbing.com" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Industry / Niche</label>
                    <input required name="industry" value={formData.industry} onChange={handleChange} className="input-elite" placeholder="e.g. Residential Plumbing" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Core Product / Service</label>
                    <input required name="productService" value={formData.productService} onChange={handleChange} className="input-elite" placeholder="e.g. Emergency Repairs" />
                </div>
           </div>
        )}

        {/* STEP 3: MARKET */}
        {currentStep === 3 && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Location</label>
                    <input required name="location" value={formData.location} onChange={handleChange} className="input-elite" placeholder="e.g. Chicago, IL (Metro)" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Top Competitors</label>
                    <div className="flex gap-2">
                        <input name="competitors" value={formData.competitors} onChange={handleChange} className="input-elite flex-1" placeholder="e.g. Bob's Plumbing" />
                        {onAutoDiscoverCompetitors && (
                            <button type="button" onClick={handleCompetitorDiscovery} disabled={isAnalzyingCompetitors} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 rounded-xl border border-slate-200 transition">
                                {isAnalzyingCompetitors ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Competitor Weakness */}
                <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Swords className="w-4 h-4 text-red-500" /> Competitor Weakness (How do they fail?)
                    </label>
                    <input 
                        name="competitorWeakness" 
                        value={formData.competitorWeakness} 
                        onChange={handleChange} 
                        className="input-elite border-red-100 focus:ring-red-100" 
                        placeholder="e.g. They don't answer phones at night, overpriced, rude staff..." 
                    />
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Target Persona & Pain Points</label>
                    <textarea name="targetAudience" value={formData.targetAudience} onChange={handleChange} rows={3} className="input-elite resize-none" placeholder="Who are they? What keeps them up at night?" />
                </div>
           </div>
        )}

        {/* STEP 4: DATA FOUNDATION (AI ESSENTIALS) */}
        {currentStep === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                <div className="md:col-span-2 bg-indigo-50 border border-indigo-100 p-6 rounded-2xl mb-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600"><Database className="w-6 h-6" /></div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">AI Data Foundation</h3>
                            <p className="text-sm text-slate-500 mt-1">AI campaigns (PMax, Demand Gen) require high-quality data signals to work. Let's audit your data readiness.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">CRM / Lead Source</label>
                    <select name="crmTool" value={formData.crmTool} onChange={handleChange} className="input-elite h-[52px]">
                        <option value="">-- Select CRM --</option>
                        <option value="HubSpot">HubSpot</option>
                        <option value="Salesforce">Salesforce</option>
                        <option value="Zoho">Zoho</option>
                        <option value="GoHighLevel">GoHighLevel</option>
                        <option value="Shopify">Shopify (E-com)</option>
                        <option value="Spreadsheets">Spreadsheets / Manual</option>
                        <option value="None">No CRM</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Customer Match List?</label>
                    <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                        <button 
                            type="button" 
                            onClick={() => setFormData(prev => ({ ...prev, hasCustomerMatch: true }))}
                            className={`flex-1 py-3 text-xs font-bold rounded-md transition ${formData.hasCustomerMatch === true ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Yes, I have emails
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setFormData(prev => ({ ...prev, hasCustomerMatch: false }))}
                            className={`flex-1 py-3 text-xs font-bold rounded-md transition ${formData.hasCustomerMatch === false ? 'bg-slate-100 text-slate-700' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            No / Not yet
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-400">Uploading a customer list (hashed) helps AI find "Lookalikes".</p>
                </div>

                <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Conversion Tracking Status</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            { id: 'None', label: 'No Tracking', desc: 'Blind flying. Not recommended.' },
                            { id: 'Basic', label: 'Basic Pixel', desc: 'Page views & simple thank you pages.' },
                            { id: 'Enhanced', label: 'Enhanced Conversions', desc: 'Server-side / Offline Import (Gold Standard).' }
                        ].map((status) => (
                            <div 
                                key={status.id}
                                onClick={() => setFormData(prev => ({ ...prev, trackingStatus: status.id as any }))}
                                className={`cursor-pointer rounded-xl p-4 border transition-all ${formData.trackingStatus === status.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 opacity-60 hover:opacity-100'}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.trackingStatus === status.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
                                        {formData.trackingStatus === status.id && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="font-bold text-sm text-slate-800">{status.label}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 pl-6">{status.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* STEP 5: STRATEGY (Major Update for Meta vs Google) */}
        {currentStep === 5 && (
           <div className="space-y-8 animate-fade-in">
                
                {/* Dynamic Campaign Selection */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <Layers className={`w-4 h-4 ${isMeta ? 'text-blue-600' : 'text-google-blue'}`} /> {isMeta ? 'Meta Objective' : 'Google Campaign Type'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(isMeta ? META_CAMPAIGN_OBJECTIVES : GOOGLE_CAMPAIGN_TYPES).map((type) => {
                            const isSelected = formData.campaignTypePreference === type.id;
                            const Icon = type.icon;
                            
                            return (
                                <div 
                                    key={type.id}
                                    onClick={() => setFormData(prev => ({ ...prev, campaignTypePreference: type.id }))}
                                    className={`cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 relative overflow-hidden group hover:shadow-md ${isSelected ? (isMeta ? 'border-blue-600 bg-white shadow-md' : 'border-google-blue bg-white shadow-md') : 'border-slate-200 bg-white hover:border-blue-300'}`}
                                >
                                    {isSelected && (
                                        <div className={`absolute top-0 right-0 text-white px-2 py-1 rounded-bl-lg ${isMeta ? 'bg-blue-600' : 'bg-google-blue'}`}>
                                            <Check className="w-3 h-3" />
                                        </div>
                                    )}
                                    <div className={`mb-3 ${isSelected ? (isMeta ? 'text-blue-600' : 'text-google-blue') : 'text-slate-400 group-hover:text-blue-500'}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h4 className={`font-bold text-sm mb-1 ${isSelected ? 'text-slate-900' : 'text-slate-800'}`}>{type.name}</h4>
                                    <p className="text-[10px] text-slate-500 leading-snug mb-2 font-medium">{type.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" /> Key Unique Selling Points (USPs)
                        </label>
                        <textarea required name="usps" value={formData.usps} onChange={handleChange} rows={3} className="input-elite resize-none" placeholder={`1. 24/7 Response\n2. Family Owned\n3. Best Price Guarantee`} />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest text-blue-600">Primary Hook / Offer</label>
                        <input name="primaryOffer" value={formData.primaryOffer} onChange={handleChange} className="input-elite border-blue-200 focus:ring-blue-200" placeholder="e.g. 50% Off First Service" />
                        <p className="text-[10px] text-slate-400">The "Hook" that stops the scroll.</p>
                    </div>

                    {/* Psychological Angle */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Lightbulb className="w-3 h-3" /> Psychological Angle
                        </label>
                        <select name="psychologicalHook" value={formData.psychologicalHook} onChange={handleChange} className="input-elite h-[52px]">
                            <option value="">-- Select Dominant Emotion --</option>
                            <option value="Fear of Loss (FOMO)">Fear of Loss (FOMO)</option>
                            <option value="Greed/Value (Bang for Buck)">Greed/Value (Best Deal)</option>
                            <option value="Urgency/Scarcity">Urgency/Scarcity</option>
                            <option value="Status/Exclusivity">Status/Exclusivity</option>
                            <option value="Trust/Authority">Trust/Authority</option>
                            <option value="Pain Relief (Immediate)">Pain Relief (Immediate)</option>
                        </select>
                    </div>

                    {/* NEW: Meta Creative Angles */}
                    {isMeta && (
                        <div className="md:col-span-2 space-y-2 animate-fade-in">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 text-blue-600">
                                <Palette className="w-3 h-3" /> Creative Testing Angles (Creative is King)
                            </label>
                            <textarea 
                                name="creativeAngles" 
                                value={formData.creativeAngles} 
                                onChange={handleChange} 
                                rows={2}
                                className="input-elite border-blue-200 focus:ring-blue-100" 
                                placeholder="e.g. 1. Founder Story (Trust), 2. Us vs Them (Comparison), 3. Client Testimonial (Social Proof)" 
                            />
                            <p className="text-[10px] text-slate-400">We will generate ad copy for these specific creative directions.</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Brand Voice</label>
                        <select name="brandVoice" value={formData.brandVoice} onChange={handleChange} className="input-elite h-[52px]">
                            <option value="Professional & Trustworthy">Professional & Trustworthy</option>
                            <option value="Urgent & Direct">Urgent & Direct</option>
                            <option value="Friendly & Approachable">Friendly & Approachable</option>
                            <option value="Luxury & Exclusive">Luxury & Exclusive</option>
                            <option value="Playful & Witty">Playful & Witty</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            {groupLabel}
                        </label>
                        <input 
                            name="targetAdGroupCount" 
                            value={formData.targetAdGroupCount} 
                            onChange={handleChange} 
                            className="input-elite" 
                            placeholder={isMeta ? "e.g. 3 (Audiences)" : selectedType === 'PMAX' ? "e.g. 2 (Asset Groups)" : "e.g. 3 (Service Themes)"} 
                        />
                    </div>

                    {/* NEW: Campaign Structure Preference */}
                    {!isMeta && (
                        <div className="md:col-span-2 space-y-2 animate-fade-in">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Layers className="w-3 h-3 text-slate-500" /> Campaign Structure
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div 
                                    onClick={() => setFormData(prev => ({ ...prev, structurePreference: 'Single Campaign' }))}
                                    className={`cursor-pointer rounded-xl p-4 border transition-all ${formData.structurePreference !== 'Split Campaigns' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-200 opacity-60 hover:opacity-100'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.structurePreference !== 'Split Campaigns' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                                            {formData.structurePreference !== 'Split Campaigns' && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="font-bold text-sm text-slate-800">Consolidated Campaign</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 pl-6">All themes in one campaign. Best for budget efficiency and smart bidding.</p>
                                </div>

                                <div 
                                    onClick={() => setFormData(prev => ({ ...prev, structurePreference: 'Split Campaigns' }))}
                                    className={`cursor-pointer rounded-xl p-4 border transition-all ${formData.structurePreference === 'Split Campaigns' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-200 opacity-60 hover:opacity-100'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.structurePreference === 'Split Campaigns' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}>
                                            {formData.structurePreference === 'Split Campaigns' && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className="font-bold text-sm text-slate-800">Split Campaigns (SKAGs)</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 pl-6">Each theme gets its own campaign. Best for strict budget control per service.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* NEW: Ad Format Preference */}
                    {!isMeta && ['Search', 'Display'].includes(selectedType || '') && (
                         <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <ImageIcon className="w-3 h-3" /> Ad Format Preference
                            </label>
                            <select 
                                name="adFormatPreference" 
                                value={formData.adFormatPreference} 
                                onChange={handleChange} 
                                className="input-elite h-[52px]"
                            >
                                <option value="Mixed">AI Recommended (Best Mix)</option>
                                <option value="Text">Text Ads Only (RSA)</option>
                                {selectedType === 'Display' && <option value="Display">Responsive Display Ads</option>}
                            </select>
                        </div>
                    )}

                    {/* Negative Keywords (Google Search Only) */}
                    {!isMeta && selectedType === 'Search' && (
                        <div className="md:col-span-2 space-y-2 animate-fade-in">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 text-red-600">
                                <AlertTriangle className="w-3 h-3" /> Negative Constraints (What to AVOID)
                            </label>
                            <input 
                                name="negativeKeywords" 
                                value={formData.negativeKeywords} 
                                onChange={handleChange} 
                                className="input-elite border-red-200 focus:ring-red-100" 
                                placeholder="e.g. free, cheap, diy, jobs, employment" 
                            />
                            <p className="text-[10px] text-slate-400">We will strictly exclude these terms to save budget.</p>
                        </div>
                    )}

                    {(isMeta || isVisualCampaign) && (
                        <div className="md:col-span-2 space-y-2 animate-fade-in">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Palette className="w-4 h-4" /> Visual Style Preference
                            </label>
                            <select name="visualStyle" value={formData.visualStyle} onChange={handleChange} className="input-elite h-[52px]">
                                <option value="UGC (User Generated Content) - Authentic">UGC (Authentic/Raw) - Recommended</option>
                                <option value="High-End Cinematic - Premium">High-End Cinematic (Premium)</option>
                                <option value="Minimalist Graphic - Clean">Minimalist Graphic (Clean)</option>
                                <option value="Bright & Pop - Attention Grabbing">Bright & Pop (Attention)</option>
                                <option value="Corporate & Professional">Corporate & Professional</option>
                            </select>
                        </div>
                    )}
                </div>
           </div>
        )}

        {/* STEP 6: ECONOMICS */}
        {currentStep === 6 && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                
                {/* Budget Selection Section */}
                <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-2">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 text-green-700">
                            <div className="bg-green-100 p-2 rounded-lg"><Wallet className="w-5 h-5" /></div>
                            <h4 className="font-bold text-sm uppercase tracking-wide">Investment & Strategy</h4>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 1. Account Maturity */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Account History</label>
                            <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                                <button 
                                    type="button" 
                                    onClick={() => setFormData(prev => ({ ...prev, accountMaturity: 'new' }))}
                                    className={`flex-1 py-2 text-xs font-bold rounded-md transition ${formData.accountMaturity === 'new' ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    New Account (No Data)
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setFormData(prev => ({ ...prev, accountMaturity: 'mature' }))}
                                    className={`flex-1 py-2 text-xs font-bold rounded-md transition ${formData.accountMaturity === 'mature' ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    Mature Account (Has Data)
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400">
                                {formData.accountMaturity === 'new' 
                                    ? "We'll suggest 'Maximize Clicks' to gather data." 
                                    : "We'll suggest Target CPA/ROAS for efficiency."}
                            </p>
                        </div>

                        {/* 2. Budget Preference */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Budget Mode</label>
                            <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                                <button 
                                    type="button" 
                                    onClick={() => setFormData(prev => ({ ...prev, budgetPreference: 'fixed' }))}
                                    className={`flex-1 py-2 text-xs font-bold rounded-md transition ${formData.budgetPreference === 'fixed' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    Fixed Budget
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setFormData(prev => ({ ...prev, budgetPreference: 'ai' }))}
                                    className={`flex-1 py-2 text-xs font-bold rounded-md transition ${formData.budgetPreference === 'ai' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    AI Calculated
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Dynamic Input based on Preference */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        {formData.budgetPreference === 'fixed' ? (
                            <div className="space-y-2 animate-fade-in">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <Lock className="w-3 h-3 text-slate-400" /> Your Monthly Budget ($)
                                </label>
                                <input 
                                    name="monthlyBudget" 
                                    value={formData.monthlyBudget} 
                                    onChange={handleChange} 
                                    className="input-elite border-blue-300 focus:ring-blue-100 text-blue-900 font-bold text-lg" 
                                    placeholder="e.g. 5000" 
                                    required={formData.budgetPreference === 'fixed'}
                                    type="number"
                                    min="0"
                                />
                            </div>
                        ) : (
                            <div className="space-y-2 animate-fade-in">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <Wand2 className="w-3 h-3 text-purple-500" /> Target Leads/Sales per Month
                                </label>
                                <input 
                                    name="targetLeadsPerMonth" 
                                    value={formData.targetLeadsPerMonth} 
                                    onChange={handleChange} 
                                    className="input-elite border-purple-300 focus:ring-purple-100 text-purple-900 font-bold text-lg" 
                                    placeholder="e.g. 50" 
                                    required={formData.budgetPreference === 'ai'}
                                    type="number"
                                    min="0"
                                />
                                <p className="text-[10px] text-slate-500">We will calculate the budget needed to hit this goal.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg. Sale Value ($)</label>
                    <input 
                        name="avgSaleValue" 
                        value={formData.avgSaleValue} 
                        onChange={handleChange} 
                        className="input-elite" 
                        placeholder="e.g. 250" 
                        type="number"
                        min="0"
                    />
                </div>
                {/* NEW: LTV Field */}
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Lifetime Value (LTV) $</label>
                    <input 
                        name="customerLtv" 
                        value={formData.customerLtv} 
                        onChange={handleChange} 
                        className="input-elite" 
                        placeholder="e.g. 1500 (Optional)" 
                        type="number"
                        min="0"
                    />
                </div>
                
                {/* NEW: Launch Timing */}
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Launch Urgency</label>
                    <select name="launchTiming" value={formData.launchTiming} onChange={handleChange} className="input-elite h-[52px]">
                        <option value="">-- When to launch? --</option>
                        <option value="ASAP (Within 7 Days)">ASAP (Within 7 Days)</option>
                        <option value="This Month">This Month</option>
                        <option value="Next Quarter">Next Quarter</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Max CPA Limit ($)</label>
                    <input name="maxCpa" value={formData.maxCpa} onChange={handleChange} className="input-elite" placeholder="Optional max cost per result" type="number" min="0" />
                </div>
           </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-8 mt-4 border-t border-slate-50">
           {currentStep > 1 ? (
             <button type="button" onClick={prevStep} className="text-slate-500 font-bold text-sm flex items-center gap-2 hover:text-slate-800 transition px-4 py-2">
                <ChevronLeft className="w-4 h-4" /> Back
             </button>
           ) : <div></div>}

           {currentStep < totalSteps ? (
             <button type="button" onClick={nextStep} className={`bg-slate-900 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-slate-800 transition flex items-center gap-2 uppercase text-xs tracking-widest`}>
                Next Step <ArrowRight className="w-4 h-4" />
             </button>
           ) : (
             <button type="submit" className={`font-black py-4 px-10 rounded-xl shadow-xl hover:shadow-2xl transition transform hover:-translate-y-1 active:scale-95 flex items-center gap-3 text-white uppercase text-xs tracking-[0.2em] ${isMeta ? 'bg-[#1877F2]' : 'bg-google-blue'}`}>
                Architect Strategy <Zap className="w-5 h-5 fill-white" />
             </button>
           )}
        </div>
      </form>
      
      <style>{`
        .input-elite {
            width: 100%;
            padding: 1rem 1.25rem;
            border-radius: 0.75rem;
            border: 1px solid #e2e8f0;
            background-color: #f8fafc;
            font-weight: 600;
            color: #1e293b;
            outline: none;
            transition: all 0.2s;
        }
        .input-elite:focus {
            background-color: #ffffff;
            border-color: ${isMeta ? '#60a5fa' : '#4285f4'};
            box-shadow: 0 0 0 4px ${isMeta ? 'rgba(96, 165, 250, 0.1)' : 'rgba(66, 133, 244, 0.1)'};
        }
      `}</style>
    </div>
  );
};

export default OnboardingWizard;
