
import React, { useState, useEffect } from 'react';
import { UserInput, GeneratedCampaign, AppStatus, AuditReport, GeneratedMetaCampaign, ClientRecord } from './types';
import { generateCampaign, generateAudit, generateMetaCampaign, fetchCompetitors } from './services/gemini';
import { subscribeToAuth, logout, getClients, saveGeneratedCampaign, saveGeneratedAudit, updateProjectFile } from './services/firebase';
import OnboardingWizard from './components/OnboardingWizard';
import CampaignResults from './components/CampaignResults';
import MetaCampaignResults from './components/MetaCampaignResults';
import AuditInputForm from './components/AuditInputForm';
import AuditResults from './components/AuditResults';
import HistoryDashboard from './components/HistoryDashboard';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import ChatInterface from './components/ChatInterface';
import BudgetAllocator from './components/BudgetAllocator';
import GoogleAdsAnalytics from './components/GoogleAdsAnalytics';
import { Layout, Cpu, Search, Activity, Facebook, Loader2, MessageSquare, ArrowRight, ShieldCheck, AlertCircle, LogOut, Save, Check, PieChart, BarChart3 } from 'lucide-react';

const initialUserInput: UserInput = {
  businessName: '', website: '', industry: '', productService: '', location: '', targetAudience: '', painPoints: '', usps: '', offers: '', competitors: '',
  brandVoice: '', primaryOffer: '', visualStyle: '',
  avgSaleValue: '', profitMargin: '', customerLtv: '', targetLeadsPerMonth: '', maxCpa: '',
  goal: 'Leads', conversionDefinition: '', leadToCustomerRate: '',
  competitorDetail: '', seasonality: '', upcomingEvents: '', launchTiming: '',
  monthlyBudget: '', currentMarketingBudget: '', pastExperience: '', targetAdGroupCount: '',
  budgetPreference: 'fixed',
  accountMaturity: 'new',
  assignedClientId: '',
  crmTool: '', hasCustomerMatch: false, trackingStatus: 'None'
};

type AppMode = 'generator' | 'audit' | 'history' | 'chat' | 'allocator' | 'analytics';
type Platform = 'google' | 'meta';
type ViewState = 'landing' | 'login' | 'signup' | 'app';

// Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-24 right-6 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-[200] animate-fade-in-up border ${type === 'success' ? 'bg-slate-900 text-white border-slate-800' : 'bg-red-50 text-red-700 border-red-100'}`}>
      {type === 'success' ? <Check className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
      <span className="font-bold text-sm">{message}</span>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [user, setUser] = useState<any>(null);
  
  // App Logic State
  const [mode, setMode] = useState<AppMode>('generator');
  const [platform, setPlatform] = useState<Platform>('google');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [hasPaidKey, setHasPaidKey] = useState<boolean | null>(null);
  
  // Active Data State
  const [campaign, setCampaign] = useState<GeneratedCampaign | null>(null);
  const [metaCampaign, setMetaCampaign] = useState<GeneratedMetaCampaign | null>(null);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null); // Track loaded file ID
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  const [isAnalyzingCompetitors, setIsAnalyzingCompetitors] = useState(false);
  
  useEffect(() => {
    checkApiKey();
    const unsubscribe = subscribeToAuth((u: any) => {
        if (u) {
            setUser(u);
            setView('app');
            fetchClients(); // Load clients on auth
        } else {
            setUser(null);
            setClients([]);
        }
    });
    return () => unsubscribe();
  }, []);

  // Update Document Title
  useEffect(() => {
    let title = 'Ads Architect';
    if (view === 'login') title = 'Login - Ads Architect';
    else if (view === 'signup') title = 'Sign Up - Ads Architect';
    else if (mode === 'generator') title = `New ${platform === 'meta' ? 'Meta' : 'Google'} Campaign - Ads Architect`;
    else if (mode === 'audit') title = 'Audit - Ads Architect';
    else if (mode === 'history') title = 'History - Ads Architect';
    else if (mode === 'chat') title = 'AI Chat - Ads Architect';
    else if (mode === 'allocator') title = 'Budget Allocator - Ads Architect';
    else if (mode === 'analytics') title = 'Analytics - Ads Architect';

    document.title = title;
  }, [view, mode, platform]);

  const fetchClients = async () => {
      try {
          const data = await getClients();
          setClients(data as ClientRecord[]);
      } catch (e) {
          console.error("Failed to load clients", e);
      }
      };

  const checkApiKey = async () => {
    try {
      const win = window as any;
      if (win.aistudio) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        setHasPaidKey(hasKey);
      }
    } catch (e) {
      setHasPaidKey(false);
    }
  };

  const handleSelectKey = async () => {
    try {
      const win = window as any;
      if (win.aistudio) {
        await win.aistudio.openSelectKey();
        setHasPaidKey(true);
      }
    } catch (e) {
      console.error("Key selection failed", e);
    }
  };

  const handleLogout = async () => {
      await logout();
      setView('landing');
  };

  const handleAutoDiscoverCompetitors = async (partialData: Pick<UserInput, 'businessName' | 'productService' | 'location'>): Promise<string> => {
    setIsAnalyzingCompetitors(true);
    try {
      const result = await fetchCompetitors(partialData.businessName, partialData.productService, partialData.location);
      return result;
    } finally {
      setIsAnalyzingCompetitors(false);
    }
  };

  const handleGenerate = async (data: UserInput) => {
    setStatus(AppStatus.GENERATING_CAMPAIGN);
    setErrorMsg('');
    setCurrentFileId(null); 

    try {
      if (platform === 'google') {
          const resultPart = await generateCampaign(data);
          const fullCampaign = { 
            ...resultPart, 
            id: Math.random().toString(36).substr(2, 9), 
            createdAt: Date.now(), 
            businessName: data.businessName, 
            industry: data.industry, 
            location: data.location 
          };
          setCampaign(fullCampaign);
          
          if (user) {
              const saved = await saveGeneratedCampaign(fullCampaign, 'google', data.assignedClientId);
              setCurrentFileId(saved.id); 
          }
      } else {
          const resultPart = await generateMetaCampaign(data);
          const fullMeta = { 
            ...resultPart, 
            id: Math.random().toString(36).substr(2, 9), 
            createdAt: Date.now(), 
            businessName: data.businessName, 
            industry: data.industry, 
            location: data.location 
          };
          setMetaCampaign(fullMeta as GeneratedMetaCampaign);

          if (user) {
              const saved = await saveGeneratedCampaign(fullMeta as GeneratedMetaCampaign, 'meta', data.assignedClientId);
              setCurrentFileId(saved.id);
          }
      }
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      const isKeyError = err.message?.includes("API key not valid") || err.message?.includes("API_KEY_INVALID") || err.message?.includes("PERMISSION_DENIED");
      setErrorMsg(isKeyError ? "API Key Invalid or Missing. Please select a paid API key to continue." : "Failed to architect strategy. Check connection or API limits.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleAudit = async (dataBlob: string) => {
    setStatus(AppStatus.GENERATING_AUDIT);
    setErrorMsg('');
    setCurrentFileId(null); 
    try {
      const resultPart = await generateAudit(dataBlob);
      const summary = dataBlob.length > 50 ? dataBlob.substring(0, 50) + "..." : "Manual Data";
      
      let businessName = "Unknown Client";
      const nameMatch = dataBlob.match(/Business Name:\s*(.+)/i);
      if (nameMatch && nameMatch[1]) {
          businessName = nameMatch[1].trim();
      }

      const fullAudit: AuditReport = {
          ...resultPart,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: Date.now(),
          sourceSummary: summary,
          businessName
      };
      
      setAuditReport(fullAudit);
      if (user) {
          const saved = await saveGeneratedAudit(fullAudit);
          setCurrentFileId(saved.id);
      }
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      const isKeyError = err.message?.includes("API key not valid") || err.message?.includes("API_KEY_INVALID") || err.message?.includes("PERMISSION_DENIED");
      setErrorMsg(isKeyError ? "API Key Invalid or Missing. Please select a paid API key to continue." : "Audit failed. Ensure data is formatted correctly.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleLoadFromHistory = (item: any) => {
    setCurrentFileId(item.id); 
    if (item.type === 'campaign_google') {
        setCampaign(item.data);
        setPlatform('google');
        setMode('generator');
    } else if (item.type === 'campaign_meta') {
        setMetaCampaign(item.data);
        setPlatform('meta');
        setMode('generator');
    } else if (item.type === 'audit') {
        setAuditReport(item.data);
        setMode('audit');
    } else if (item.budgetAnalysis) {
        setCampaign(item);
        setPlatform('google');
        setMode('generator');
    }
    setStatus(AppStatus.SUCCESS);
  };

  const handleSaveChanges = async () => {
      if (!currentFileId || !user) return;
      setIsSaving(true);
      try {
          if (platform === 'google' && campaign) {
              await updateProjectFile(currentFileId, campaign);
          } else if (platform === 'meta' && metaCampaign) {
              await updateProjectFile(currentFileId, metaCampaign);
          }
          setLastSaved(Date.now());
          setToast({ msg: "Changes Saved Successfully", type: 'success' });
          setTimeout(() => setToast(null), 3000);
      } catch (e) {
          console.error("Save failed", e);
          setErrorMsg("Failed to save changes.");
      }
      setIsSaving(false);
  };

  // --- VIEW CONTROLLERS ---

  if (view === 'landing') {
      return <LandingPage onLogin={() => setView('login')} onSignup={() => setView('signup')} onDemo={() => setView('app')} />;
  }

  if (view === 'login' || view === 'signup') {
      return (
          <Auth 
            view={view} 
            onSwitchView={(v) => setView(v)} 
            onSuccess={() => setView('app')} 
            onBack={() => setView('landing')} 
          />
      );
  }

  // --- MAIN APP ---

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 relative">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setMode('generator'); setStatus(AppStatus.IDLE); setCurrentFileId(null); }}>
            <div className={`p-2 rounded-lg text-white transition-colors duration-500 ${mode === 'audit' ? 'bg-purple-600' : mode === 'chat' ? 'bg-slate-800' : 'bg-google-blue'}`}><Layout className="w-6 h-6" /></div>
            <div><h1 className="text-xl font-black tracking-tight uppercase">AdsArchitect</h1><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Elite ROI Systems</p></div>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200 hidden md:flex">
                <button onClick={() => {setMode('generator'); setStatus(AppStatus.IDLE); setCurrentFileId(null);}} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'generator' ? 'bg-white text-blue-700 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>Generator</button>
                <button onClick={() => {setMode('audit'); setStatus(AppStatus.IDLE);}} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'audit' ? 'bg-white text-purple-700 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>Auditor</button>
                <button onClick={() => {setMode('allocator'); setStatus(AppStatus.IDLE);}} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'allocator' ? 'bg-white text-green-700 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>Allocator</button>
                <button onClick={() => {setMode('chat'); setStatus(AppStatus.IDLE);}} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'chat' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>Advisor</button>
                <button onClick={() => {setMode('analytics'); setStatus(AppStatus.IDLE);}} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'analytics' ? 'bg-white text-cyan-700 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>Analytics</button>
                <button onClick={() => {setMode('history'); setStatus(AppStatus.IDLE);}} className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'history' ? 'bg-white text-slate-800 shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>Dashboard</button>
              </div>
              <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 transition" title="Log Out">
                  <LogOut className="w-5 h-5" />
              </button>
          </div>
          
          {/* Mobile Nav Helper */}
          <div className="flex md:hidden w-full justify-between bg-slate-100 p-1 rounded-xl">
             <button onClick={() => setMode('generator')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg ${mode === 'generator' ? 'bg-white shadow' : ''}`}>Gen</button>
             <button onClick={() => setMode('audit')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg ${mode === 'audit' ? 'bg-white shadow' : ''}`}>Audit</button>
             <button onClick={() => setMode('allocator')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg ${mode === 'allocator' ? 'bg-white shadow' : ''}`}>Alloc</button>
             <button onClick={() => setMode('chat')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg ${mode === 'chat' ? 'bg-white shadow' : ''}`}>Chat</button>
             <button onClick={() => setMode('analytics')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg ${mode === 'analytics' ? 'bg-white shadow' : ''}`}>Data</button>
             <button onClick={() => setMode('history')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg ${mode === 'history' ? 'bg-white shadow' : ''}`}>Dash</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {errorMsg && (
          <div className="mb-6 bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 text-red-700 animate-fade-in shadow-xl ring-8 ring-red-50/30">
             <div className="flex items-center gap-4">
                 <div className="p-3 bg-red-100 rounded-2xl"><AlertCircle className="w-8 h-8" /></div>
                 <div>
                    <div className="font-black uppercase text-xs tracking-[0.2em] mb-1">System Fault Detected</div>
                    <div className="font-bold text-sm leading-relaxed">{errorMsg}</div>
                 </div>
             </div>
             <div className="flex items-center gap-4">
               {errorMsg.includes("paid API key") && (
                   <button onClick={handleSelectKey} className="bg-red-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-200 active:scale-95 transition-all">Select Paid Key</button>
               )}
               <button onClick={() => setErrorMsg('')} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-red-700 bg-white px-6 py-3 rounded-2xl border border-red-100 shadow-sm transition-all">Dismiss</button>
             </div>
          </div>
        )}

        {mode === 'generator' && (
          <>
            {status === AppStatus.IDLE && (
              <div className="space-y-12 animate-fade-in-up">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">Network Selection</h2>
                    <div className="inline-flex bg-white p-2 rounded-[2rem] border-2 border-slate-100 shadow-2xl ring-8 ring-slate-50">
                        <button onClick={()=>setPlatform('google')} className={`px-10 py-4 rounded-3xl text-sm font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${platform==='google'?'bg-google-blue text-white shadow-2xl shadow-blue-200 scale-105':'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}><Search className="w-4 h-4" /> Google Search</button>
                        <button onClick={()=>setPlatform('meta')} className={`px-10 py-4 rounded-3xl text-sm font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-3 ${platform==='meta'?'bg-[#1877F2] text-white shadow-2xl shadow-blue-200 scale-105':'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}><Facebook className="w-4 h-4" /> Meta Ads</button>
                    </div>
                </div>
                <OnboardingWizard initialData={initialUserInput} onSubmit={handleGenerate} platform={platform} clients={clients} onAutoDiscoverCompetitors={handleAutoDiscoverCompetitors} isAnalyzingCompetitors={isAnalyzingCompetitors} />
              </div>
            )}

            {status === AppStatus.GENERATING_CAMPAIGN && (
              <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                <div className="relative mb-12">
                   <div className="bg-google-blue w-24 h-24 rounded-[2rem] flex items-center justify-center relative z-10 shadow-[0_20px_50px_rgba(26,115,232,0.4)]">
                     <Cpu className="w-12 h-12 text-white" />
                   </div>
                   <div className="absolute inset-0 bg-google-blue blur-3xl opacity-30 animate-pulse scale-150"></div>
                </div>
                <div className="text-center max-w-lg">
                  <h3 className="text-4xl font-black tracking-tighter uppercase mb-4">Architecting Strategy...</h3>
                  <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] leading-relaxed">Processing variables with Gemini 2.5 Pro Reasoning Engine (32K Thought Budget)</p>
                </div>
              </div>
            )}

            {status === AppStatus.SUCCESS && (
                <div className="animate-fade-in">
                    <div className="sticky top-[80px] z-40 mb-10 flex flex-wrap justify-between items-center bg-white/95 backdrop-blur-sm px-8 py-4 rounded-[2rem] shadow-xl border border-slate-200 ring-8 ring-slate-50/50">
                        <button onClick={() => { setStatus(AppStatus.IDLE); setCurrentFileId(null); }} className="text-xs font-black text-slate-400 hover:text-google-blue flex items-center gap-3 transition-all group uppercase tracking-widest"><ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-2 transition-transform" /> New Session</button>
                        
                        <div className="flex items-center gap-6">
                           {currentFileId && (
                               <div className="flex items-center gap-3">
                                   {lastSaved && <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Saved {new Date(lastSaved).toLocaleTimeString()}</span>}
                                   <button 
                                      onClick={handleSaveChanges} 
                                      disabled={isSaving}
                                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all ${isSaving ? 'bg-slate-400' : 'bg-google-blue hover:bg-blue-600 active:scale-95'}`}
                                   >
                                       {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                       Save Updates
                                   </button>
                               </div>
                           )}
                           <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest border-l border-slate-100 pl-6">
                              <ShieldCheck className="w-4 h-4 text-google-green" /> ROI Optimized Architecture Ready
                           </div>
                        </div>
                    </div>
                    {platform === 'google' && campaign && (
                        <CampaignResults 
                            campaign={campaign} 
                            onUpdate={(updated) => setCampaign(updated)} 
                        />
                    )}
                    {platform === 'meta' && metaCampaign && (
                        <MetaCampaignResults 
                            campaign={metaCampaign}
                            onUpdate={(updated) => setMetaCampaign(updated)}
                        />
                    )}
                </div>
            )}
          </>
        )}

        {mode === 'audit' && (
          <div className="animate-fade-in">
            {status === AppStatus.IDLE && (
              <div className="space-y-10">
                 <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 uppercase">Performance Auditor</h2>
                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Ingest current account data to identify budget waste and scaling signals.</p>
                 </div>
                 <AuditInputForm onSubmit={handleAudit} />
              </div>
            )}
            {status === AppStatus.GENERATING_AUDIT && (
              <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                 <div className="bg-purple-600 p-6 rounded-[2rem] text-white shadow-2xl mb-12 transform rotate-12"><Activity className="w-12 h-12" /></div>
                 <h3 className="text-3xl font-black uppercase tracking-tighter">Scanning Budget Leakage...</h3>
              </div>
            )}
            {status === AppStatus.SUCCESS && auditReport && (
              <div className="space-y-10">
                 <div className="flex justify-start">
                    <button onClick={() => setStatus(AppStatus.IDLE)} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-purple-600 bg-white px-8 py-3 rounded-2xl border border-slate-200 shadow-lg transition-all flex items-center gap-3 ring-4 ring-slate-50"><ArrowRight className="w-4 h-4 rotate-180" /> Run New Audit</button>
                 </div>
                 <AuditResults report={auditReport} />
              </div>
            )}
          </div>
        )}

        {mode === 'history' && <HistoryDashboard onLoadCampaign={handleLoadFromHistory} onLoadAudit={handleLoadFromHistory} />}

        {mode === 'chat' && <ChatInterface />}

        {mode === 'allocator' && <BudgetAllocator />}

        {mode === 'analytics' && <GoogleAdsAnalytics />}
      </main>
    </div>
  );
}
