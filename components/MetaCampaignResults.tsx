
import React, { useState, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useReactToPrint } from 'react-to-print';
import { GeneratedMetaCampaign, MetaAd, BudgetScenario, MetaAdSet } from '../types';
import { Copy, Check, Facebook, RefreshCw, Layers, Target, Settings, MessageCircle, Wand2, Loader2, Image as ImageIcon, ThumbsUp, Heart, MoreHorizontal, Globe, Share2, MessageSquare, ClipboardList, BarChart3, Calculator, Tag, Box, AlertTriangle, Download, Smartphone, Wallet, Thermometer, CalendarClock, Swords, PieChart, TrendingUp, Users, LayoutDashboard, Database, Key, Sparkles, X, Zap, ShieldCheck, ArrowRight, Clock } from 'lucide-react';
import { editCampaignWithAI } from '../services/gemini';

interface MetaCampaignResultsProps {
    campaign: GeneratedMetaCampaign;
    onUpdate?: (updated: GeneratedMetaCampaign) => void;
}

const CopyButton: React.FC<{ text: string; label?: string; size?: 'sm' | 'xs' }> = ({ text, label, size = 'xs' }) => {
    const [copied, setCopied] = React.useState(false);
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent parent clicks
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 transition font-medium rounded-md border shadow-sm ${size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-[10px]'} ${copied ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}
            title="Copy to clipboard"
        >
            {copied ? <Check className={size === 'sm' ? "w-4 h-4" : "w-3 h-3"} /> : <Copy className={size === 'sm' ? "w-4 h-4" : "w-3 h-3"} />}
            {label && <span>{label}</span>}
            {copied && !label && <span>Copied</span>}
        </button>
    );
};

const ReactionBar = () => (
    <div className="flex items-center gap-1">
        <div className="flex -space-x-1">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white z-20">
                <ThumbsUp className="w-2.5 h-2.5 text-white fill-white" />
            </div>
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border border-white z-10">
                <Heart className="w-2.5 h-2.5 text-white fill-white" />
            </div>
        </div>
        <span className="text-slate-500 text-xs hover:underline cursor-pointer">2.4K</span>
    </div>
);

const BudgetScenarioCard: React.FC<{ scenario: BudgetScenario; isRecommended?: boolean }> = ({ scenario, isRecommended }) => (
    <div className={`p-5 rounded-xl border relative transition-all duration-300 ${isRecommended ? 'bg-blue-50 border-blue-200 shadow-md transform scale-[1.02]' : 'bg-white border-slate-200'}`}>
        {isRecommended && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                Recommended
            </div>
        )}
        <div className="text-center mb-4">
            <h4 className={`text-lg font-bold mb-1 ${isRecommended ? 'text-blue-900' : 'text-slate-800'}`}>{scenario.label}</h4>
            <div className="text-2xl font-extrabold text-blue-600">{scenario.budget}<span className="text-sm font-normal text-slate-500">/mo</span></div>
        </div>

        <div className="space-y-3 mb-4">
            <div className="flex justify-between text-sm">
                <span className="text-slate-500">Est. Clicks</span>
                <span className="font-semibold text-slate-800">{scenario.expectedClicks}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-slate-500">Est. Conversions</span>
                <span className="font-semibold text-slate-800">{scenario.expectedConversions}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-slate-500">Est. CPA</span>
                <span className="font-semibold text-slate-800">{scenario.estCpa}</span>
            </div>
        </div>
        <p className="text-xs text-slate-600 text-center italic">{scenario.description}</p>
    </div>
);

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; count?: number }> = ({ icon, title, count }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
        <div className="text-blue-600">{icon}</div>
        <h3 className="font-bold text-lg text-slate-800">{title}</h3>
        {count !== undefined && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{count}</span>}
    </div>
);

const FacebookAdPreview: React.FC<{
    ad: MetaAd;
    businessName: string;
    onUpdate: (updatedAd: MetaAd) => void;
}> = ({ ad, businessName, onUpdate }) => {
    const [showPrompt, setShowPrompt] = useState(false);

    const handleChange = (field: keyof MetaAd, value: string) => {
        onUpdate({ ...ad, [field]: value });
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden max-w-[400px] shadow-sm font-sans mx-auto md:mx-0 flex flex-col h-full group/card relative">
            {/* Header */}
            <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                        {businessName.charAt(0)}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-900 leading-tight">{businessName}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">Sponsored <Globe className="w-3 h-3" /></div>
                    </div>
                </div>
                <MoreHorizontal className="w-5 h-5 text-slate-500" />
            </div>

            {/* Editable Primary Text with Overlay Copy Button */}
            <div className="relative group/text">
                <textarea
                    value={ad.primaryText}
                    onChange={(e) => handleChange('primaryText', e.target.value)}
                    className="w-full px-3 pb-3 text-sm text-slate-800 whitespace-pre-wrap outline-none resize-none border-b border-transparent focus:border-blue-200 focus:bg-slate-50 transition min-h-[80px]"
                    rows={4}
                    placeholder="Enter primary text..."
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover/text:opacity-100 transition-opacity bg-white rounded shadow-sm">
                    <CopyButton text={ad.primaryText} />
                </div>
            </div>

            {/* Visual */}
            <div className="relative bg-slate-100 aspect-square flex items-center justify-center overflow-hidden group">
                <div className="text-center p-6 w-full">
                    <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <div className="text-xs text-slate-400 font-medium px-4 mb-4">
                        {ad.visualDescription ? ad.visualDescription.substring(0, 80) + '...' : 'No description'}
                    </div>
                </div>
            </div>

            {/* CTA Bar */}
            <div className="bg-slate-50 p-3 border-t border-slate-100 flex justify-between items-center gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="text-xs text-slate-500 uppercase tracking-wide">example.com</div>

                    {/* Headline with Copy */}
                    <div className="relative group/headline flex items-center">
                        <input
                            value={ad.headline}
                            onChange={(e) => handleChange('headline', e.target.value)}
                            className="font-bold text-slate-900 text-sm bg-transparent outline-none w-full placeholder-slate-400 pr-6"
                            placeholder="Headline"
                        />
                        <div className="absolute right-0 opacity-0 group-hover/headline:opacity-100 transition-opacity">
                            <CopyButton text={ad.headline} />
                        </div>
                    </div>

                    {/* Description with Copy */}
                    <div className="relative group/desc flex items-center">
                        <input
                            value={ad.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className="text-xs text-slate-500 bg-transparent outline-none w-full placeholder-slate-300 pr-6"
                            placeholder="Description (Optional)"
                        />
                        <div className="absolute right-0 opacity-0 group-hover/desc:opacity-100 transition-opacity">
                            <CopyButton text={ad.description} />
                        </div>
                    </div>
                </div>
                <button className="bg-slate-200 text-slate-800 px-4 py-1.5 rounded text-sm font-semibold hover:bg-slate-300 transition whitespace-nowrap">
                    {ad.callToAction || 'Learn More'}
                </button>
            </div>

            {/* Social Proof Bar */}
            <div className="px-3 py-2 border-t border-slate-100 flex justify-between items-center">
                <ReactionBar />
                <div className="text-xs text-slate-500">42 Comments · 12 Shares</div>
            </div>

            {/* Action Bar */}
            <div className="px-2 py-1 border-t border-slate-100 flex">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded text-slate-500 text-sm font-medium">
                    <ThumbsUp className="w-4 h-4" /> Like
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded text-slate-500 text-sm font-medium">
                    <MessageSquare className="w-4 h-4" /> Comment
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-slate-50 rounded text-slate-500 text-sm font-medium">
                    <Share2 className="w-4 h-4" /> Share
                </button>
            </div>

            {/* Prompt Reveal */}
            <div className="bg-slate-900 p-3 mt-auto">
                <button onClick={() => setShowPrompt(!showPrompt)} className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-2 hover:text-white transition w-full">
                    <ImageIcon className="w-3 h-3" />
                    {showPrompt ? "Hide Image Prompt" : "Edit Image Prompt"}
                </button>
                {showPrompt && (
                    <div className="mt-2 relative group/prompt">
                        <textarea
                            value={ad.visualDescription}
                            onChange={(e) => handleChange('visualDescription', e.target.value)}
                            className="w-full text-xs text-slate-300 font-mono bg-slate-800 p-2 rounded border border-slate-700 outline-none focus:border-blue-500 h-20"
                        />
                        <div className="absolute bottom-2 right-2 opacity-0 group-hover/prompt:opacity-100 transition-opacity">
                            <CopyButton text={ad.visualDescription} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MetaCampaignResults: React.FC<MetaCampaignResultsProps> = ({ campaign, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'budget' | 'strategy' | 'creative' | 'funnel' | 'setup'>('budget');
    const [isPrinting, setIsPrinting] = useState(false);

    // PDF Export ref and logic
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Meta_Ads_Presentation_${campaign.campaignName.replace(/\s+/g, '_')}`,
        onBeforePrint: () => new Promise<void>((resolve) => {
            flushSync(() => setIsPrinting(true));
            setTimeout(resolve, 250);
        }),
        onAfterPrint: () => setIsPrinting(false),
    });

    // AI Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editPrompt, setEditPrompt] = useState('');
    const [isApplyingEdit, setIsApplyingEdit] = useState(false);

    const handleAIEdit = async () => {
        if (!editPrompt || !onUpdate) return;
        setIsApplyingEdit(true);
        try {
            const updated = await editCampaignWithAI(campaign, editPrompt, 'meta');
            onUpdate(updated);
            setIsEditing(false);
            setEditPrompt('');
        } catch (e) {
            console.error(e);
            alert("Failed to apply edit.");
        }
        setIsApplyingEdit(false);
    };

    // Safe accessors for budget analysis similar to Google Ads
    const budgetAnalysis = campaign.budgetAnalysis || {};
    const healthScore = budgetAnalysis.healthScore || { overallScore: 0, rating: 'N/A', breakdown: [] };
    const recommendation = budgetAnalysis.recommendation || { monthlyBudget: 'N/A', dailyBudget: 'N/A', reasoning: 'N/A' };
    const roiProjection = budgetAnalysis.roiProjection || { estimatedRevenue: '-', estimatedProfit: '-', roas: '-' };

    const getHealthColor = (score: number) => {
        if (score >= 75) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 45) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getHealthBarColor = (score: number) => {
        if (score >= 75) return 'bg-green-500';
        if (score >= 45) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const handleUpdateAd = (adSetIndex: number, adIndex: number, updatedAd: MetaAd) => {
        if (!onUpdate) return;
        const newAdSets = [...campaign.adSets];
        const newAds = [...newAdSets[adSetIndex].ads];
        newAds[adIndex] = updatedAd;
        newAdSets[adSetIndex] = { ...newAdSets[adSetIndex], ads: newAds };
        onUpdate({ ...campaign, adSets: newAdSets });
    };

    return (
        <div className="pb-20 space-y-8 animate-fade-in" ref={componentRef}>
            {/* Header Section */}
            <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-slate-200 print:hidden">
                <button
                    onClick={() => setActiveTab('budget')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'budget' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <Calculator className="w-4 h-4" /> Economics
                </button>
                <button
                    onClick={() => setActiveTab('strategy')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'strategy' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <LayoutDashboard className="w-4 h-4" /> Strategy & Funnel
                </button>
                <button
                    onClick={() => setActiveTab('creative')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'creative' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <ImageIcon className="w-4 h-4" /> Creative Lab
                </button>
                <button
                    onClick={() => setActiveTab('funnel')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'funnel' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <ArrowRight className="w-4 h-4" /> Funnel & Leads
                </button>
                <button
                    onClick={() => setActiveTab('setup')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'setup' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <Settings className="w-4 h-4" /> Setup & Tracking
                </button>

                {/* Actions */}
                <div className="ml-auto flex items-center gap-2">
                    <button
                        onClick={() => handlePrint()}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md transition print:hidden"
                    >
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-md transition print:hidden"
                    >
                        <Sparkles className="w-4 h-4" /> AI Edit
                    </button>
                </div>
            </div>

            {/* BUDGET TAB */}
            {(activeTab === 'budget' || isPrinting) && (
                <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Health Score Card */}
                        <div className={`p-6 rounded-xl border-2 ${getHealthColor(healthScore.overallScore)} lg:col-span-1`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Thermometer className="w-6 h-6" />
                                <h3 className="font-bold text-lg">Budget Health Score</h3>
                            </div>
                            <div className="text-5xl font-extrabold mb-2">
                                {healthScore.overallScore}<span className="text-xl opacity-60">/100</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4">
                                <div className={`h-2.5 rounded-full ${getHealthBarColor(healthScore.overallScore)}`} style={{ width: `${healthScore.overallScore}%` }}></div>
                            </div>
                            <div className="text-sm font-medium mb-4">{healthScore.rating}</div>

                            <div className="space-y-2">
                                {healthScore.breakdown?.map((item, i) => (
                                    <div key={i} className="flex justify-between text-xs">
                                        <span>{item.component}</span>
                                        <span className="font-semibold">{item.score}/{item.maxScore}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommendation Summary */}
                        <div className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-xl p-8 shadow-lg lg:col-span-2">
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Wallet className="w-6 h-6 text-green-400" />
                                        <h2 className="text-2xl font-bold">Recommended Budget</h2>
                                    </div>
                                    <div className="text-4xl font-extrabold text-white mb-1">
                                        {recommendation.monthlyBudget}
                                        <span className="text-lg font-normal text-blue-200">/mo</span>
                                    </div>
                                    <p className="text-blue-200 text-sm max-w-lg mt-2 leading-relaxed">
                                        {recommendation.reasoning}
                                    </p>
                                </div>
                                <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/10 min-w-[200px]">
                                    <div className="text-xs uppercase text-blue-300 font-bold mb-2">ROI Projection</div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-blue-200">Est. Revenue</span>
                                            <span className="font-bold">{roiProjection.estimatedRevenue}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-blue-200">Est. Profit</span>
                                            <span className="font-bold text-green-400">{roiProjection.estimatedProfit}</span>
                                        </div>
                                        <div className="flex justify-between text-sm pt-2 border-t border-white/10 mt-1">
                                            <span className="text-blue-200">ROAS</span>
                                            <span className="font-bold text-yellow-400">{roiProjection.roas}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scenarios */}
                    {budgetAnalysis.scenarios && (
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-4">Investment Scenarios</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {budgetAnalysis.scenarios.map((scenario, i) => (
                                    <BudgetScenarioCard
                                        key={i}
                                        scenario={scenario}
                                        isRecommended={scenario.label === "Moderate"}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Benchmarks */}
                    {budgetAnalysis.benchmarks && budgetAnalysis.maxCpaAnalysis && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <SectionHeader icon={<TrendingUp />} title="Meta Benchmarks" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                                        <div className="text-xs text-slate-500 mb-1">Avg CPM/CPC</div>
                                        <div className="font-bold text-slate-800 text-lg">{budgetAnalysis.benchmarks.avgCpc}</div>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                                        <div className="text-xs text-slate-500 mb-1">Avg Click-to-Lead</div>
                                        <div className="font-bold text-slate-800 text-lg">{budgetAnalysis.benchmarks.avgCvr}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <SectionHeader icon={<Target />} title="CPA Targets" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-50 p-3 rounded-lg text-center border border-green-100">
                                        <div className="text-xs text-green-700 mb-1">Target CPA</div>
                                        <div className="font-bold text-green-800 text-lg">{budgetAnalysis.maxCpaAnalysis.targetCpa}</div>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg text-center border border-red-100">
                                        <div className="text-xs text-red-700 mb-1">Max Break-Even</div>
                                        <div className="font-bold text-red-800 text-lg">{budgetAnalysis.maxCpaAnalysis.breakEvenCpa}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* STRATEGY TAB */}
            {(activeTab === 'strategy' || isPrinting) && (
                <div className="space-y-8 animate-fade-in print-page-break">
                    {/* Campaign Info Bar */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap gap-4">
                        {campaign.campaignName && (
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Campaign</span>
                                <span className="text-sm font-bold text-slate-800">{campaign.campaignName}</span>
                            </div>
                        )}
                        {campaign.objective && (
                            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Objective</span>
                                <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">{campaign.objective}</span>
                            </div>
                        )}
                        {campaign.buyingType && (
                            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Buying Type</span>
                                <span className="text-sm font-medium text-slate-700">{campaign.buyingType}</span>
                            </div>
                        )}
                        {campaign.specialAdCategories && campaign.specialAdCategories !== 'None' && (
                            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">Special Category</span>
                                <span className="text-sm font-medium text-amber-700">{campaign.specialAdCategories}</span>
                            </div>
                        )}
                    </div>

                    {/* Performance 5 Score */}
                    {campaign.performance5Score && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <BarChart3 className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">Performance 5 Framework</h3>
                                        <p className="text-sm text-slate-500">Meta's Official Best Practice Score</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-3xl font-black text-blue-600">{campaign.performance5Score.overallScore}</div>
                                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">/ 100</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {campaign.performance5Score.breakdown.map((item, i) => (
                                    <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="text-[10px] uppercase font-bold text-slate-500 truncate" title={item.pillar}>{item.pillar}</div>
                                            <div className={`text-xs font-bold ${item.score >= 80 ? 'text-green-600' : item.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {item.score}/100
                                            </div>
                                        </div>
                                        <div className="text-xs font-medium text-slate-800 mb-1 truncate" title={item.assessment}>{item.assessment}</div>
                                        <div className="text-[10px] text-slate-500 leading-tight line-clamp-3" title={item.recommendation}>{item.recommendation}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Account Architecture (Visual) */}
                    {campaign.accountStructure && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
                            <div className="bg-slate-900 px-6 py-4 border-b border-slate-800">
                                <div className="flex items-center gap-3">
                                    <Layers className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Full-Funnel Architecture</h3>
                                        <p className="text-slate-400 text-xs">2026 Meta Ads Structure (Simplified & Consolidated)</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-8">
                                <div className="flex flex-col md:flex-row justify-center items-start gap-8 relative">
                                    {/* Horizontal Connector */}
                                    <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-1 bg-slate-200 -z-0"></div>

                                    {campaign.accountStructure.campaigns.map((camp, i) => (
                                        <div key={i} className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative z-10 w-full hover:border-blue-300 transition-all group">
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                                Campaign {i + 1}
                                            </div>
                                            <h4 className="text-center font-bold text-lg text-slate-800 mt-2 mb-1">{camp.name}</h4>
                                            <div className="text-center text-xs text-slate-500 font-bold uppercase tracking-wider mb-4 text-blue-600">{camp.budgetSplit} Budget</div>
                                            <p className="text-sm text-slate-600 text-center leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                {camp.purpose}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-4">
                                    <div className="bg-blue-100 p-2 rounded-full"><MessageCircle className="w-5 h-5 text-blue-700" /></div>
                                    <div>
                                        <h4 className="font-bold text-blue-900 text-sm uppercase tracking-wide mb-1">Architect's Rationale</h4>
                                        <p className="text-blue-800 text-sm leading-relaxed">
                                            "{campaign.accountStructure.rationale}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ad Set Targeting Grid */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <SectionHeader icon={<Users />} title="Audience Targeting Matrix" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {campaign.adSets.map((set, i) => (
                                <div key={i} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded text-xs">Ad Set {i + 1}</div>
                                        <h4 className="font-bold text-slate-800 truncate">{set.name}</h4>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">Audience Type</div>
                                            <div className="font-medium text-blue-600">{set.targeting.audienceType}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">Details</div>
                                            <div className="text-slate-700 leading-snug">{set.targeting.details}</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase">Location & Age</div>
                                            <div className="text-slate-600">{set.targeting.location} | {set.targeting.age}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* CREATIVE LAB */}
            {(activeTab === 'creative' || isPrinting) && (
                <div className="space-y-8 animate-fade-in print-page-break">
                    {/* Creative Strategy Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-purple-600 font-bold">
                                <Target className="w-5 h-5" /> Visual Hooks
                            </div>
                            <ul className="space-y-2">
                                {campaign.creativeStrategy.visualHooks.map((h, i) => (
                                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2 justify-between group">
                                        <div className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0"></div>
                                            {h}
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <CopyButton text={h} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-blue-600 font-bold">
                                <MessageCircle className="w-5 h-5" /> Copy Angles
                            </div>
                            <ul className="space-y-2">
                                {campaign.creativeStrategy.copyAngles.map((h, i) => (
                                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2 justify-between group">
                                        <div className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                                            {h}
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <CopyButton text={h} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-green-600 font-bold">
                                <Smartphone className="w-5 h-5" /> Format Mix
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {campaign.creativeStrategy.formatSuggestions.map((h, i) => (
                                    <span key={i} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded border border-green-100">
                                        {h}
                                    </span>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-400 italic">Prioritize 9:16 vertical video for maximum scale.</p>
                        </div>
                    </div>

                    {/* Ad Previews */}
                    {campaign.adSets.map((adSet, idx) => (
                        <div key={idx} className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-black uppercase tracking-widest">Ad Set {idx + 1}: {adSet.name}</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {adSet.ads.map((ad, adIdx) => {
                                    const uniqueId = `${idx}-${adIdx}`;
                                    return (
                                        <FacebookAdPreview
                                            key={uniqueId}
                                            ad={ad}
                                            businessName={campaign.businessName}
                                            onUpdate={(updatedAd) => handleUpdateAd(idx, adIdx, updatedAd)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* TRACKING & SETUP TAB */}
            {(activeTab === 'setup' || isPrinting) && (
                <div className="space-y-8 animate-fade-in print-page-break">

                    {/* GTM / Pixel Section */}
                    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                        <div className="bg-[#1877F2] p-6 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                    <Tag className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">Meta Pixel & CAPI Implementation</h3>
                                    <p className="text-blue-100 text-sm">Essential for iOS14+ Signal Resilience</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Left: Events */}
                            <div className="lg:col-span-1 space-y-8">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
                                        Events to Track
                                    </h4>
                                    <div className="space-y-3">
                                        {campaign.trackingSetup.standardEvents.map((event, i) => (
                                            <div key={i} className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                <Target className="w-4 h-4 text-[#1877F2] mt-1 shrink-0" />
                                                <div>
                                                    <div className="text-sm font-bold text-slate-800">{event}</div>
                                                    <div className="text-xs text-slate-500">Standard Event</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                    <div className="flex items-center gap-2 mb-2 text-orange-700 font-bold text-sm">
                                        <Database className="w-4 h-4" /> Conversions API (CAPI)
                                    </div>
                                    <p className="text-xs text-orange-800 leading-relaxed mb-2">
                                        Server-side tracking is mandatory.
                                    </p>
                                    {campaign.trackingSetup.capiInstructions && (
                                        <div className="text-xs text-orange-900 font-medium">
                                            {campaign.trackingSetup.capiInstructions[0]}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Steps */}
                            <div className="lg:col-span-2">
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">
                                    Implementation Steps
                                </h4>

                                <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:h-full before:w-0.5 before:bg-slate-100">
                                    {/* Combine Pixel, GTM, and CAPI steps intelligently or display primary Pixel steps */}
                                    {campaign.trackingSetup.gtmInstructions.map((step, i) => {
                                        const match = step.match(/^(\d+)\.\s*(.+?)(\n|$|:)/);
                                        const stepNum = match ? match[1] : i + 1;
                                        const title = match ? match[2] : "Setup Step";
                                        const content = match ? step.substring(match[0].length) : step;

                                        return (
                                            <div key={i} className="relative pl-12">
                                                <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-white border-2 border-[#1877F2] text-[#1877F2] font-bold flex items-center justify-center z-10 shadow-sm">
                                                    {stepNum}
                                                </div>
                                                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-blue-200 transition-colors">
                                                    <h5 className="font-bold text-slate-900 mb-2">{title}</h5>
                                                    <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                                                        {content || step}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Domain & Optimization */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <SectionHeader icon={<Key />} title="Domain Verification" />
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 leading-relaxed">
                                {campaign.trackingSetup.domainVerification}
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <SectionHeader icon={<BarChart3 />} title="Scaling Signals" />
                            <div className="flex flex-wrap gap-2">
                                {campaign.optimization.scalingMetrics.map((m, i) => (
                                    <span key={i} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 flex items-center gap-2">
                                        <TrendingUp className="w-3 h-3" /> {m}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-4 bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
                                <span className="font-bold uppercase">Testing Plan:</span> {campaign.optimization.testingPlan}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FUNNEL & LEADS TAB */}
            {(activeTab === 'funnel' || isPrinting) && (
                <div className="space-y-8 animate-fade-in print-page-break">

                    {/* Full Funnel Strategy */}
                    {campaign.fullFunnelStrategy && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-900 to-slate-900 px-6 py-5 flex items-center gap-3">
                                <Layers className="w-6 h-6 text-blue-300" />
                                <div>
                                    <h3 className="font-bold text-white text-lg">Full-Funnel Campaign Strategy</h3>
                                    <p className="text-blue-200 text-xs">TOF → MOF → BOF blueprint for {campaign.businessName}</p>
                                </div>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { key: 'topOfFunnel', label: 'Top of Funnel', sublabel: 'Awareness / Prospecting', color: 'border-blue-400 bg-blue-50', badge: 'bg-blue-600', data: campaign.fullFunnelStrategy.topOfFunnel },
                                    { key: 'middleOfFunnel', label: 'Middle of Funnel', sublabel: 'Consideration / Engagement', color: 'border-purple-400 bg-purple-50', badge: 'bg-purple-600', data: campaign.fullFunnelStrategy.middleOfFunnel },
                                    { key: 'bottomOfFunnel', label: 'Bottom of Funnel', sublabel: 'Conversion / Remarketing', color: 'border-green-400 bg-green-50', badge: 'bg-green-600', data: campaign.fullFunnelStrategy.bottomOfFunnel },
                                ].map(({ label, sublabel, color, badge, data }) => data && (
                                    <div key={label} className={`rounded-xl border-2 ${color} p-5`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className={`${badge} text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider`}>{label}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 font-bold uppercase mb-3">{sublabel}</div>
                                        <div className="space-y-2.5 text-sm">
                                            <div><span className="font-bold text-slate-700">Objective:</span> <span className="text-slate-600">{data.objective}</span></div>
                                            <div><span className="font-bold text-slate-700">Creative:</span> <span className="text-slate-600">{data.creative}</span></div>
                                            <div><span className="font-bold text-slate-700">Audience:</span> <span className="text-slate-600">{data.audience}</span></div>
                                            <div><span className="font-bold text-slate-700">Budget:</span> <span className="text-slate-600">{data.budget}</span></div>
                                            {data.keyFormats && data.keyFormats.length > 0 && (
                                                <div className="flex flex-wrap gap-1 pt-1">
                                                    {data.keyFormats.map((f: string, i: number) => (
                                                        <span key={i} className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-medium">{f}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {campaign.fullFunnelStrategy.consolidationRecommendation && (
                                <div className="mx-6 mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                                    <MessageCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                    <p className="text-sm text-blue-800 leading-relaxed">{campaign.fullFunnelStrategy.consolidationRecommendation}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ASC+ Configuration */}
                    {campaign.ascPlusConfig && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-bold text-slate-800 text-lg">Advantage+ Sales (ASC+) Configuration</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${campaign.ascPlusConfig.recommended ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {campaign.ascPlusConfig.recommended ? 'Recommended' : 'Optional'}
                                    </span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-5 leading-relaxed">{campaign.ascPlusConfig.reasoning}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">Learning Phase Requirements</h4>
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">{campaign.ascPlusConfig.learningPhaseRequirements}</div>
                                    <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3 mt-4">Budget Scaling Plan</h4>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">{campaign.ascPlusConfig.budgetScalingPlan}</div>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">Audience Exclusions</h4>
                                    <ul className="space-y-1.5">
                                        {campaign.ascPlusConfig.audienceExclusions?.map((exc: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                                                <X className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" /> {exc}
                                            </li>
                                        ))}
                                    </ul>
                                    <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3 mt-4">Creative Asset Checklist</h4>
                                    <ul className="space-y-1.5">
                                        {campaign.ascPlusConfig.creativeAssetChecklist?.map((item: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                <Check className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Lead Form Strategy */}
                    {campaign.leadFormStrategy?.recommended && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-green-700 to-teal-700 px-6 py-5 flex items-center gap-3">
                                <ClipboardList className="w-6 h-6 text-green-200" />
                                <div>
                                    <h3 className="font-bold text-white text-lg">Lead Form Strategy</h3>
                                    <p className="text-green-100 text-xs">Optimized for lead quality, not just volume</p>
                                </div>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Form Type</div>
                                        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg text-sm font-bold text-green-800">
                                            <Check className="w-4 h-4" /> {campaign.leadFormStrategy.formType}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Value Offer</div>
                                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm text-slate-700">{campaign.leadFormStrategy.valueOffer}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Thank-You Screen Copy</div>
                                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm text-slate-700 italic">"{campaign.leadFormStrategy.thankYouScreenCopy}"</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Offline Conversion Setup</div>
                                        <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg text-sm text-orange-800">{campaign.leadFormStrategy.offlineConversionSetup}</div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Qualifying Questions</div>
                                        <ul className="space-y-2">
                                            {campaign.leadFormStrategy.qualifyingQuestions?.map((q: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg text-blue-800">
                                                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                                                    {q}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lead Quality Tips</div>
                                        <ul className="space-y-1.5">
                                            {campaign.leadFormStrategy.leadQualityTips?.map((tip: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" /> {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CREATIVE FATIGUE + COMPLIANCE additions to existing tabs */}
            {(activeTab === 'creative' || isPrinting) && campaign.creativeFatigueSchedule && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-0 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <h3 className="font-bold text-slate-800">Creative Fatigue Schedule</h3>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">{campaign.creativeFatigueSchedule.estimatedLifespanDays} day lifespan</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Refresh Triggers</div>
                            <ul className="space-y-1.5">
                                {campaign.creativeFatigueSchedule.refreshTriggers?.map((t: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-red-50 px-2 py-1.5 rounded border border-red-100">
                                        <AlertTriangle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" /> {t}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cycle 1 Assets</div>
                            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm text-slate-700">{campaign.creativeFatigueSchedule.cycleOneCreatives}</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-3">Cycle 2 Angles</div>
                            <div className="flex flex-wrap gap-1.5">
                                {campaign.creativeFatigueSchedule.cycleTwoAngles?.map((a: string, i: number) => (
                                    <span key={i} className="text-xs bg-purple-50 border border-purple-100 text-purple-700 px-2 py-1 rounded font-medium">{a}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Scaling Strategy</div>
                            <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-sm text-green-800">{campaign.creativeFatigueSchedule.scalingStrategy}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* COMPLIANCE section addition to Setup tab */}
            {(activeTab === 'setup' || isPrinting) && campaign.complianceFlags && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                        <ShieldCheck className="w-5 h-5 text-red-600" />
                        <h3 className="font-bold text-slate-800">Ad Policy & Compliance</h3>
                        {campaign.complianceFlags.requiresDeclaration && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Special Category Required</span>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {campaign.complianceFlags.specialAdCategory && campaign.complianceFlags.specialAdCategory !== 'None' && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <div className="font-bold text-red-900 text-sm mb-1 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Special Ad Category: {campaign.complianceFlags.specialAdCategory}
                                    </div>
                                    <p className="text-xs text-red-800">You must declare this category when creating your campaign in Ads Manager. Targeting will be restricted.</p>
                                </div>
                            )}
                            {campaign.complianceFlags.restrictedTargeting?.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Restricted Targeting Options</div>
                                    <ul className="space-y-1.5">
                                        {campaign.complianceFlags.restrictedTargeting.map((r: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-amber-50 px-2 py-1.5 rounded border border-amber-100">
                                                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" /> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            {campaign.complianceFlags.prohibitedContent?.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prohibited Content Risks</div>
                                    <ul className="space-y-1.5">
                                        {campaign.complianceFlags.prohibitedContent.map((p: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-red-50 px-2 py-1.5 rounded border border-red-100">
                                                <X className="w-3 h-3 text-red-500 shrink-0 mt-0.5" /> {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {campaign.complianceFlags.recommendations?.length > 0 && (
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Compliance Recommendations</div>
                                    <ul className="space-y-1.5">
                                        {campaign.complianceFlags.recommendations.map((r: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                                                <Check className="w-3.5 h-3.5 text-green-600 shrink-0 mt-0.5" /> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* AI Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsEditing(false)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-purple-50">
                            <h3 className="font-bold text-lg text-purple-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-600" /> Edit Campaign with AI
                            </h3>
                            <button onClick={() => setIsEditing(false)} className="p-1 rounded-full hover:bg-purple-200 transition text-purple-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-4">
                                Describe what you want to change in this campaign. The AI will apply the edits directly to the data.
                            </p>
                            <textarea
                                className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none resize-none mb-4 text-sm"
                                placeholder="e.g. 'Make the ad copy more aggressive', 'Change the target audience to focus on older demographics', 'Increase the budget by 20%'"
                                value={editPrompt}
                                onChange={(e) => setEditPrompt(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAIEdit}
                                    disabled={isApplyingEdit || !editPrompt.trim()}
                                    className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-purple-700 transition disabled:opacity-50"
                                >
                                    {isApplyingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    {isApplyingEdit ? 'Applying...' : 'Apply Edit'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default MetaCampaignResults;
