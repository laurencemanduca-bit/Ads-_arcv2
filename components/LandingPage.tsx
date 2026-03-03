
import React from 'react';
import { ArrowRight, Check, Zap, Target, BarChart3, ShieldCheck, Play, Layout, Cpu, Globe, Users, Star, ChevronRight, TrendingUp } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
  onDemo: () => void;
}

const FeatureCard = ({ icon: Icon, title, desc, color }: any) => (
  <div className="group p-8 rounded-[2rem] bg-white border border-slate-200 hover:border-blue-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700 opacity-50`}></div>
    <div className={`w-14 h-14 bg-${color}-50 rounded-2xl flex items-center justify-center mb-6 text-${color}-600 relative z-10`}>
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="font-bold text-xl mb-3 text-slate-900 relative z-10">{title}</h3>
    <p className="text-slate-600 leading-relaxed text-sm relative z-10 font-medium">{desc}</p>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onSignup, onDemo }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200">
              <Layout className="w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight uppercase text-slate-900">AdsArchitect</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
             <a href="#features" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition">Capabilities</a>
             <a href="#workflow" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition">Workflow</a>
             <a href="#pricing" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onLogin} className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 hidden sm:block">
              Sign In
            </button>
            <button onClick={onSignup} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100 shadow-sm animate-fade-in-up">
              <Zap className="w-3 h-3 fill-current" />
              <span>Gemini 3.0 Pro Reasoning Engine</span>
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-black tracking-tighter text-slate-900 leading-[1.05] animate-fade-in-up delay-100">
              Stop Guessing.<br />
              Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dominating.</span>
            </h1>
            
            <p className="text-xl text-slate-500 leading-relaxed max-w-lg font-medium animate-fade-in-up delay-200">
              The first AI Ad Architect that builds full-funnel Google & Meta campaigns, audits performance, and generates 4K creatives with deep strategic reasoning.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
              <button onClick={onSignup} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-2xl transition transform hover:-translate-y-1 flex items-center justify-center gap-3">
                Build Strategy Free <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={onDemo} className="bg-white text-slate-700 border-2 border-slate-200 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:border-slate-300 hover:bg-slate-50 transition flex items-center justify-center gap-3">
                <Play className="w-4 h-4 fill-slate-700" /> Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-6 pt-6 animate-fade-in-up delay-500">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shadow-sm">
                            <Users className="w-4 h-4" />
                        </div>
                    ))}
                </div>
                <div className="text-sm font-bold text-slate-600">
                    Trusted by 2,000+ Agencies
                    <div className="flex gap-1 mt-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />)}
                    </div>
                </div>
            </div>
          </div>

          {/* Hero Visual - Dashboard Mockup */}
          <div className="relative animate-fade-in delay-300 hidden lg:block">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-gradient-to-tr from-blue-100/50 to-purple-100/50 rounded-full blur-3xl -z-10"></div>
             
             <div className="relative z-10 perspective-1000">
                <div className="bg-white rounded-[2rem] p-4 shadow-2xl border border-slate-200 transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-700 ease-out-expo">
                    <div className="bg-slate-900 rounded-[1.5rem] overflow-hidden shadow-inner border border-slate-800">
                        {/* Fake Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                            </div>
                            <div className="flex gap-3 text-[10px] font-mono text-slate-500">
                                <span>CPU: 12%</span>
                                <span>MEM: 3.4GB</span>
                                <span className="text-green-400">GEMINI: ONLINE</span>
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-8 grid grid-cols-12 gap-6 bg-slate-900">
                            {/* Sidebar */}
                            <div className="col-span-3 space-y-3">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className={`h-10 rounded-lg ${i===1 ? 'bg-blue-600 shadow-lg shadow-blue-900/50' : 'bg-slate-800/50'}`}></div>
                                ))}
                            </div>
                            
                            {/* Main Area */}
                            <div className="col-span-9 space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                        <div className="text-slate-400 text-xs font-bold uppercase mb-2">Total ROI</div>
                                        <div className="text-2xl font-black text-white">482%</div>
                                        <div className="h-1 w-full bg-slate-700 rounded-full mt-3 overflow-hidden">
                                            <div className="h-full bg-green-500 w-[70%]"></div>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                        <div className="text-slate-400 text-xs font-bold uppercase mb-2">Ad Spend</div>
                                        <div className="text-2xl font-black text-white">$12.4k</div>
                                        <div className="h-1 w-full bg-slate-700 rounded-full mt-3 overflow-hidden">
                                            <div className="h-full bg-blue-500 w-[45%]"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                            <Cpu className="w-4 h-4 text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold text-sm">AI Optimization Active</div>
                                            <div className="text-slate-400 text-xs">Analyzing 2,400 data points...</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-2 bg-slate-700 rounded-full w-full"></div>
                                        <div className="h-2 bg-slate-700 rounded-full w-3/4"></div>
                                        <div className="h-2 bg-slate-700 rounded-full w-5/6"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Floating Element */}
                <div className="absolute -bottom-10 -left-10 bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-4 animate-bounce-slow">
                    <div className="bg-green-100 p-3 rounded-xl text-green-600">
                        <Check className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-900">Campaign Ready</div>
                        <div className="text-xs text-slate-500">Generated in 4.2s</div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Social Proof Strip */}
      <div className="border-y border-slate-200 bg-white/50 py-12 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Powering Growth For</p>
              <div className="flex justify-center items-center gap-12 lg:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap">
                  {/* Logos (Placeholders) */}
                  <div className="text-2xl font-black text-slate-800 flex items-center gap-2"><Globe className="w-6 h-6" /> GLOBAL</div>
                  <div className="text-2xl font-black text-slate-800 flex items-center gap-2"><Target className="w-6 h-6" /> ACME Ads</div>
                  <div className="text-2xl font-black text-slate-800 flex items-center gap-2"><Zap className="w-6 h-6" /> BOLT</div>
                  <div className="text-2xl font-black text-slate-800 flex items-center gap-2"><Cpu className="w-6 h-6" /> TECHFLOW</div>
                  <div className="text-2xl font-black text-slate-800 flex items-center gap-2"><BarChart3 className="w-6 h-6" /> SCALER</div>
              </div>
          </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-32 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">One Platform. <br/>Complete Domination.</h2>
                <p className="text-lg text-slate-500 font-medium">Replace your expensive agency retainers with an AI that never sleeps, never misses a keyword, and optimizes 24/7.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FeatureCard 
                    icon={Target} 
                    color="blue"
                    title="Google Ads" 
                    desc="SKAG/STAG structure generation, negative keyword moats, and RSA copy that hits 100% Ad Strength." 
                />
                <FeatureCard 
                    icon={Layout} 
                    color="indigo"
                    title="Meta Funnels" 
                    desc="Full-funnel architecture (TOF/MOF/BOF) with audience targeting matrices and creative hooks." 
                />
                <FeatureCard 
                    icon={BarChart3} 
                    color="purple"
                    title="Instant Audit" 
                    desc="Upload your dashboard screenshot. Our vision AI identifies wasted spend and scaling gaps in seconds." 
                />
            </div>
        </div>
      </div>

      {/* Workflow Section - Dark Mode */}
      <div id="workflow" className="py-32 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
              <div className="absolute top-10 left-10 w-96 h-96 bg-blue-600 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600 rounded-full blur-[100px]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-16">
                  <div className="lg:w-1/2 space-y-8">
                      <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                          The Architect's<br/>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">3-Step Workflow</span>
                      </h2>
                      <p className="text-slate-400 text-lg font-medium">From blank page to live campaign in under 60 seconds.</p>
                      
                      <div className="space-y-6 pt-4">
                          {[
                              { title: "Input Business Core", desc: "Paste your website URL. We extract USPs, products, and competitors instantly." },
                              { title: "Select Strategy Engine", desc: "Choose Google for intent capture or Meta for demand generation." },
                              { title: "Launch & Scale", desc: "Get a ready-to-upload campaign structure, ad copy, and budget forecast." }
                          ].map((step, i) => (
                              <div key={i} className="flex gap-6 group cursor-default">
                                  <div className="flex-col items-center hidden sm:flex">
                                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors ${i===0 ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-700 text-slate-700 group-hover:border-blue-500 group-hover:text-blue-500'}`}>
                                          {i+1}
                                      </div>
                                      {i !== 2 && <div className="w-0.5 h-12 bg-slate-800 my-2 group-hover:bg-slate-700"></div>}
                                  </div>
                                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-all flex-1">
                                      <h4 className="font-bold text-xl mb-2 text-white">{step.title}</h4>
                                      <p className="text-slate-400 text-sm">{step.desc}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                  
                  {/* Right Side Visual */}
                  <div className="lg:w-1/2">
                      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-2 border border-slate-700 shadow-2xl">
                          <div className="bg-slate-950 rounded-[2rem] overflow-hidden relative min-h-[500px] flex items-center justify-center">
                              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                              
                              {/* Central Hub Animation */}
                              <div className="relative z-10 flex flex-col items-center gap-8">
                                  <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.5)] animate-pulse">
                                      <Cpu className="w-12 h-12 text-white" />
                                  </div>
                                  <div className="space-y-3 text-center">
                                      <div className="bg-slate-800/80 px-6 py-2 rounded-full border border-slate-700 text-sm font-mono text-green-400 flex items-center gap-2 mx-auto w-fit">
                                          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                                          Processing 32k Tokens
                                      </div>
                                      <div className="bg-slate-800/80 px-6 py-2 rounded-full border border-slate-700 text-sm font-mono text-blue-400">
                                          Optimizing Bidding Strategy
                                      </div>
                                      <div className="bg-slate-800/80 px-6 py-2 rounded-full border border-slate-700 text-sm font-mono text-purple-400">
                                          Generating 12 Creative Angles
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Pricing / CTA Section */}
      <div id="pricing" className="py-32 px-6">
          <div className="max-w-5xl mx-auto bg-blue-600 rounded-[3rem] p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-200">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                  <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-[100px]"></div>
                  <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500 rounded-full blur-[100px]"></div>
              </div>
              
              <div className="relative z-10 space-y-8">
                  <h2 className="text-4xl lg:text-6xl font-black tracking-tighter">Ready to Scale?</h2>
                  <p className="text-xl text-blue-100 max-w-2xl mx-auto font-medium">Join 2,000+ marketers generating high-ROI campaigns in minutes. No credit card required for the free tier.</p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
                      <button onClick={onSignup} className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-blue-50 hover:scale-105 transition flex items-center justify-center gap-3">
                          Start For Free <Zap className="w-4 h-4 fill-current" />
                      </button>
                      <button onClick={onDemo} className="bg-blue-700 text-white border-2 border-blue-500 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-800 transition flex items-center justify-center gap-3">
                          Book Enterprise Demo
                      </button>
                  </div>
                  
                  <div className="pt-8 flex justify-center gap-8 text-sm font-bold text-blue-200 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Free Forever Plan</span>
                      <span className="flex items-center gap-2"><Check className="w-4 h-4" /> No Credit Card</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-20 pb-10">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-2">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="bg-slate-900 p-2 rounded-lg text-white">
                        <Layout className="w-5 h-5" />
                    </div>
                    <span className="font-black text-xl tracking-tight uppercase text-slate-900">AdsArchitect</span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs font-medium">
                      The industry standard AI for performance marketing strategy. Built for agencies, media buyers, and growth teams.
                  </p>
              </div>
              <div>
                  <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Product</h4>
                  <ul className="space-y-4 text-sm text-slate-500 font-medium">
                      <li><a href="#" className="hover:text-blue-600 transition">Google Ads Generator</a></li>
                      <li><a href="#" className="hover:text-blue-600 transition">Meta Ads Generator</a></li>
                      <li><a href="#" className="hover:text-blue-600 transition">Performance Auditor</a></li>
                  </ul>
              </div>
              <div>
                  <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Company</h4>
                  <ul className="space-y-4 text-sm text-slate-500 font-medium">
                      <li><a href="#" className="hover:text-blue-600 transition">About Us</a></li>
                      <li><a href="#" className="hover:text-blue-600 transition">Pricing</a></li>
                      <li><a href="#" className="hover:text-blue-600 transition">Contact</a></li>
                      <li><a href="#" className="hover:text-blue-600 transition">Privacy Policy</a></li>
                  </ul>
              </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-xs text-slate-400 font-medium">© 2026 AdsArchitect AI. All rights reserved.</div>
              <div className="flex gap-6">
                  <Globe className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
                  <TrendingUp className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer" />
              </div>
          </div>
      </footer>
    </div>
  );
};

export default LandingPage;
