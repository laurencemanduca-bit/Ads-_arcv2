
import React from 'react';
import { AuditReport } from '../types';
import { TrendingUp, AlertTriangle, Zap, Target, Activity, Calendar, Check, X, ArrowRight, DollarSign, BarChart3, AlertOctagon, Layers, Download } from 'lucide-react';

interface AuditResultsProps {
  report: AuditReport;
}

const HealthGauge: React.FC<{ score: number; rating: string }> = ({ score, rating }) => {
  const radius = 60;
  const stroke = 10;
  const normalizedScore = Math.min(100, Math.max(0, score));
  const circumference = normalizedScore * 2 * Math.PI;
  const strokeDasharray = `${(normalizedScore / 100) * (2 * Math.PI * radius)} ${2 * Math.PI * radius}`;
  const strokeDashoffset = 0; // Start from top

  const getColor = (s: number) => {
    if (s >= 80) return 'text-green-500';
    if (s >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const colorClass = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center py-6 relative">
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            className="text-slate-100"
          />
          {/* Progress Circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-extrabold ${colorClass}`}>{score}</span>
          <span className="text-xs uppercase font-bold text-slate-400 mt-1">/ 100</span>
        </div>
      </div>
      <div className={`mt-2 text-xl font-bold ${colorClass} px-4 py-1 rounded-full bg-slate-50 border border-slate-100`}>
        {rating}
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; color?: string }> = ({ icon, title, subtitle, color = "text-slate-800" }) => (
  <div className="mb-6">
    <div className={`flex items-center gap-2 ${color} mb-1`}>
        {icon}
        <h3 className="font-bold text-xl">{title}</h3>
    </div>
    {subtitle && <p className="text-sm text-slate-500 ml-8">{subtitle}</p>}
  </div>
);

const BreakdownItem: React.FC<{ label: string; score: number; max: number; assessment: string }> = ({ label, score, max, assessment }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 mb-2">
        <div>
            <div className="text-sm font-semibold text-slate-700">{label}</div>
            <div className="text-xs text-slate-500">{assessment}</div>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full ${score/max > 0.7 ? 'bg-green-500' : score/max > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                    style={{ width: `${(score/max)*100}%` }}
                ></div>
            </div>
            <div className="text-sm font-mono font-bold text-slate-600">{score}/{max}</div>
        </div>
    </div>
)

const AuditResults: React.FC<AuditResultsProps> = ({ report }) => {
  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      
      {/* 1. Executive Summary & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Card */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-600" /> Account Health
                    </h3>
                </div>
                <HealthGauge score={report.healthScore.score} rating={report.healthScore.rating} />
                <div className="mt-4 space-y-1">
                    {report.healthScore.breakdown.map((item, i) => (
                        <BreakdownItem key={i} label={item.component} score={item.score} max={10} assessment={item.assessment} />
                    ))}
                </div>
            </div>
        </div>

        {/* Wasted Spend & Savings */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl shadow-lg p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <DollarSign className="w-48 h-48 -rotate-12" />
                </div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-xs mb-1">
                            <AlertOctagon className="w-4 h-4" /> Critical Alert
                        </div>
                        <h2 className="text-3xl font-extrabold mb-2">Wasted Ad Spend</h2>
                        <p className="text-slate-400 text-sm mb-6">Budget currently spent on non-converting traffic, irrelevant keywords, or poor settings.</p>
                        <div className="text-5xl font-extrabold text-white tracking-tight">
                            {report.wastedSpend.total}
                            <span className="text-lg font-normal text-slate-400 ml-2">/mo</span>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
                        <h4 className="text-sm font-bold text-green-400 uppercase mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Potential Impact
                        </h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                <span className="text-slate-300">Projected Savings</span>
                                <span className="text-xl font-bold text-white">{report.wastedSpend.projectedSavings}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300">Reinvestment Value</span>
                                <span className="text-xl font-bold text-green-400">High</span>
                            </div>
                        </div>
                        <button className="w-full mt-6 bg-white text-slate-900 font-bold py-2 rounded-lg hover:bg-slate-100 transition text-sm">
                            View Optimization Plan
                        </button>
                    </div>
                </div>
            </div>

            {/* Waste Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-500" /> Waste Sources
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {report.wastedSpend.items.slice(0,3).map((item, i) => (
                        <div key={i} className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <div className="font-bold text-red-800 text-lg mb-1">{item.amount}</div>
                            <div className="text-sm font-semibold text-slate-700">{item.category}</div>
                            <div className="text-xs text-slate-500 mt-1">{item.fix}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* 2. Benchmark Comparisons */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <SectionHeader 
            icon={<BarChart3 className="w-6 h-6 text-blue-600" />} 
            title="Market Benchmarks" 
            subtitle={`Comparing your performance against the ${report.industryContext || 'Industry'} average.`}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {report.benchmarks.map((b, i) => (
                  <div key={i} className="group">
                      <div className="flex justify-between items-end mb-2">
                          <div>
                              <div className="text-sm font-bold text-slate-700">{b.metric}</div>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  b.assessment === 'Good' ? 'bg-green-100 text-green-700' :
                                  b.assessment === 'Average' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                              }`}>
                                  {b.assessment}
                              </span>
                          </div>
                          <div className="text-right">
                              <div className="text-2xl font-bold text-slate-800">{b.yourValue}</div>
                              <div className="text-xs text-slate-400">vs {b.industryAvg} avg</div>
                          </div>
                      </div>
                      
                      {/* Visual Bar Comparison (Simplified Visual) */}
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                          <div className={`h-full ${b.assessment === 'Good' ? 'bg-green-500' : b.assessment === 'Average' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: '60%' }}></div>
                          <div className="h-full bg-slate-300 w-[2px]"></div> {/* Reference line */}
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* 3. Strategic Roadmap (Timeline) */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-blue-400" />
                    <div>
                        <h3 className="font-bold text-xl">Optimization Roadmap</h3>
                        <p className="text-slate-400 text-sm">Prioritized actions to improve performance</p>
                    </div>
                </div>
                <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 transition flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export Plan
                </button>
             </div>
          </div>
          
          <div className="p-8">
              {/* Immediate */}
              <div className="relative pl-8 pb-8 border-l-2 border-green-500">
                  <div className="absolute -left-[11px] top-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center border-4 border-white shadow-sm">
                      <Zap className="w-3 h-3 text-white" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-800 mb-4">Phase 1: Immediate Fixes (Stop the Bleeding)</h4>
                  <div className="grid grid-cols-1 gap-3">
                      {report.actionPlan.immediate.map((item, i) => (
                          <div key={i} className="bg-green-50 border border-green-100 p-4 rounded-lg flex items-start gap-4">
                              <div className="mt-1 bg-white p-1 rounded-full border border-green-200">
                                  <AlertTriangle className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                  <div className="font-bold text-slate-800">{item.action}</div>
                                  <div className="text-sm text-slate-600 mt-1">{item.steps}</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Weekly */}
              <div className="relative pl-8 pb-8 border-l-2 border-blue-300">
                  <div className="absolute -left-[11px] top-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center border-4 border-white shadow-sm">
                      <Activity className="w-3 h-3 text-white" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-800 mb-4">Phase 2: Weekly Optimization</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.actionPlan.weekly.map((item, i) => (
                          <div key={i} className="bg-white border border-slate-200 p-4 rounded-lg hover:border-blue-300 transition shadow-sm">
                              <div className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                  {item.action}
                              </div>
                              <div className="text-sm text-slate-500">{item.steps}</div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Monthly/Strategic */}
              <div className="relative pl-8 border-l-2 border-slate-200">
                  <div className="absolute -left-[11px] top-0 w-6 h-6 rounded-full bg-slate-400 flex items-center justify-center border-4 border-white shadow-sm">
                      <Layers className="w-3 h-3 text-white" />
                  </div>
                  <h4 className="font-bold text-lg text-slate-800 mb-4">Phase 3: Strategic Growth</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.actionPlan.monthly.map((item, i) => (
                          <div key={i} className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                              <div className="font-bold text-slate-700 mb-2">{item.action}</div>
                              <div className="text-sm text-slate-500">{item.steps}</div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>

      {/* 4. Detailed Tactics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Keywords */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <SectionHeader icon={<Target className="w-5 h-5 text-purple-500" />} title="Keyword Strategy" />
            <div className="space-y-6 flex-1">
               <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                 <div className="text-xs font-bold text-red-700 uppercase mb-2 flex items-center gap-2">
                    <X className="w-3 h-3" /> Negatives & Pauses
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {report.recommendations.keywords.pause.length > 0 ? report.recommendations.keywords.pause.map((k, i) => (
                     <span key={i} className="bg-white text-red-700 border border-red-200 px-2 py-1 rounded text-xs font-medium">{k}</span>
                   )) : <span className="text-sm text-red-400 italic">None identified</span>}
                 </div>
               </div>
               
               <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                 <div className="text-xs font-bold text-green-700 uppercase mb-2 flex items-center gap-2">
                    <Check className="w-3 h-3" /> Scale & Add
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {report.recommendations.keywords.scale.concat(report.recommendations.keywords.add).length > 0 ? report.recommendations.keywords.scale.concat(report.recommendations.keywords.add).map((k, i) => (
                     <span key={i} className="bg-white text-green-700 border border-green-200 px-2 py-1 rounded text-xs font-medium">{k}</span>
                   )) : <span className="text-sm text-green-600 italic">No new keywords suggested</span>}
                 </div>
               </div>
            </div>
         </div>

         {/* Copy & Bids */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <SectionHeader icon={<Zap className="w-5 h-5 text-yellow-500" />} title="Ads & Bidding" />
            <div className="space-y-4 flex-1">
               <div>
                 <div className="text-sm font-bold text-slate-800 mb-2">Ad Copy Improvements</div>
                 <ul className="space-y-2">
                    {report.recommendations.adCopy.issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                            {issue}
                        </li>
                    ))}
                 </ul>
               </div>
               <div className="pt-4 border-t border-slate-100">
                 <div className="text-sm font-bold text-slate-800 mb-2">Bid Adjustments</div>
                 <ul className="space-y-2">
                    {report.recommendations.bids.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <ArrowRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            {b}
                        </li>
                    ))}
                 </ul>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default AuditResults;
