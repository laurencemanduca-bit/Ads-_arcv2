
import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { GeneratedCampaign, ResponsiveSearchAd, AdGroup, BudgetScenario, KeywordEntry } from '../types';
import { Copy, Check, MousePointerClick, MessageSquare, List, Image as ImageIcon, Tag, DollarSign, Target, RefreshCw, LayoutDashboard, Globe, Users, TrendingUp, CalendarClock, Layers, Milestone, BarChart3, Search, Lightbulb, Calculator, ArrowRight, Wallet, AlertTriangle, ShieldCheck, Thermometer, Swords, Plus, Loader2, Building, GripHorizontal, Box, PieChart, Download, Link as LinkIcon, Gauge, Edit, Trash2, Video, PlayCircle, Smartphone, Sparkles, Code2, Monitor, X, Book, ExternalLink, Star, Zap } from 'lucide-react';
import { generateMoreKeywords, editCampaignWithAI, generateAdsScripts, analyzeLandingPage, fetchLiveCompetitorAds } from '../services/gemini';

interface CampaignResultsProps {
    campaign: GeneratedCampaign;
    onUpdate?: (updated: GeneratedCampaign) => void;
}

const CopyButton: React.FC<{ text: string, label?: string }> = ({ text, label }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className={`text-slate-400 hover:text-google-blue transition flex items-center gap-1 ${label ? 'bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium' : ''}`}
            title="Copy to clipboard"
        >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {label && <span>{copied ? 'Copied' : label}</span>}
        </button>
    );
};

const CampaignArchitectureDiagram = ({ businessName, adGroups, campaignType }: { businessName: string, adGroups: AdGroup[], campaignType: string }) => {
    const isVideo = campaignType.includes('Video');
    const isPMAX = campaignType.includes('Performance Max') || campaignType === 'PMAX';

    return (
        <div className="flex flex-col items-center w-full py-8 px-4 overflow-x-auto min-h-[350px]">

            {/* Account Node */}
            <div className="z-10 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg border border-slate-700 flex items-center gap-3 mb-8 w-64 justify-center relative">
                <Building className="w-5 h-5 text-blue-400 shrink-0" />
                <div className="font-bold tracking-wide truncate">{businessName || "Account"}</div>
                {/* Vertical Line Down */}
                <div className="absolute top-full left-1/2 w-0.5 h-8 bg-slate-300 -translate-x-1/2"></div>
            </div>

            {/* Campaign Node */}
            <div className="z-10 bg-white text-slate-800 px-6 py-3 rounded-lg shadow-lg border-2 border-google-blue flex items-center gap-3 mb-8 w-64 justify-center relative">
                {isVideo ? <Video className="w-5 h-5 text-red-600 shrink-0" /> : isPMAX ? <Layers className="w-5 h-5 text-blue-600 shrink-0" /> : <Target className="w-5 h-5 text-google-red shrink-0" />}
                <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Campaign</div>
                    <div className="font-bold leading-none">{campaignType}</div>
                </div>
                {/* Fork Line Down */}
                <div className="absolute top-full left-1/2 w-0.5 h-6 bg-slate-300 -translate-x-1/2"></div>
            </div>

            {/* Ad Group Container */}
            <div className="relative flex justify-center gap-8 w-full pt-6">
                {/* Horizontal Bar */}
                {adGroups.length > 1 && (
                    <div className="absolute top-0 left-0 w-full h-6 flex justify-center">
                        <div className="w-[calc(100%-14rem)] max-w-4xl h-0.5 bg-slate-300 relative top-0"></div>
                    </div>
                )}

                {adGroups.map((group, i) => (
                    <div key={i} className="flex flex-col items-center relative">
                        {/* Vertical Connector from Horizontal Bar */}
                        <div className="absolute -top-6 w-0.5 h-6 bg-slate-300"></div>

                        {/* Ad Group Card */}
                        <div className="bg-white p-4 rounded-lg shadow-md border border-slate-200 w-60 text-center relative z-10 group hover:border-blue-400 hover:-translate-y-1 transition duration-300">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-100">
                                {isPMAX ? 'Asset Group' : isVideo ? 'Topic' : 'Ad Group'} {i + 1}
                            </div>
                            <div className="font-bold text-slate-800 mt-2 truncate text-sm" title={group.name}>{group.name}</div>
                            <div className="text-xs text-slate-500 mb-2 truncate italic">{group.theme}</div>

                            <div className="flex justify-center gap-2 mt-3 pt-3 border-t border-slate-100">
                                <div className="bg-slate-50 px-2 py-1 rounded text-xs font-mono text-slate-600 flex items-center gap-1">
                                    <Target className="w-3 h-3" /> {group.keywords.length}
                                </div>
                                <div className="bg-slate-50 px-2 py-1 rounded text-xs font-mono text-slate-600 flex items-center gap-1">
                                    <MousePointerClick className="w-3 h-3" /> {group.ads.length}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const AdStrengthMeter: React.FC<{ headlines: string[], descriptions: string[] }> = ({ headlines, descriptions }) => {
    let score = 0;
    // Headline quantity (up to 30pts)
    score += Math.min(headlines.length, 15) * 2;
    // Description quantity (up to 20pts)
    score += Math.min(descriptions.length, 4) * 5;
    // No headline over 30 chars (10pts)
    if (headlines.every(h => h.length <= 30)) score += 10;
    // No description over 90 chars (10pts)
    if (descriptions.every(d => d.length <= 90)) score += 10;
    // CTA keyword presence (10pts)
    const ctaWords = ['get', 'call', 'start', 'try', 'book', 'free', 'save', 'contact', 'learn', 'now', 'today'];
    const allText = [...headlines, ...descriptions].join(' ').toLowerCase();
    if (ctaWords.some(w => allText.includes(w))) score += 10;
    // Headline length variety (10pts)
    const avgLen = headlines.reduce((a, h) => a + h.length, 0) / (headlines.length || 1);
    if (avgLen > 10) score += 10;
    score = Math.min(score, 100);

    let label = "Poor";
    let color = "text-red-600 bg-red-100 border-red-200";
    if (score > 40) { label = "Average"; color = "text-yellow-600 bg-yellow-100 border-yellow-200"; }
    if (score > 80) { label = "Excellent"; color = "text-green-600 bg-green-100 border-green-200"; }

    return (
        <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-slate-400">Ad Strength</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${color}`}>{label}</span>
            </div>
            <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center text-[10px] font-bold ${score > 80 ? 'border-green-500 text-green-700' : score > 40 ? 'border-yellow-500 text-yellow-700' : 'border-red-500 text-red-700'}`}>
                {score}
            </div>
        </div>
    )
}

// Interactive Ad Preview Card
const AdPreviewCard: React.FC<{
    ad: ResponsiveSearchAd;
    index: number;
    groupName: string;
    onUpdateAd: (newAd: ResponsiveSearchAd) => void;
    campaignType: string;
}> = ({ ad, index, groupName, onUpdateAd, campaignType }) => {
    const [visibleHeadlines, setVisibleHeadlines] = useState<string[]>([]);
    const [visibleDescriptions, setVisibleDescriptions] = useState<string[]>([]);
    const displayPaths = ad.paths && Array.isArray(ad.paths) ? ad.paths : ["service", "offer"];

    const rotateCreative = React.useCallback(() => {
        const pickRandom = (arr: string[], min: number, max: number) => {
            if (!arr || arr.length === 0) return [];
            const count = Math.floor(Math.random() * (max - min + 1)) + min;
            const shuffled = [...arr].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, Math.min(count, arr.length));
        };

        setVisibleHeadlines(pickRandom(ad.headlines, 2, 3));
        setVisibleDescriptions(pickRandom(ad.descriptions, 1, 2));
    }, [ad.headlines, ad.descriptions]);

    useEffect(() => {
        rotateCreative();
    }, []);

    const handleHeadlineChange = (val: string, i: number) => {
        const newHeadlines = [...ad.headlines];
        newHeadlines[i] = val;
        onUpdateAd({ ...ad, headlines: newHeadlines });
    };

    const handleDescriptionChange = (val: string, i: number) => {
        const newDescriptions = [...ad.descriptions];
        newDescriptions[i] = val;
        onUpdateAd({ ...ad, descriptions: newDescriptions });
    };

    // Determine Render Mode
    const isVideo = campaignType.includes('Video');
    const isPmaxDisplay = campaignType.includes('Performance Max') || campaignType.includes('Display') || campaignType.includes('Demand');

    return (
        <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden mb-6">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">{groupName}</span>
                    Variation {index + 1}
                </h3>
                <div className="flex items-center gap-3">
                    <AdStrengthMeter headlines={ad.headlines} descriptions={ad.descriptions} />
                    <div className="h-6 w-px bg-slate-300 mx-2 hidden sm:block"></div>
                    <button
                        onClick={rotateCreative}
                        className="text-xs flex items-center gap-1 text-slate-600 hover:text-google-blue transition bg-white border border-slate-200 px-2 py-1 rounded shadow-sm"
                    >
                        <RefreshCw className="w-3 h-3" /> Shuffle Preview
                    </button>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Preview Side - Context Aware */}
                <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">
                        {isVideo ? "YouTube In-Feed Preview" : isPmaxDisplay ? "Responsive Display Preview" : "Google Search Preview"}
                    </div>

                    {isVideo ? (
                        // Video Preview Layout
                        <div className="bg-white rounded-lg overflow-hidden border border-slate-100 shadow-sm max-w-sm">
                            <div className="aspect-video bg-slate-900 relative flex items-center justify-center group">
                                <PlayCircle className="w-12 h-12 text-white/80 group-hover:text-white transition" />
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">0:30</div>
                            </div>
                            <div className="p-3">
                                <div className="font-semibold text-slate-900 leading-snug mb-1">{visibleHeadlines[0] || ad.headlines[0]}</div>
                                <div className="flex items-center gap-2">
                                    <div className="text-xs text-slate-500">Sponsored · {groupName}</div>
                                </div>
                            </div>
                        </div>
                    ) : isPmaxDisplay ? (
                        // PMAX/Display Card Layout
                        <div className="bg-white p-0 rounded-lg border border-slate-100 shadow-sm max-w-sm overflow-hidden">
                            <div className="aspect-[1.91/1] bg-slate-200 relative flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-slate-400" />
                            </div>
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
                                    <span className="text-xs font-bold text-slate-700">Business Name</span>
                                    <span className="bg-yellow-400 text-[10px] px-1 rounded font-bold">Ad</span>
                                </div>
                                <div className="font-bold text-slate-900 mb-1">{visibleHeadlines[0] || ad.headlines[0]}</div>
                                <div className="text-sm text-slate-600">{visibleDescriptions[0] || ad.descriptions[0]}</div>
                                <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded font-bold text-xs uppercase">Call To Action</button>
                            </div>
                        </div>
                    ) : (
                        // Standard Search Layout
                        <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm max-w-xl">
                            <div className="flex items-center gap-1 mb-1">
                                <span className="font-bold text-black text-sm">Ad</span>
                                <span className="text-slate-600 text-sm">·</span>
                                <span className="text-google-green text-sm">example.com/{displayPaths.join('/')}</span>
                            </div>
                            <div className="text-xl text-google-blue hover:underline cursor-pointer font-medium leading-snug mb-1 min-h-[3.5rem] transition-opacity duration-300">
                                {visibleHeadlines.length > 0 ? visibleHeadlines.join(" | ") : "Loading headlines..."}
                            </div>
                            <div className="text-slate-600 text-sm leading-relaxed min-h-[2.5rem] transition-opacity duration-300">
                                {visibleDescriptions.length > 0 ? visibleDescriptions.join(" ") : "Loading descriptions..."}
                            </div>
                        </div>
                    )}
                </div>

                {/* Asset List Side - Editable */}
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-semibold text-slate-700">{isVideo ? 'Video Titles' : 'Headlines'} ({ad.headlines.length})</h4>
                            <CopyButton text={ad.headlines.join('\n')} />
                        </div>
                        <div className="h-48 overflow-y-auto pr-2 space-y-1.5 custom-scrollbar">
                            {ad.headlines.map((h, i) => {
                                const isTooLong = h.length > 30;
                                const isTooShort = h.length < 3;
                                return (
                                    <div key={i} className={`text-sm bg-slate-50 px-2 py-1 rounded border flex justify-between items-center group transition ${isTooLong ? "border-red-200 bg-red-50" : isTooShort ? "border-yellow-200 bg-yellow-50" : "border-slate-100 focus-within:border-google-blue"}`}>
                                        <input
                                            value={h}
                                            onChange={(e) => handleHeadlineChange(e.target.value, i)}
                                            className={`w-full bg-transparent outline-none mr-2 ${isTooLong ? "text-red-600 font-medium" : "text-slate-700"}`}
                                        />
                                        <span className={`text-xs whitespace-nowrap ${isTooLong ? "text-red-600 font-bold" : "text-slate-400"}`}>
                                            {h.length}/30
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-semibold text-slate-700">Descriptions ({ad.descriptions.length})</h4>
                            <CopyButton text={ad.descriptions.join('\n')} />
                        </div>
                        <div className="space-y-1.5">
                            {ad.descriptions.map((d, i) => {
                                const isTooLong = d.length > 90;
                                return (
                                    <div key={i} className={`text-sm bg-slate-50 px-2 py-1.5 rounded border flex justify-between items-start group transition ${isTooLong ? "border-red-200 bg-red-50" : "border-slate-100 focus-within:border-google-blue"}`}>
                                        <textarea
                                            value={d}
                                            onChange={(e) => handleDescriptionChange(e.target.value, i)}
                                            rows={2}
                                            className={`w-full bg-transparent outline-none mr-2 resize-none ${isTooLong ? "text-red-600 font-medium" : "text-slate-700"}`}
                                        />
                                        <span className={`text-xs whitespace-nowrap mt-0.5 ${isTooLong ? "text-red-600 font-bold" : "text-slate-400"}`}>
                                            {d.length}/90
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; count?: number }> = ({ icon, title, count }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
        <div className="text-google-blue">{icon}</div>
        <h3 className="font-bold text-lg text-slate-800">{title}</h3>
        {count !== undefined && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{count}</span>}
    </div>
);

const BudgetScenarioCard: React.FC<{ scenario: BudgetScenario; isRecommended?: boolean }> = ({ scenario, isRecommended }) => (
    <div className={`p-5 rounded-xl border relative transition-all duration-300 ${isRecommended ? 'bg-blue-50 border-blue-200 shadow-md transform scale-[1.02]' : 'bg-white border-slate-200'}`}>
        {isRecommended && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-google-green text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                Recommended
            </div>
        )}
        <div className="text-center mb-4">
            <h4 className={`text-lg font-bold mb-1 ${isRecommended ? 'text-blue-900' : 'text-slate-800'}`}>{scenario.label}</h4>
            <div className="text-2xl font-extrabold text-google-blue">{scenario.budget}<span className="text-sm font-normal text-slate-500">/mo</span></div>
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

const AdGroupDisplay: React.FC<{
    group: AdGroup;
    industry: string;
    location: string;
    onUpdateGroup: (newGroup: AdGroup) => void;
    campaignType: string;
}> = ({ group, industry, location, onUpdateGroup, campaignType }) => {
    const [keywords, setKeywords] = useState<KeywordEntry[]>(group.keywords);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        setKeywords(group.keywords);
    }, [group]);

    // Sync back to parent when local keywords change (if added locally)
    useEffect(() => {
        if (keywords !== group.keywords) {
            onUpdateGroup({ ...group, keywords });
        }
    }, [keywords]);

    const handleUpdateAd = (newAd: ResponsiveSearchAd, adIndex: number) => {
        const newAds = [...group.ads];
        newAds[adIndex] = newAd;
        onUpdateGroup({ ...group, ads: newAds });
    };

    const handleAddMoreKeywords = async () => {
        setIsLoadingMore(true);
        try {
            const existingTerms = keywords.map(k => k.term);
            const uniqueExisting = existingTerms.slice(-20);

            const newKeywords = await generateMoreKeywords(industry, location, group.theme, uniqueExisting);

            if (newKeywords && newKeywords.length > 0) {
                setKeywords(prev => [...prev, ...newKeywords]);
            }
        } catch (error) {
            console.error("Error adding keywords", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleDeleteKeyword = (index: number) => {
        setKeywords(prev => prev.filter((_, i) => i !== index));
    }

    const keywordsListText = keywords.map(k => k.term).join('\n');

    // Dynamic Labels
    const isPMAX = campaignType.includes('Performance Max') || campaignType === 'PMAX';
    const isVideo = campaignType.includes('Video');

    const keywordLabel = isPMAX ? 'Audience Signal' : isVideo ? 'Content Target' : 'Keyword';
    const groupLabel = isPMAX ? 'Asset Group' : isVideo ? 'Topic' : 'Ad Group';

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Keywords Section */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                        <div className="text-google-blue"><Target /></div>
                        <h3 className="font-bold text-lg text-slate-800">{isPMAX ? 'Audience Signals' : isVideo ? 'Topic Targeting' : 'Keywords'}: {group.name}</h3>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{keywords.length}</span>
                    </div>
                    <CopyButton text={keywordsListText} label={`Copy All ${keywordLabel}s`} />
                </div>

                <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <div>
                        <h4 className="text-sm font-semibold text-slate-700">Theme: <span className="font-normal">{group.theme}</span></h4>
                        <div className="flex gap-4 mt-2">
                            <div className="text-xs flex items-center gap-1 text-slate-600">
                                <DollarSign className="w-3 h-3 text-green-600" /> Target CPC: <span className="font-bold text-slate-800">{group.targetCpc}</span>
                            </div>
                            <div className="text-xs flex items-center gap-1 text-slate-600">
                                <Gauge className="w-3 h-3 text-purple-600" /> Strategy: <span className="font-bold text-slate-800">{group.individualBidStrategy}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleAddMoreKeywords}
                        disabled={isLoadingMore}
                        className="text-sm flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg transition font-medium disabled:opacity-50 shadow-sm"
                    >
                        {isLoadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add More {keywordLabel}s
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-4 py-2 rounded-l-lg">{keywordLabel}</th>
                                <th className="px-4 py-2">Match Type</th>
                                <th className="px-4 py-2">Intent</th>
                                <th className="px-4 py-2">Est. Vol</th>
                                <th className="px-4 py-2">Est. CPC</th>
                                <th className="px-4 py-2 rounded-r-lg text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {keywords.map((k, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition group">
                                    <td className="px-4 py-2 text-slate-800 font-medium">{k.term}</td>
                                    <td className="px-4 py-2 text-slate-600">
                                        <span className={`px-2 py-0.5 rounded text-xs border ${k.matchType === 'Broad' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : 'bg-slate-100 border-slate-200'}`}>
                                            {k.matchType}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-0.5 rounded text-xs border ${k.intent === 'High' ? 'bg-green-50 border-green-200 text-green-700' : k.intent === 'Medium' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                            {k.intent}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-slate-600 text-xs">{k.searchVolume || "-"}</td>
                                    <td className="px-4 py-2 text-slate-600 text-xs font-mono">{k.avgCpc || "-"}</td>
                                    <td className="px-4 py-2 text-right">
                                        <button onClick={() => handleDeleteKeyword(i)} className="text-slate-300 hover:text-red-500 transition p-1 opacity-0 group-hover:opacity-100" title="Remove Keyword">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Ads Section */}
            <section>
                <SectionHeader icon={<MousePointerClick />} title="Creative Variations (Editable)" count={group.ads.length} />
                {group.ads.map((ad, i) => (
                    <AdPreviewCard
                        key={i}
                        ad={ad}
                        index={i}
                        groupName={group.name}
                        onUpdateAd={(newAd) => handleUpdateAd(newAd, i)}
                        campaignType={campaignType}
                    />
                ))}
            </section>
        </div>
    );
};

// Negative Keyword Library data
const NEGATIVE_KEYWORD_LIBRARY: { category: string; keywords: string[] }[] = [
  { category: 'Universal – Intent Filters', keywords: ['free', 'cheap', 'cheapest', 'affordable', 'low cost', 'discount', 'how to', 'tutorial', 'diy', 'youtube', 'reddit', 'forum', 'blog', 'wikipedia', 'definition', 'what is', 'what are', 'template', 'sample', 'example', 'images', 'pictures', 'stock photo'] },
  { category: 'Universal – Employment', keywords: ['jobs', 'job', 'careers', 'career', 'hiring', 'employment', 'apply', 'resume', 'salary', 'internship', 'apprenticeship', 'work from home', 'remote job'] },
  { category: 'Universal – Reputation Risk', keywords: ['scam', 'fraud', 'lawsuit', 'complaint', 'complaints', 'review', 'reviews', 'rating', 'ratings', 'class action', 'settlement', 'bbb'] },
  { category: 'Legal Services', keywords: ['free legal advice', 'pro bono', 'legal aid', 'law school', 'law student', 'paralegal course', 'bar exam', 'legal dictionary', 'self represented'] },
  { category: 'Home Services / Contractors', keywords: ['permit', 'permit cost', 'diy plumbing', 'diy electrical', 'code violation', 'building code', 'home depot', 'lowes', 'menards', 'contractor license exam', 'apprentice'] },
  { category: 'Medical / Healthcare', keywords: ['medical school', 'nursing school', 'residency', 'clinical trial', 'research study', 'academic', 'textbook', 'icd code', 'cpt code', 'insurance billing', 'prior auth'] },
  { category: 'Financial / Insurance', keywords: ['claim denied', 'insurance appeal', 'insurance complaint', 'class action', 'ponzi', 'fraud alert', 'calculate yourself', 'spreadsheet', 'formula', 'diy insurance'] },
  { category: 'SaaS / Software', keywords: ['crack', 'keygen', 'serial key', 'pirate', 'open source', 'free alternative', 'github', 'stackoverflow', 'documentation', 'api docs', 'sdk', 'developer', 'source code'] },
  { category: 'Education / Online Courses', keywords: ['free course', 'free certification', 'coursera', 'udemy free', 'khan academy', 'mit opencourseware', 'torrent', 'pdf download', 'audiobook', 'library'] },
];

const CampaignResults: React.FC<CampaignResultsProps> = ({ campaign, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'budget' | 'strategy' | 'adgroups' | 'assets' | 'tracking' | 'competitors' | 'scripts' | 'landingpage'>('budget');
    const [activeAdGroupIndex, setActiveAdGroupIndex] = useState(0);

    // Scripts Generator State
    const [scripts, setScripts] = useState<{ name: string; category: string; description: string; difficulty: string; code: string; }[]>([]);
    const [isLoadingScripts, setIsLoadingScripts] = useState(false);
    const [activeScript, setActiveScript] = useState(0);

    // Landing Page Analyzer State
    const [lpUrl, setLpUrl] = useState('');
    const [lpAnalysis, setLpAnalysis] = useState<any>(null);
    const [isAnalyzingLP, setIsAnalyzingLP] = useState(false);

    // Live Competitor Ads State
    const [competitorAds, setCompetitorAds] = useState<any[]>([]);
    const [isFetchingCompetitorAds, setIsFetchingCompetitorAds] = useState(false);

    // Negative Keyword Library
    const [showNegativeLibrary, setShowNegativeLibrary] = useState(false);

    // PDF Export ref and logic
    const componentRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Google_Ads_Presentation_${campaign.businessName.replace(/\s+/g, '_')}`,
    });

    // AI Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editPrompt, setEditPrompt] = useState('');
    const [isApplyingEdit, setIsApplyingEdit] = useState(false);

    const handleAIEdit = async () => {
        if (!editPrompt || !onUpdate) return;
        setIsApplyingEdit(true);
        try {
            const updated = await editCampaignWithAI(campaign, editPrompt, 'google');
            onUpdate(updated);
            setIsEditing(false);
            setEditPrompt('');
        } catch (e) {
            console.error(e);
            alert("Failed to apply edit.");
        }
        setIsApplyingEdit(false);
    };

    // Safe accessors
    const budgetAnalysis = campaign.budgetAnalysis || {};
    const recommendation = budgetAnalysis.recommendation || { monthlyBudget: 'N/A', dailyBudget: 'N/A', reasoning: 'N/A' };
    const healthScore = budgetAnalysis.healthScore || { overallScore: 0, rating: 'N/A', breakdown: [] };
    const roiProjection = budgetAnalysis.roiProjection || { estimatedRevenue: '-', estimatedProfit: '-', roas: '-' };
    const competitorAnalysis = campaign.competitorAnalysis || { differentiationStrategy: 'N/A', missingKeywords: [], messagingGaps: [], citations: [] };
    const strategy = campaign.strategy || { campaignType: 'Search', biddingStrategy: 'N/A', objective: 'N/A', biddingReasoning: 'N/A', audienceSegments: [], demographicTargeting: 'N/A', locationStrategy: 'N/A', adSchedule: 'N/A' };
    const assets = campaign.assets || { sitelinks: [], callouts: [], snippets: [], imageIdeas: [] };

    // Logic for dynamic labels based on Campaign Type
    const isPMAX = strategy.campaignType.includes('Performance Max') || strategy.campaignType === 'PMAX';
    const isVideo = strategy.campaignType.includes('Video');
    const groupLabel = isPMAX ? 'Asset Groups' : isVideo ? 'Topics' : 'Ad Groups';

    const getHealthColor = (score: number) => {
        if (score >= 75) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 45) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const getHealthBarColor = (score: number) => {
        if (score >= 75) return 'bg-green-500';
        if (score >= 45) return 'bg-yellow-500';
        return 'bg-red-500';
    }

    const handleUpdateGroup = (newGroup: AdGroup) => {
        if (!onUpdate) return;
        const newGroups = [...campaign.adGroups];
        newGroups[activeAdGroupIndex] = newGroup;
        onUpdate({ ...campaign, adGroups: newGroups });
    };

    const handleGenerateScripts = async () => {
        setIsLoadingScripts(true);
        try {
            const result = await generateAdsScripts(campaign);
            setScripts(result);
        } catch (e) {
            console.error(e);
        }
        setIsLoadingScripts(false);
    };

    const handleAnalyzeLP = async () => {
        if (!lpUrl.trim()) return;
        setIsAnalyzingLP(true);
        setLpAnalysis(null);
        try {
            const result = await analyzeLandingPage(lpUrl, campaign.businessName, campaign.industry, campaign.strategy?.objective || 'Leads');
            setLpAnalysis(result);
        } catch (e) {
            console.error(e);
        }
        setIsAnalyzingLP(false);
    };

    const handleFetchCompetitorAds = async () => {
        setIsFetchingCompetitorAds(true);
        const topKeywords = campaign.adGroups.flatMap(g => g.keywords.slice(0, 3).map(k => k.term)).slice(0, 6);
        try {
            const result = await fetchLiveCompetitorAds(campaign.businessName, topKeywords, campaign.location);
            setCompetitorAds(result);
        } catch (e) {
            console.error(e);
        }
        setIsFetchingCompetitorAds(false);
    };

    const handleExportCsv = () => {
        // Full Google Ads Editor compatible CSV export
        const q = (s: string) => `"${(s || '').replace(/"/g, '""')}"`;
        const campaignName = `${campaign.businessName} - ${strategy.campaignType}`;
        const dailyBudget = recommendation.dailyBudget?.replace(/[^0-9.]/g, '') || '30';

        const lines: string[] = [];

        // Header matching Google Ads Editor Bulk Upload format
        lines.push([
            'Row Type', 'Campaign', 'Daily Budget', 'Bid Strategy Type',
            'Ad Group', 'Max CPC', 'Keyword', 'Match Type', 'Status',
            'Ad Type', 'Final URL',
            'Headline 1', 'Headline 2', 'Headline 3', 'Headline 4', 'Headline 5',
            'Headline 6', 'Headline 7', 'Headline 8', 'Headline 9', 'Headline 10',
            'Headline 11', 'Headline 12', 'Headline 13', 'Headline 14', 'Headline 15',
            'Description 1', 'Description 2', 'Description 3', 'Description 4',
            'Path 1', 'Path 2'
        ].map(q).join(','));

        // Campaign row
        lines.push([q('Campaign'), q(campaignName), q(dailyBudget), q(strategy.biddingStrategy),
            q(''), q(''), q(''), q(''), q('Enabled'),
            q(''), q(campaign.competitorAnalysis?.citations?.[0]?.url || ''),
            ...Array(19).fill(q(''))
        ].join(','));

        campaign.adGroups.forEach(group => {
            const maxCpcMatch = group.targetCpc.match(/(\d+\.?\d*)/);
            const maxCpc = maxCpcMatch ? maxCpcMatch[0] : '';

            // Ad Group row
            lines.push([q('Ad group'), q(campaignName), q(''), q(''),
                q(group.name), q(maxCpc), q(''), q(''), q('Enabled'),
                q(''), q(''), ...Array(19).fill(q(''))
            ].join(','));

            // Keyword rows
            group.keywords.forEach(kw => {
                let term = kw.term;
                if (kw.matchType === 'Phrase') term = `"${kw.term}"`;
                else if (kw.matchType === 'Exact') term = `[${kw.term}]`;

                lines.push([q('Keyword'), q(campaignName), q(''), q(''),
                    q(group.name), q(''), q(term), q(kw.matchType), q('Enabled'),
                    q(''), q(''), ...Array(19).fill(q(''))
                ].join(','));
            });

            // RSA rows — one row per ad with all 15 headlines and 4 descriptions
            group.ads.forEach(ad => {
                const hs = Array.from({ length: 15 }, (_, i) => q(ad.headlines[i] || ''));
                const ds = Array.from({ length: 4 }, (_, i) => q(ad.descriptions[i] || ''));
                const paths = Array.isArray(ad.paths) ? ad.paths : ['', ''];

                lines.push([q('Ad'), q(campaignName), q(''), q(''),
                    q(group.name), q(''), q(''), q(''), q('Enabled'),
                    q('Responsive search ad'), q(''),
                    ...hs, ...ds,
                    q(paths[0] || ''), q(paths[1] || '')
                ].join(','));
            });

            // Negative Keywords
            group.negativeKeywords?.forEach(neg => {
                lines.push([q('Negative keyword'), q(campaignName), q(''), q(''),
                    q(group.name), q(''), q(`[${neg}]`), q('Exact'), q('Enabled'),
                    q(''), q(''), ...Array(19).fill(q(''))
                ].join(','));
            });
        });

        // Sitelinks
        assets.sitelinks?.forEach(sl => {
            lines.push([q('Sitelink'), q(campaignName), q(''), q(''),
                q(''), q(''), q(''), q(''), q('Enabled'),
                q(sl.text), q(''),
                q(sl.desc1), q(sl.desc2), ...Array(17).fill(q(''))
            ].join(','));
        });

        const csvContent = lines.join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `google_ads_export_${campaign.businessName.replace(/\s+/g, '_')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="pb-20" ref={componentRef}>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-slate-200 print:hidden">
                <button
                    onClick={() => setActiveTab('budget')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'budget' ? 'bg-google-blue text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <Calculator className="w-4 h-4" /> Budget & Analysis
                </button>
                <button
                    onClick={() => setActiveTab('strategy')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'strategy' ? 'bg-google-blue text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <LayoutDashboard className="w-4 h-4" /> Strategy & Structure
                </button>
                <button
                    onClick={() => setActiveTab('adgroups')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'adgroups' ? 'bg-google-blue text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <Layers className="w-4 h-4" /> {groupLabel} ({campaign.adGroups.length})
                </button>
                <button
                    onClick={() => setActiveTab('assets')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'assets' ? 'bg-google-blue text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <List className="w-4 h-4" /> Assets
                </button>
                <button
                    onClick={() => setActiveTab('competitors')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'competitors' ? 'bg-google-blue text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <Swords className="w-4 h-4" /> Competitor Intel
                </button>
                <button
                    onClick={() => setActiveTab('tracking')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'tracking' ? 'bg-google-blue text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <BarChart3 className="w-4 h-4" /> Tracking
                </button>
                <button
                    onClick={() => setActiveTab('scripts')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'scripts' ? 'bg-google-blue text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <Code2 className="w-4 h-4" /> Scripts
                </button>
                <button
                    onClick={() => setActiveTab('landingpage')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'landingpage' ? 'bg-google-blue text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                    <Monitor className="w-4 h-4" /> Landing Page
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
                    <button
                        onClick={handleExportCsv}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-green-600 text-white hover:bg-green-700 shadow-md transition print:hidden"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>

            {/* BUDGET TAB */}
            {activeTab === 'budget' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Health Score & Top Summary */}
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

                    {/* Granular Budget Allocation */}
                    {budgetAnalysis.allocationBreakdown && budgetAnalysis.allocationBreakdown.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-6">
                            <SectionHeader icon={<PieChart className="w-5 h-5 text-purple-500" />} title="Smart Budget Allocation" />
                            <div className="space-y-4">
                                {budgetAnalysis.allocationBreakdown.map((item, i) => (
                                    <div key={i} className="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-purple-200 transition">
                                        <div className="flex-1">
                                            <div className="font-bold text-slate-800 text-lg flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-blue-500' : i === 1 ? 'bg-purple-500' : 'bg-slate-400'}`}></div>
                                                {item.category}
                                            </div>
                                            <div className="text-sm text-slate-600 mt-1">{item.reasoning}</div>
                                        </div>
                                        <div className="flex items-center gap-6 min-w-[240px] border-l border-slate-200 pl-6 md:justify-end w-full md:w-auto">
                                            <div className="text-left md:text-right">
                                                <div className="text-2xl font-bold text-google-blue">{item.percentage}</div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Share</div>
                                            </div>
                                            <div className="text-left md:text-right">
                                                <div className="text-xl font-bold text-slate-700">{item.amount}</div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Spend</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Advanced Analysis Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Seasonal Analysis */}
                        {budgetAnalysis.seasonalAnalysis && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <SectionHeader icon={<CalendarClock />} title="Seasonal Budget Calendar" />
                                <div className="text-sm text-slate-600 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                    Current Month Multiplier: <span className="font-bold text-blue-800">{budgetAnalysis.seasonalAnalysis.currentMonthMultiplier}</span>
                                </div>
                                <div className="overflow-y-auto max-h-60 pr-2 custom-scrollbar">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 text-slate-500 sticky top-0">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Month</th>
                                                <th className="px-3 py-2 text-left">Projected Budget</th>
                                                <th className="px-3 py-2 text-left">Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {budgetAnalysis.seasonalAnalysis.adjustments.map((adj, i) => (
                                                <tr key={i}>
                                                    <td className="px-3 py-2 font-medium text-slate-700">{adj.month}</td>
                                                    <td className="px-3 py-2 font-bold text-slate-800">{adj.amount || adj.adjustment}</td>
                                                    <td className="px-3 py-2 text-slate-600">{adj.reasoning}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Competitor & Market Analysis */}
                        {budgetAnalysis.competitorSpendAnalysis && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                <SectionHeader icon={<Swords />} title="Competitive Landscape" />
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <h4 className="text-sm font-bold text-slate-700 mb-2">Estimated Competitor Spend</h4>
                                        <div className="text-2xl font-bold text-slate-800">
                                            {budgetAnalysis.competitorSpendAnalysis.estimatedSpendLow} - {budgetAnalysis.competitorSpendAnalysis.estimatedSpendHigh}
                                            <span className="text-sm font-normal text-slate-500 ml-1">/mo</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">Market Position</div>
                                        <div className="text-sm font-medium text-blue-700">{budgetAnalysis.competitorSpendAnalysis.marketPosition}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase mb-1">Recommended Strategy</div>
                                        <p className="text-sm text-slate-600">{budgetAnalysis.competitorSpendAnalysis.strategyRecommendation}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Benchmarks & CPA */}
                    {budgetAnalysis.benchmarks && budgetAnalysis.maxCpaAnalysis && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-google-blue" /> Market Benchmarks
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                                        <div className="text-xs text-slate-500 mb-1">Industry Avg CPC</div>
                                        <div className="font-bold text-slate-800 text-lg">{budgetAnalysis.benchmarks.avgCpc}</div>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg text-center">
                                        <div className="text-xs text-slate-500 mb-1">Industry Avg Conv. Rate</div>
                                        <div className="font-bold text-slate-800 text-lg">{budgetAnalysis.benchmarks.avgCvr}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-google-red" /> CPA Targets
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-green-50 p-3 rounded-lg text-center border border-green-100">
                                        <div className="text-xs text-green-700 mb-1">Recommended Target CPA</div>
                                        <div className="font-bold text-green-800 text-lg">{budgetAnalysis.maxCpaAnalysis.targetCpa}</div>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-lg text-center border border-red-100">
                                        <div className="text-xs text-red-700 mb-1">Max Break-Even CPA</div>
                                        <div className="font-bold text-red-800 text-lg">{budgetAnalysis.maxCpaAnalysis.breakEvenCpa}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* STRATEGY TAB */}
            {activeTab === 'strategy' && (
                <div className="space-y-8 animate-fade-in">
                    {/* Visual Campaign Architecture */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
                        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                    <Layers className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg leading-tight">Visual Blueprint</h3>
                                    <p className="text-slate-400 text-xs">Strategic Hierarchy</p>
                                </div>
                            </div>
                            <div className="text-xs font-mono text-slate-500 bg-slate-800 px-3 py-1 rounded">
                                ID: {campaign.id.substring(0, 8)}
                            </div>
                        </div>
                        <div className="bg-slate-50/50">
                            <CampaignArchitectureDiagram businessName={campaign.businessName} adGroups={campaign.adGroups} campaignType={strategy.campaignType} />
                        </div>
                    </div>

                    {/* Core Strategy Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* ... existing strategy cards ... */}
                        {/* Card 1: Bidding & Objective */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden">
                            <div className="bg-blue-50/50 p-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-800">Bidding Engine</h4>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <div className="text-xs uppercase font-bold text-slate-400 mb-1">Strategy</div>
                                    <div className="text-lg font-bold text-slate-800">{strategy.biddingStrategy}</div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase font-bold text-slate-400 mb-1">Goal</div>
                                    <div className="text-sm font-medium text-slate-700">{strategy.objective}</div>
                                </div>
                                <div className="bg-slate-50 p-3 rounded text-sm text-slate-600 italic border border-slate-100">
                                    "{strategy.biddingReasoning}"
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Audience & Targeting */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden">
                            <div className="bg-purple-50/50 p-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-800">Targeting Matrix</h4>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <div className="text-xs uppercase font-bold text-slate-400 mb-1">Audience Segments</div>
                                    <div className="flex flex-wrap gap-2">
                                        {strategy.audienceSegments?.slice(0, 4).map((s, i) => (
                                            <span key={i} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium border border-purple-100">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs uppercase font-bold text-slate-400 mb-1">Demographics</div>
                                    <div className="text-sm text-slate-700">{strategy.demographicTargeting}</div>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Network & Settings */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden">
                            <div className="bg-green-50/50 p-4 border-b border-slate-100 flex items-center gap-3">
                                <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                                    <Globe className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-800">Global Settings</h4>
                            </div>
                            <div className="p-5 space-y-4">
                                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                    <span className="text-sm text-slate-600">Location</span>
                                    <span className="text-sm font-semibold text-slate-800 text-right">{strategy.locationStrategy}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                                    <span className="text-sm text-slate-600">Schedule</span>
                                    <span className="text-sm font-semibold text-slate-800 text-right">{strategy.adSchedule}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">Language</span>
                                    <span className="text-sm font-semibold text-slate-800 text-right">{campaign.structure.settings.languages}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Competitor Edge Footer */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Swords className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                            <div className="p-3 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                                <Swords className="w-8 h-8 text-yellow-400" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h4 className="text-yellow-400 font-bold uppercase tracking-wider text-xs mb-2">Competitive Advantage</h4>
                                <p className="text-lg font-medium leading-relaxed italic">
                                    "{competitorAnalysis.differentiationStrategy}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AD GROUPS TAB */}
            {activeTab === 'adgroups' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-2">
                        <div className="flex gap-4 overflow-x-auto">
                            {campaign.adGroups.map((group, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveAdGroupIndex(idx)}
                                    className={`whitespace-nowrap pb-2 px-1 text-sm font-semibold border-b-2 transition ${activeAdGroupIndex === idx ? 'border-google-blue text-google-blue' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                >
                                    {group.name}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowNegativeLibrary(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold hover:bg-red-100 transition shrink-0"
                        >
                            <ShieldCheck className="w-4 h-4" /> Negative Keyword Library
                        </button>
                    </div>
                    <AdGroupDisplay
                        group={campaign.adGroups[activeAdGroupIndex]}
                        industry={campaign.industry}
                        location={campaign.location}
                        onUpdateGroup={handleUpdateGroup}
                        campaignType={strategy.campaignType}
                    />
                </div>
            )}

            {/* ASSETS TAB - Read Only for now to avoid complexity in this turn */}
            {activeTab === 'assets' && (
                <div className="space-y-6 animate-fade-in">
                    {/* Extensions Container */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Sitelinks */}
                        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <SectionHeader icon={<List />} title="Sitelink Assets" count={assets.sitelinks.length} />
                            <div className="space-y-4">
                                {assets.sitelinks.map((sl, i) => (
                                    <div key={i} className="group p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition">
                                        <div className="flex justify-between">
                                            <div className="font-medium text-google-blue">{sl.text}</div>
                                            <CopyButton text={`${sl.text}\n${sl.desc1}\n${sl.desc2}`} />
                                        </div>
                                        <div className="text-sm text-slate-600">{sl.desc1}</div>
                                        <div className="text-sm text-slate-600">{sl.desc2}</div>
                                        <div className="text-xs text-slate-400 mt-1 italic">Landing: {sl.purpose}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Callouts */}
                        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <SectionHeader icon={<MessageSquare />} title="Callout Assets" count={assets.callouts.length} />
                            <div className="flex flex-wrap gap-2">
                                {assets.callouts.map((c, i) => (
                                    <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200">
                                        {c.text}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>
                    {/* ... other assets sections unchanged ... */}
                </div>
            )}

            {/* COMPETITOR INTEL TAB */}
            {activeTab === 'competitors' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-xl p-8 shadow-lg">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <Swords className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Competitive Intelligence</h2>
                                </div>
                                <p className="text-indigo-200 max-w-2xl leading-relaxed">
                                    Analysis of your market landscape, highlighting gaps in competitor strategies and opportunities for your brand to dominate based on your USPs.
                                </p>
                            </div>
                            <div className="bg-white/10 border border-white/10 p-4 rounded-lg backdrop-blur-sm min-w-[200px]">
                                <div className="text-xs font-bold text-indigo-300 uppercase mb-2">Winning Strategy</div>
                                <div className="text-sm font-medium italic">"{competitorAnalysis.differentiationStrategy}"</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Keyword Gaps */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <SectionHeader icon={<Target />} title="High-Opportunity Keywords (Competitor Gaps)" />
                            <p className="text-sm text-slate-500 mb-4">Keywords your competitors might be missing or under-bidding on.</p>
                            <div className="flex flex-wrap gap-2">
                                {competitorAnalysis.missingKeywords.map((kw, i) => (
                                    <span key={i} className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5">
                                        <Plus className="w-3 h-3" /> {kw}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Messaging Gaps */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <SectionHeader icon={<MessageSquare />} title="Competitor Weaknesses (Messaging Gaps)" />
                            <p className="text-sm text-slate-500 mb-4">Areas where competitor ads are weak or generic.</p>
                            <ul className="space-y-3">
                                {competitorAnalysis.messagingGaps.map((gap, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                        <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                        {gap}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Live Competitor Ads */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="text-google-blue"><Search className="w-5 h-5" /></div>
                                <h3 className="font-bold text-lg text-slate-800">Live Competitor Ad Copy</h3>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">AI-Powered</span>
                            </div>
                            <button
                                onClick={handleFetchCompetitorAds}
                                disabled={isFetchingCompetitorAds}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
                            >
                                {isFetchingCompetitorAds ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                                {isFetchingCompetitorAds ? 'Fetching...' : 'Fetch Live Ads'}
                            </button>
                        </div>
                        {competitorAds.length === 0 && !isFetchingCompetitorAds && (
                            <div className="text-center py-10 text-slate-400">
                                <Swords className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-medium">Click "Fetch Live Ads" to pull real competitor ad copy for your top keywords using AI grounding.</p>
                            </div>
                        )}
                        {isFetchingCompetitorAds && (
                            <div className="text-center py-10 text-slate-400 animate-pulse">
                                <Globe className="w-10 h-10 mx-auto mb-3 text-indigo-400" />
                                <p className="text-sm font-medium text-indigo-600">Researching live ads across the web...</p>
                            </div>
                        )}
                        {competitorAds.length > 0 && (
                            <div className="space-y-4">
                                {competitorAds.map((comp: any, i: number) => (
                                    <div key={i} className="border border-slate-200 rounded-xl p-5 hover:border-indigo-300 transition">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-slate-800">{comp.advertiser}</span>
                                                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{comp.displayUrl}</span>
                                                </div>
                                                <div className="text-google-blue font-semibold text-sm leading-snug">{comp.headline}</div>
                                            </div>
                                            {comp.angle && (
                                                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-1 rounded-lg font-bold whitespace-nowrap shrink-0">{comp.angle}</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 mb-3">{comp.description}</p>
                                        {comp.weakness && (
                                            <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-lg p-3">
                                                <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                                                <p className="text-xs text-orange-800 font-medium">{comp.weakness}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Citations / Sources */}
                    {competitorAnalysis.citations && competitorAnalysis.citations.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <SectionHeader icon={<Globe />} title="Market Sources & Research" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {competitorAnalysis.citations.map((cite, i) => (
                                    <a key={i} href={cite.url} target="_blank" rel="noopener noreferrer" className="block p-4 rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition group">
                                        <div className="font-bold text-slate-800 text-sm mb-1 group-hover:text-blue-700 truncate">{cite.source}</div>
                                        <div className="text-xs text-slate-400 flex items-center gap-1 truncate">
                                            <LinkIcon className="w-3 h-3" /> {cite.url}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TRACKING TAB - Read Only */}
            {activeTab === 'tracking' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
                                <Target className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Conversion Tracking Setup</h3>
                                <p className="text-slate-500 text-sm">Follow these instructions to ensure 100% accurate measurement.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">Primary Conversion Actions</h4>
                                <ul className="space-y-2 mb-6">
                                    {campaign.conversionTracking.primaryActions.map((action, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-slate-700 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                            <Check className="w-4 h-4 text-green-600" /> {action}
                                        </li>
                                    ))}
                                </ul>

                                <h4 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">Google Tag Manager Implementation</h4>
                                <div className="space-y-3">
                                    {campaign.conversionTracking.gtmInstructions.map((step, i) => (
                                        <div key={i} className="flex gap-3 text-sm">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                                                {i + 1}
                                            </div>
                                            <p className="text-slate-600 leading-relaxed pt-0.5">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-slate-900 rounded-xl p-6 text-slate-300 font-mono text-xs overflow-x-auto">
                                    <div className="flex justify-between items-center mb-2 border-b border-slate-700 pb-2">
                                        <span className="font-bold text-slate-100">Event Snippet</span>
                                        <CopyButton text={campaign.conversionTracking.eventSnippet} />
                                    </div>
                                    <pre>{campaign.conversionTracking.eventSnippet}</pre>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <div className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4" /> Enhanced Conversions
                                    </div>
                                    <p className="text-xs text-blue-700 leading-relaxed">
                                        {campaign.conversionTracking.enhancedConversions}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SCRIPTS TAB */}
            {activeTab === 'scripts' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl p-8 shadow-lg">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-white/10 rounded-lg"><Code2 className="w-6 h-6 text-green-400" /></div>
                                    <h2 className="text-2xl font-bold">Google Ads Scripts Generator</h2>
                                </div>
                                <p className="text-slate-300 max-w-2xl leading-relaxed">
                                    Production-ready Google Ads Scripts tailored to your campaign. Automate bid management, budget pacing, quality score reporting, and more.
                                </p>
                            </div>
                            <button
                                onClick={handleGenerateScripts}
                                disabled={isLoadingScripts}
                                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-400 transition disabled:opacity-50 shadow-lg shrink-0"
                            >
                                {isLoadingScripts ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                {isLoadingScripts ? 'Generating...' : 'Generate Scripts'}
                            </button>
                        </div>
                    </div>

                    {isLoadingScripts && (
                        <div className="text-center py-16 animate-pulse">
                            <Code2 className="w-12 h-12 mx-auto mb-4 text-green-500 opacity-60" />
                            <p className="text-slate-500 font-medium">Generating production-ready scripts for your campaign...</p>
                        </div>
                    )}

                    {scripts.length === 0 && !isLoadingScripts && (
                        <div className="text-center py-16 text-slate-400">
                            <Code2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="font-medium">Click "Generate Scripts" to create custom automation scripts for this campaign.</p>
                            <p className="text-sm mt-2 text-slate-400">Scripts include: Budget Pacing Alerts, Auto-Negatives, Quality Score Reporter, Bid Adjuster, and Dayparting Optimizer.</p>
                        </div>
                    )}

                    {scripts.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Script List */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-2">
                                <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider px-2 pb-2 border-b border-slate-100">Available Scripts</h3>
                                {scripts.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveScript(i)}
                                        className={`w-full text-left px-3 py-3 rounded-lg transition ${activeScript === i ? 'bg-slate-900 text-white' : 'hover:bg-slate-50 text-slate-700'}`}
                                    >
                                        <div className="font-semibold text-sm">{s.name}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${s.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' : s.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'} ${activeScript === i ? 'opacity-80' : ''}`}>
                                                {s.difficulty}
                                            </span>
                                            <span className={`text-[10px] ${activeScript === i ? 'text-slate-400' : 'text-slate-400'}`}>{s.category}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Script Viewer */}
                            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                {scripts[activeScript] && (
                                    <>
                                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-slate-800">{scripts[activeScript].name}</h3>
                                                <p className="text-sm text-slate-500 mt-1">{scripts[activeScript].description}</p>
                                            </div>
                                            <CopyButton text={scripts[activeScript].code} label="Copy Code" />
                                        </div>
                                        <div className="bg-slate-950 p-5 overflow-auto max-h-[500px]">
                                            <pre className="text-green-300 text-xs font-mono leading-relaxed whitespace-pre-wrap">{scripts[activeScript].code}</pre>
                                        </div>
                                        <div className="px-5 py-3 bg-amber-50 border-t border-amber-100 flex items-start gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-800">
                                                <strong>Usage:</strong> In Google Ads, go to Tools &amp; Settings → Bulk Actions → Scripts → New Script. Paste the code, authorize, and run.
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* LANDING PAGE ANALYZER TAB */}
            {activeTab === 'landingpage' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-xl p-8 shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-2 bg-white/10 rounded-lg"><Monitor className="w-6 h-6 text-teal-300" /></div>
                            <h2 className="text-2xl font-bold">Landing Page CRO Analyzer</h2>
                        </div>
                        <p className="text-teal-100 max-w-2xl leading-relaxed">
                            Analyze your landing page for conversion rate optimization. Get a CRO score, pass/fail checks, and specific improvements to increase your Quality Score and reduce wasted spend.
                        </p>
                    </div>

                    {/* URL Input */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Landing Page URL</label>
                        <div className="flex gap-3">
                            <input
                                value={lpUrl}
                                onChange={(e) => setLpUrl(e.target.value)}
                                placeholder="https://example.com/landing-page"
                                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none font-medium text-sm"
                            />
                            <button
                                onClick={handleAnalyzeLP}
                                disabled={isAnalyzingLP || !lpUrl.trim()}
                                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition disabled:opacity-50 shadow-md"
                            >
                                {isAnalyzingLP ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                {isAnalyzingLP ? 'Analyzing...' : 'Analyze Page'}
                            </button>
                        </div>
                    </div>

                    {isAnalyzingLP && (
                        <div className="text-center py-16 animate-pulse">
                            <Monitor className="w-12 h-12 mx-auto mb-4 text-teal-500 opacity-60" />
                            <p className="text-slate-500 font-medium">Analyzing landing page for CRO opportunities...</p>
                        </div>
                    )}

                    {lpAnalysis && !isAnalyzingLP && (
                        <div className="space-y-6">
                            {/* Score Banner */}
                            <div className={`rounded-xl p-6 border-2 flex flex-col md:flex-row items-center gap-6 ${lpAnalysis.overallScore >= 70 ? 'bg-green-50 border-green-200' : lpAnalysis.overallScore >= 45 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                                <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center shrink-0 font-extrabold ${lpAnalysis.overallScore >= 70 ? 'border-green-500 text-green-700' : lpAnalysis.overallScore >= 45 ? 'border-yellow-500 text-yellow-700' : 'border-red-500 text-red-700'}`}>
                                    <span className="text-3xl">{lpAnalysis.overallScore}</span>
                                    <span className="text-xs font-medium opacity-60">/100</span>
                                </div>
                                <div>
                                    <div className={`text-xl font-bold mb-1 ${lpAnalysis.overallScore >= 70 ? 'text-green-800' : lpAnalysis.overallScore >= 45 ? 'text-yellow-800' : 'text-red-800'}`}>
                                        CRO Score: {lpAnalysis.verdict}
                                    </div>
                                    <p className="text-sm text-slate-600 leading-relaxed">{lpAnalysis.summary}</p>
                                </div>
                            </div>

                            {/* Checks Grid */}
                            {lpAnalysis.checks && lpAnalysis.checks.length > 0 && (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-teal-600" /> CRO Checklist</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {lpAnalysis.checks.map((check: any, i: number) => (
                                            <div key={i} className={`p-4 rounded-lg border flex items-start gap-3 ${check.status === 'Pass' ? 'bg-green-50 border-green-200' : check.status === 'Fail' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                                                <div className={`shrink-0 mt-0.5 ${check.status === 'Pass' ? 'text-green-600' : check.status === 'Fail' ? 'text-red-600' : 'text-yellow-600'}`}>
                                                    {check.status === 'Pass' ? <Check className="w-4 h-4" /> : check.status === 'Fail' ? <X className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm text-slate-800">{check.criterion}</div>
                                                    <div className="text-xs text-slate-600 mt-0.5">{check.finding}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Quick Wins */}
                                {lpAnalysis.quickWins && lpAnalysis.quickWins.length > 0 && (
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-green-500" /> Quick Wins</h3>
                                        <ul className="space-y-2">
                                            {lpAnalysis.quickWins.map((win: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                                                    <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /> {win}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Critical Fixes */}
                                {lpAnalysis.criticalFixes && lpAnalysis.criticalFixes.length > 0 && (
                                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> Critical Fixes</h3>
                                        <ul className="space-y-2">
                                            {lpAnalysis.criticalFixes.map((fix: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                                                    <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" /> {fix}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Quality Score Impact */}
                            {lpAnalysis.qualityScoreImpact && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
                                    <Star className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-bold text-blue-900 text-sm mb-1">Quality Score Impact</div>
                                        <p className="text-sm text-blue-800 leading-relaxed">{lpAnalysis.qualityScoreImpact}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* NEGATIVE KEYWORD LIBRARY MODAL */}
            {showNegativeLibrary && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowNegativeLibrary(false)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden relative z-10 flex flex-col animate-fade-in-up">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-red-600" /> Negative Keyword Library
                            </h3>
                            <button onClick={() => setShowNegativeLibrary(false)} className="p-2 rounded-full hover:bg-slate-200 transition text-slate-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="overflow-y-auto p-6 space-y-5">
                            {NEGATIVE_KEYWORD_LIBRARY.map((cat, i) => (
                                <div key={i} className="border border-slate-200 rounded-xl p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-bold text-slate-800 text-sm">{cat.category}</h4>
                                        <CopyButton text={cat.keywords.join('\n')} label="Copy All" />
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {cat.keywords.map((kw, j) => (
                                            <span key={j} className="bg-red-50 text-red-700 border border-red-100 px-2 py-1 rounded text-xs font-medium">
                                                -{kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
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
                            <button onClick={() => setIsEditing(false)} className="p-2 rounded-full hover:bg-purple-200 transition text-purple-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-4">
                                Describe what you want to change in this campaign. The AI will apply the edits directly to the data.
                            </p>
                            <textarea
                                className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none resize-none mb-4 text-sm"
                                placeholder="e.g. 'Make the ad copy more aggressive', 'Add 5 more negative keywords related to cheap services', 'Increase the budget by 20%'"
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

export default CampaignResults;
