
import { GoogleGenAI, Type, Schema, GenerateContentResponse, Chat } from "@google/genai";
import { GeneratedCampaign, UserInput, AuditReport, KeywordEntry, GeneratedMetaCampaign, ResponsiveSearchAd } from "../types";
import { GOOGLE_ADS_GUIDE_2026, CAMPAIGN_STRUCTURE_RULES, SMART_BIDDING_GUIDE } from "../src/data/googleAdsKnowledgeBase";
import { META_ADS_GUIDE_2026, PERFORMANCE_5_CHECKLIST, CREATIVE_SPECS } from "../src/data/metaAdsKnowledgeBase";

export const ensureApiKey = async () => {
  const win = window as any;
  if (win.aistudio) {
    try {
      const hasKey = await win.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        console.log("No API key selected, prompting user...");
        await win.aistudio.openSelectKey();
        // We assume it was successful, as per instructions
      }
    } catch (e) {
      console.warn("Failed to check or request API key:", e);
    }
  }
};

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("CRITICAL: API Key is missing. Please set VITE_GEMINI_API_KEY in your .env file.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

const cleanJson = (text: string): string => {
  let cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
  const startObj = cleaned.indexOf('{');
  const startArr = cleaned.indexOf('[');

  let start = -1;
  if (startObj !== -1 && startArr !== -1) start = Math.min(startObj, startArr);
  else start = startObj !== -1 ? startObj : startArr;

  const endObj = cleaned.lastIndexOf('}');
  const endArr = cleaned.lastIndexOf(']');
  const end = Math.max(endObj, endArr);

  if (start !== -1 && end !== -1) {
    return cleaned.substring(start, end + 1);
  }
  return cleaned;
};

const NEGATIVE_CONSTRAINTS = `
STRICT NEGATIVE CONSTRAINTS (FORBIDDEN WORDS & PHRASES):
You must NOT use the following words or phrases under any circumstances. If you use them, the ad is a failure.
- Forbidden Words: Delve, Tapestry, Vibrant, Landscape, Realm, Embark, Excels, Vital, Comprehensive, Intricate, Pivotal, Moreover, Arguably, Notably, Journey, Elevate, Strive, Vast, Tailor, Robust, Furthermore, Entails, Unleash, Ensure.
- Forbidden Phrases: "Dive into", "It’s important to note", "It’s important to remember", "Important to consider", "Based on the information provided", "Remember that", "Navigating the", "Delving into", "A testament to", "In Conclusion", "Final Thoughts", "Final Words".

TONE INSTRUCTIONS:
- Write like a world-class direct response copywriter (e.g., Ogilvy, Schwartz).
- Be punchy, direct, and conversational.
- Focus on benefits and raw human emotion/pain points.
`;

const CAMPAIGN_TYPE_KNOWLEDGE_BASE: Record<string, string> = {
  'Search': `
    **CAMPAIGN TYPE: SEARCH (HIGH INTENT)**
    - **Best For**: Capturing leads actively searching for specific services.
    - **Structure**: Tight Keyword Themes (STAG).
    - **Ads**: Responsive Search Ads (15 Headlines, 4 Descriptions).
    - **Metrics**: CPC, CTR, CPA.
    `,

  'PMAX': `
    **CAMPAIGN TYPE: PERFORMANCE MAX (PMAX)**
    - **Best For**: Scaling beyond search to YouTube, Display, Gmail, Maps.
    - **Structure**: "Asset Groups" (Not Ad Groups).
    - **Targeting**: "Audience Signals" (Not Keywords). Map 'keywords' field to Audience Signals.
    - **Ads**: A mix of Text, Image, and Video assets.
    - **Budget**: Requires higher budget for AI learning.
    `,

  'Display': `
    **CAMPAIGN TYPE: DISPLAY (REMARKETING)**
    - **Best For**: Retargeting website visitors.
    - **Structure**: Audience-based Ad Groups (e.g. "All Visitors", "Cart Abandoners").
    - **Targeting**: Custom Intent segments.
    - **Ads**: Responsive Display Ads (Visual + Text).
    `,

  'Video': `
    **CAMPAIGN TYPE: VIDEO (YOUTUBE)**
    - **Best For**: Awareness & Trust.
    - **Structure**: Video Ad Groups (Topics/Audiences).
    - **Targeting**: Topics, Placements (Channels), In-Market Audiences. Map 'keywords' to these targeting types.
    - **Ads**: Video Ads (Skippable In-Stream, Bumpers).
    - **Metrics**: CPV (Cost Per View).
    `,

  'Shopping': `
    **CAMPAIGN TYPE: SHOPPING**
    - **Best For**: E-commerce products.
    - **Structure**: Product Groups (Brand/Category).
    - **Targeting**: Negative Keywords only (Standard).
    - **Ads**: Product Listings (PLAs).
    `,

  'DemandGen': `
    **CAMPAIGN TYPE: DEMAND GEN**
    - **Best For**: Discovery & Demand Creation (YouTube Shorts, Discover).
    - **Structure**: Creative Themes.
    - **Targeting**: Lookalikes & Social Segments.
    - **Ads**: Visual-first (Image/Video).
    `,

  'Local': `
    **CAMPAIGN TYPE: LOCAL / CALL ONLY**
    - **Best For**: Driving phone calls and store visits.
    - **Structure**: Service Areas / Locations.
    - **Targeting**: "Near me" intent.
    - **Ads**: Call-Only Ads (Phone number focus).
    `,

  'App': `
    **CAMPAIGN TYPE: APP**
    - **Best For**: App Installs.
    - **Structure**: Automated App Ads.
    - **Metrics**: CPI (Cost Per Install).
    `
};

// Helper to fetch real-world benchmarks specific to campaign type
const fetchIndustryBenchmarks = async (industry: string, location: string, campaignType: string): Promise<string> => {
  await ensureApiKey();
  const ai = getClient();
  const prompt = `Find the latest available digital advertising benchmarks (current 2025 data with 2026 projections) for the "${industry}" industry in "${location}".
  
  I specifically need:
  1. **Avg CPC Range**: Low-end vs High-end bids for Top of Page.
  2. **Search Volume Trends**: Is demand rising or falling?
  3. **Avg CPA**: Cost per Acquisition benchmarks.
  
  Focus on **${campaignType}** specifically.
  Return a concise data summary I can use to ground my calculations.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "Industry benchmarks not found. Using general market data.";
  } catch (error) {
    console.warn("Benchmark fetch failed", error);
    return "Using standard industry benchmarks.";
  }
}

export const analyzeWebsite = async (url: string): Promise<Partial<UserInput>> => {
  await ensureApiKey();
  const ai = getClient();
  const prompt = `Research this business website: ${url}. 
    Find: Official Name, Industry, Main Product, Target Audience, Location, and Top 3 USPs.
    Use Google Search to verify recent reviews or market position.
    Return ONLY a JSON object: { businessName, industry, productService, targetAudience, location, usps }.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return JSON.parse(cleanJson(response.text || "{}"));
  } catch (error) {
    console.error("Website research failed", error);
    throw error;
  }
}

export const fetchCompetitors = async (businessName: string, productService: string, location: string): Promise<string> => {
  await ensureApiKey();
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find top 3 local/direct competitors for ${businessName} (${productService}) in ${location}. Use Google Search.
      Format: Numbered list with Name and Key Strength.`,
      config: {
        tools: [{ googleSearch: {} }]
      },
    });
    return response.text || "Competitive data unavailable.";
  } catch {
    return "Manual entry required.";
  }
};

export const analyzeDiscoveryNotes = async (notes: string): Promise<Partial<UserInput>> => {
  await ensureApiKey();
  const ai = getClient();
  const prompt = `Analyze these discovery call notes and extract key business details for a marketing campaign.
    
    NOTES:
    "${notes}"
    
    Extract the following fields if present:
    - businessName
    - industry
    - productService
    - location
    - targetAudience
    - painPoints
    - usps
    - offers
    - competitors
    - brandVoice
    - primaryOffer
    - visualStyle
    - monthlyBudget
    - goal
    
    Return ONLY a JSON object with these keys. If a field is not found, omit it.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(cleanJson(response.text || "{}"));
  } catch (error) {
    console.error("Discovery note analysis failed", error);
    throw error;
  }
}

// Modified Schema with looser descriptions to allow polymorphism
export const campaignSchema: any = {
  type: Type.OBJECT,
  properties: {
    budgetAnalysis: {
      type: Type.OBJECT,
      properties: {
        benchmarks: { type: Type.OBJECT, properties: { avgCpc: { type: Type.STRING, description: "Avg Cost Per Action (CPC, CPV, or CPA)" }, avgCvr: { type: Type.STRING } }, required: ["avgCpc", "avgCvr"] },
        maxCpaAnalysis: { type: Type.OBJECT, properties: { breakEvenCpa: { type: Type.STRING }, targetCpa: { type: Type.STRING } }, required: ["breakEvenCpa", "targetCpa"] },
        scenarios: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              budget: { type: Type.STRING },
              expectedClicks: { type: Type.STRING, description: "Clicks, Views, or Interactions" },
              expectedConversions: { type: Type.STRING },
              estCpa: { type: Type.STRING },
              timeline: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["label", "budget", "expectedClicks", "expectedConversions", "estCpa", "timeline", "description"]
          }
        },
        roiProjection: { type: Type.OBJECT, properties: { monthlyAdSpend: { type: Type.STRING }, estimatedRevenue: { type: Type.STRING }, estimatedProfit: { type: Type.STRING }, roas: { type: Type.STRING } }, required: ["monthlyAdSpend", "estimatedRevenue", "estimatedProfit", "roas"] },
        recommendation: { type: Type.OBJECT, properties: { monthlyBudget: { type: Type.STRING }, dailyBudget: { type: Type.STRING }, reasoning: { type: Type.STRING } }, required: ["monthlyBudget", "dailyBudget", "reasoning"] },
        seasonalAnalysis: { type: Type.OBJECT, properties: { adjustments: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { month: { type: Type.STRING }, adjustment: { type: Type.STRING }, amount: { type: Type.STRING }, reasoning: { type: Type.STRING } }, required: ["month", "adjustment", "amount", "reasoning"] } }, currentMonthMultiplier: { type: Type.STRING } }, required: ["adjustments", "currentMonthMultiplier"] },
        competitorSpendAnalysis: { type: Type.OBJECT, properties: { estimatedSpendLow: { type: Type.STRING }, estimatedSpendHigh: { type: Type.STRING }, marketPosition: { type: Type.STRING }, strategyRecommendation: { type: Type.STRING } }, required: ["estimatedSpendLow", "estimatedSpendHigh", "marketPosition", "strategyRecommendation"] },
        allocationBreakdown: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, percentage: { type: Type.STRING }, amount: { type: Type.STRING }, reasoning: { type: Type.STRING } }, required: ["category", "percentage", "amount", "reasoning"] } },
        healthScore: { type: Type.OBJECT, properties: { overallScore: { type: Type.NUMBER }, rating: { type: Type.STRING }, breakdown: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { component: { type: Type.STRING }, score: { type: Type.NUMBER }, maxScore: { type: Type.NUMBER }, assessment: { type: Type.STRING } }, required: ["component", "score", "maxScore", "assessment"] } }, strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, risks: { type: Type.ARRAY, items: { type: Type.STRING } }, recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }, confidenceLevel: { type: Type.STRING } }, required: ["overallScore", "rating", "breakdown", "strengths", "risks", "recommendations", "confidenceLevel"] }
      },
      required: ["benchmarks", "maxCpaAnalysis", "scenarios", "roiProjection", "recommendation", "seasonalAnalysis", "competitorSpendAnalysis", "allocationBreakdown", "healthScore"]
    },
    strategy: { type: Type.OBJECT, properties: { campaignType: { type: Type.STRING }, objective: { type: Type.STRING }, biddingStrategy: { type: Type.STRING }, biddingReasoning: { type: Type.STRING }, budgetAllocation: { type: Type.STRING }, audienceSegments: { type: Type.ARRAY, items: { type: Type.STRING } }, demographicTargeting: { type: Type.STRING }, locationStrategy: { type: Type.STRING }, adSchedule: { type: Type.STRING } }, required: ["campaignType", "objective", "biddingStrategy", "budgetAllocation", "audienceSegments", "locationStrategy"] },
    structure: { type: Type.OBJECT, properties: { diagram: { type: Type.STRING }, networks: { type: Type.ARRAY, items: { type: Type.STRING } }, settings: { type: Type.OBJECT, properties: { languages: { type: Type.STRING }, adRotation: { type: Type.STRING }, startDate: { type: Type.STRING }, urlOptions: { type: Type.STRING } }, required: ["languages", "adRotation"] } }, required: ["diagram", "settings"] },
    adGroups: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          theme: { type: Type.STRING },
          targetCpc: { type: Type.STRING },
          individualBidStrategy: { type: Type.STRING },
          keywords: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                matchType: { type: Type.STRING, description: "Broad, Phrase, Exact, OR 'Signal', 'Topic' for non-search types." },
                intent: { type: Type.STRING, description: "High, Medium, or Low" },
                searchVolume: { type: Type.STRING },
                avgCpc: { type: Type.STRING }
              },
              required: ["term", "matchType", "intent", "searchVolume", "avgCpc"]
            }
          },
          negativeKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          ads: {
            type: Type.ARRAY,
            items: { type: Type.OBJECT, properties: { headlines: { type: Type.ARRAY, items: { type: Type.STRING } }, descriptions: { type: Type.ARRAY, items: { type: Type.STRING } }, paths: { type: Type.ARRAY, items: { type: Type.STRING } }, }, required: ["headlines", "descriptions", "paths"] }
          }
        },
        required: ["name", "theme", "targetCpc", "individualBidStrategy", "keywords", "ads"]
      }
    },
    assets: {
      type: Type.OBJECT, properties: {
        sitelinks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, desc1: { type: Type.STRING }, desc2: { type: Type.STRING }, purpose: { type: Type.STRING } }, required: ["text", "desc1", "desc2"] } }, callouts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING } }, required: ["text"] } }, snippets: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { header: { type: Type.STRING }, values: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["header", "values"] } }, imageIdeas: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, style: { type: Type.STRING }, ratio: { type: Type.STRING } }, required: ["description", "style"] } }, callAsset: { type: Type.STRING }, promotion: { type: Type.OBJECT, properties: { occasion: { type: Type.STRING }, details: { type: Type.STRING } } },
        priceAssets: { type: Type.OBJECT, properties: { header: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, price: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "price"] } } }, required: ["header", "items"] },
        leadForm: { type: Type.OBJECT, properties: { headline: { type: Type.STRING }, description: { type: Type.STRING }, requiredFields: { type: Type.ARRAY, items: { type: Type.STRING } }, ctaType: { type: Type.STRING } }, required: ["headline", "requiredFields"] }
      }, required: ["sitelinks", "callouts", "snippets", "imageIdeas"]
    },
    conversionTracking: { type: Type.OBJECT, properties: { primaryActions: { type: Type.ARRAY, items: { type: Type.STRING } }, secondaryActions: { type: Type.ARRAY, items: { type: Type.STRING } }, setupInstructions: { type: Type.STRING }, gtmInstructions: { type: Type.ARRAY, items: { type: Type.STRING } }, eventSnippet: { type: Type.STRING }, enhancedConversions: { type: Type.STRING }, attributionModel: { type: Type.STRING } }, required: ["primaryActions", "setupInstructions", "gtmInstructions", "eventSnippet", "enhancedConversions", "attributionModel"] },
    landingPage: { type: Type.OBJECT, properties: { headlineRecommendation: { type: Type.STRING }, contentSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }, speedOptimization: { type: Type.STRING }, mobileChecklist: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["headlineRecommendation", "contentSuggestions"] },
    optimization: { type: Type.OBJECT, properties: { launchPhase: { type: Type.STRING }, learningPhase: { type: Type.STRING }, scalingPhase: { type: Type.STRING }, keyMetrics: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["launchPhase", "learningPhase", "scalingPhase"] },
    competitorAnalysis: { type: Type.OBJECT, properties: { missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }, messagingGaps: { type: Type.ARRAY, items: { type: Type.STRING } }, differentiationStrategy: { type: Type.STRING }, citations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { source: { type: Type.STRING }, url: { type: Type.STRING } }, required: ["source", "url"] } } }, required: ["messagingGaps", "differentiationStrategy", "citations"] }
  },
  required: ["budgetAnalysis", "strategy", "structure", "adGroups", "assets", "conversionTracking", "landingPage", "optimization", "competitorAnalysis"]
};

export const metaCampaignSchema: any = {
  type: Type.OBJECT,
  properties: {
    campaignName: { type: Type.STRING },
    objective: { type: Type.STRING },
    specialAdCategories: { type: Type.STRING },
    buyingType: { type: Type.STRING },
    performance5Score: {
      type: Type.OBJECT,
      properties: {
        overallScore: { type: Type.NUMBER },
        breakdown: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              pillar: { type: Type.STRING },
              score: { type: Type.NUMBER },
              assessment: { type: Type.STRING },
              recommendation: { type: Type.STRING }
            },
            required: ["pillar", "score", "assessment", "recommendation"]
          }
        }
      },
      required: ["overallScore", "breakdown"]
    },
    budgetAnalysis: {
      type: Type.OBJECT,
      properties: {
        benchmarks: { type: Type.OBJECT, properties: { avgCpc: { type: Type.STRING }, avgCvr: { type: Type.STRING } }, required: ["avgCpc", "avgCvr"] },
        maxCpaAnalysis: { type: Type.OBJECT, properties: { breakEvenCpa: { type: Type.STRING }, targetCpa: { type: Type.STRING } }, required: ["breakEvenCpa", "targetCpa"] },
        scenarios: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              budget: { type: Type.STRING },
              expectedClicks: { type: Type.STRING },
              expectedConversions: { type: Type.STRING },
              estCpa: { type: Type.STRING },
              timeline: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["label", "budget", "expectedClicks", "expectedConversions", "estCpa", "timeline", "description"]
          }
        },
        roiProjection: { type: Type.OBJECT, properties: { monthlyAdSpend: { type: Type.STRING }, estimatedRevenue: { type: Type.STRING }, estimatedProfit: { type: Type.STRING }, roas: { type: Type.STRING } }, required: ["monthlyAdSpend", "estimatedRevenue", "estimatedProfit", "roas"] },
        recommendation: { type: Type.OBJECT, properties: { monthlyBudget: { type: Type.STRING }, dailyBudget: { type: Type.STRING }, reasoning: { type: Type.STRING } }, required: ["monthlyBudget", "dailyBudget", "reasoning"] },
        seasonalAnalysis: { type: Type.OBJECT, properties: { adjustments: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { month: { type: Type.STRING }, adjustment: { type: Type.STRING }, amount: { type: Type.STRING }, reasoning: { type: Type.STRING } }, required: ["month", "adjustment", "amount", "reasoning"] } }, currentMonthMultiplier: { type: Type.STRING } }, required: ["adjustments", "currentMonthMultiplier"] },
        competitorSpendAnalysis: { type: Type.OBJECT, properties: { estimatedSpendLow: { type: Type.STRING }, estimatedSpendHigh: { type: Type.STRING }, marketPosition: { type: Type.STRING }, strategyRecommendation: { type: Type.STRING } }, required: ["estimatedSpendLow", "estimatedSpendHigh", "marketPosition", "strategyRecommendation"] },
        allocationBreakdown: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, percentage: { type: Type.STRING }, amount: { type: Type.STRING }, reasoning: { type: Type.STRING } }, required: ["category", "percentage", "amount", "reasoning"] } },
        healthScore: { type: Type.OBJECT, properties: { overallScore: { type: Type.NUMBER }, rating: { type: Type.STRING }, breakdown: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { component: { type: Type.STRING }, score: { type: Type.NUMBER }, maxScore: { type: Type.NUMBER }, assessment: { type: Type.STRING } }, required: ["component", "score", "maxScore", "assessment"] } }, strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, risks: { type: Type.ARRAY, items: { type: Type.STRING } }, recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }, confidenceLevel: { type: Type.STRING } }, required: ["overallScore", "rating", "breakdown", "strengths", "risks", "recommendations", "confidenceLevel"] }
      },
      required: ["benchmarks", "maxCpaAnalysis", "scenarios", "roiProjection", "recommendation", "seasonalAnalysis", "competitorSpendAnalysis", "allocationBreakdown", "healthScore"]
    },
    budgetStrategy: {
      type: Type.OBJECT,
      properties: {
        dailyBudget: { type: Type.STRING },
        bidStrategy: { type: Type.STRING }
      },
      required: ["dailyBudget", "bidStrategy"]
    },
    accountStructure: {
      type: Type.OBJECT,
      properties: {
        structureType: { type: Type.STRING },
        campaigns: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              purpose: { type: Type.STRING },
              budgetSplit: { type: Type.STRING }
            },
            required: ["name", "purpose", "budgetSplit"]
          }
        },
        rationale: { type: Type.STRING }
      },
      required: ["structureType", "campaigns", "rationale"]
    },
    creativeStrategy: {
      type: Type.OBJECT,
      properties: {
        visualHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
        copyAngles: { type: Type.ARRAY, items: { type: Type.STRING } },
        formatSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["visualHooks", "copyAngles", "formatSuggestions"]
    },
    adSets: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          targeting: {
            type: Type.OBJECT,
            properties: {
              audienceType: { type: Type.STRING },
              details: { type: Type.STRING },
              location: { type: Type.STRING },
              age: { type: Type.STRING }
            },
            required: ["audienceType", "details", "location", "age"]
          },
          placements: { type: Type.STRING },
          budgetAllocation: { type: Type.STRING },
          ads: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                format: { type: Type.STRING },
                primaryText: { type: Type.STRING },
                headline: { type: Type.STRING },
                description: { type: Type.STRING },
                callToAction: { type: Type.STRING },
                visualDescription: { type: Type.STRING }
              },
              required: ["primaryText", "headline", "description", "visualDescription"]
            }
          }
        },
        required: ["name", "targeting", "ads"]
      }
    },
    trackingSetup: {
      type: Type.OBJECT,
      properties: {
        pixelInstallation: { type: Type.ARRAY, items: { type: Type.STRING } },
        standardEvents: { type: Type.ARRAY, items: { type: Type.STRING } },
        gtmInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
        capiInstructions: { type: Type.ARRAY, items: { type: Type.STRING } },
        domainVerification: { type: Type.STRING }
      },
      required: ["pixelInstallation", "standardEvents", "gtmInstructions", "capiInstructions", "domainVerification"]
    },
    optimization: {
      type: Type.OBJECT,
      properties: {
        testingPlan: { type: Type.STRING },
        scalingMetrics: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["testingPlan", "scalingMetrics"]
    }
  },
  required: ["campaignName", "objective", "performance5Score", "budgetAnalysis", "budgetStrategy", "accountStructure", "creativeStrategy", "adSets", "trackingSetup", "optimization"]
};


export const generateCampaign = async (data: UserInput): Promise<Omit<GeneratedCampaign, 'id' | 'createdAt' | 'businessName' | 'industry' | 'location'>> => {
  await ensureApiKey();
  const ai = getClient();

  const userCampaignType = data.campaignTypePreference || 'Search';

  // 1. Fetch Specific Benchmarks
  const benchmarks = await fetchIndustryBenchmarks(data.industry, data.location, userCampaignType);

  // Determine Context from Knowledge Base
  const campaignKnowledge = CAMPAIGN_TYPE_KNOWLEDGE_BASE[userCampaignType] || CAMPAIGN_TYPE_KNOWLEDGE_BASE['Search'];

  // Logic to determine ad group instruction based on type
  let adGroupInstruction = "";
  let targetCount = parseInt(data.targetAdGroupCount || "0");

  let groupType = 'Ad Groups';
  if (userCampaignType === 'PMAX') groupType = 'Asset Groups';
  else if (userCampaignType === 'Shopping') groupType = 'Product Groups';
  else if (userCampaignType === 'DemandGen') groupType = 'Creative Themes';

  // Structure Preference Logic
  const structurePref = data.structurePreference === 'Split Campaigns'
    ? "CRITICAL: The user wants to split these themes into SEPARATE CAMPAIGNS. Treat each item in the 'adGroups' array as a distinct CAMPAIGN Strategy. Name them 'Campaign: [Theme Name]'."
    : "Structure: Consolidated Campaign with multiple Ad Groups.";

  // Ad Format Preference Logic
  const adFormatPref = data.adFormatPreference
    ? `User Ad Format Preference: ${data.adFormatPreference}. Prioritize this format in the 'ads' array.`
    : "";

  if (targetCount > 0) {
    adGroupInstruction = `Constraint: Create exactly ${targetCount} ${groupType}. ${structurePref}`;
  } else {
    adGroupInstruction = `Analyze the product service. Create logical ${groupType} based on distinct themes. ${structurePref}`;
  }

  // Budget & Strategy Context
  const isFixedBudget = data.budgetPreference === 'fixed' && data.monthlyBudget;
  let budgetInstruction = "";

  if (isFixedBudget) {
    budgetInstruction = `Constraint: Monthly budget is ${data.monthlyBudget}. Provide 3 scenarios (Conservative, Moderate, Aggressive) around this number.`;
  } else if (data.targetLeadsPerMonth) {
    budgetInstruction = `Constraint: Target ${data.targetLeadsPerMonth} leads/month. Calculate budget based on estimated CPA/CPV.`;
  } else {
    budgetInstruction = `Estimate budget for aggressive market entry.`;
  }

  // Inject user's specific strategic inputs
  const strategicDeepDive = `
  STRATEGIC DEEP DIVE (USE THIS FOR COPY & TARGETING):
  - **Discovery Notes Context**: "${data.discoveryNotes || 'None'}" -> Use this raw context to inform all creative and strategic decisions.
  - **Competitor Weakness**: "${data.competitorWeakness || 'Not specified - assume generic service gaps'}" -> Leverage this in Ad Headlines.
  - **Psychological Hook**: "${data.psychologicalHook || 'General Benefit'}" -> Infuse this emotion into all descriptions.
  - **Negative Constraints**: "${data.negativeKeywords || 'None'}" -> If Search Campaign, add these to 'negativeKeywords' array immediately.
  - **Launch Urgency**: "${data.launchTiming || 'Standard'}" -> Adjust 'Launch Phase' recommendations accordingly.
  - **LTV**: ${data.customerLtv ? `$${data.customerLtv}` : 'Unknown'} -> Use for ROAS calculation.
  `;

  const GOOGLE_ADS_COPY_MASTERY = `
  RSA COPYWRITING RULES (STRICT CHARACTER LIMITS):
  1. **Headlines**: ABSOLUTE MAXIMUM of 30 characters including spaces. You MUST count characters. Keep them short.
     - NO generic phrases like "Best Service". 
     - MUST use: Dynamic Keyword Insertion syntax {KeyWord:Default} where appropriate (count default text length).
     - MUST include 1 "Pattern Interrupt" headline (e.g., "Stop Overpaying for X").
     - MUST include 1 Social Proof headline (e.g., "Trusted by 500+ locals").
  2. **Descriptions**: ABSOLUTE MAXIMUM of 90 characters including spaces. You MUST count characters.
     - Focus on the "Micro-Moment": What is the user feeling *right now*?
     - End with a clear, low-friction CTA (e.g., "Get a Quote in 2 Min").
     - Avoid repetition.
  `;

  const DATA_FOUNDATION_ANALYSIS = `
  DATA MATURITY AUDIT:
  - CRM: ${data.crmTool || 'None'}
  - Customer Match: ${data.hasCustomerMatch ? 'Available' : 'Unavailable'}
  - Tracking: ${data.trackingStatus || 'Unknown'}

  INSTRUCTIONS:
  1. If Tracking is 'None' or 'Basic', you MUST include a "Critical Fix" in the 'conversionTracking' section urging Enhanced Conversions.
  2. If Customer Match is 'Available', you MUST recommend creating a "Customer Match" audience segment in the 'audienceSegments' array.
  3. If PMAX/Demand Gen is selected but Data Maturity is low, warn the user in the 'strategy' section that learning periods will be longer.
  `;

  const KEYWORD_MATCHING_GUIDE = `
  KEYWORD MATCHING STRATEGY (2026 BEST PRACTICES):
  1. **Broad Match**: 
     - **Use Case**: Best for Smart Bidding (Target CPA/ROAS) to capture new, high-intent queries you might miss.
     - **Behavior**: Matches queries related to your keyword's meaning, including synonyms, misspellings, and related searches.
     - **Strategy**: Pair with Smart Bidding for maximum reach and conversion volume.
  2. **Phrase Match**:
     - **Use Case**: Moderate control. Good for specific product/service categories where word order matters less but intent must be precise.
     - **Behavior**: Matches queries that include the meaning of your keyword.
     - **Strategy**: Use for core service terms to ensure relevance while allowing some flexibility.
  3. **Exact Match**:
     - **Use Case**: Tightest control. Best for brand terms, high-competition keywords, or limited budgets.
     - **Behavior**: Matches queries with the same meaning as your keyword.
     - **Strategy**: Use for "money keywords" where you need absolute precision.
  4. **Negative Keywords**:
     - **Crucial**: actively filter out irrelevant traffic (e.g., "free", "jobs", "diy") to prevent wasted spend.
     - **Strategy**: Add negative keywords at the campaign or ad group level to refine traffic.
  `;

  const prompt = `Elite Google Ads Architect (2026 Edition). Build a world-class strategy for: ${JSON.stringify(data)}.
  
  REAL-TIME MARKET DATA (${userCampaignType} Specific):
  ${benchmarks}

  ${strategicDeepDive}

  ${GOOGLE_ADS_GUIDE_2026}

  ${DATA_FOUNDATION_ANALYSIS}

  ${NEGATIVE_CONSTRAINTS}

  ${GOOGLE_ADS_COPY_MASTERY}

  ${KEYWORD_MATCHING_GUIDE}
  
  BRAND VOICE: ${data.brandVoice || 'Professional & Trustworthy'}
  
  =============================================
  CRITICAL INSTRUCTIONS FOR: ${userCampaignType.toUpperCase()}
  =============================================
  ${campaignKnowledge}
  
  CRITICAL DELIVERABLE REQUIREMENTS (MANDATORY):
  1. **KEYWORDS**: You MUST generate at least 15 HIGH-VOLUME, strictly relevant keywords per Ad Group. 
     - **DATA ACCURACY**: All Search Volume and Avg CPC numbers MUST align with the provided Benchmarks above. Do not hallucinate $0.10 CPCs if the benchmark is $5.00.
     - Focus on proven search terms with commercial intent.
     - Avoid obscure zero-volume keywords.
     - **MATCH TYPES**: Apply match types strategically based on the ${KEYWORD_MATCHING_GUIDE}.
       - If Smart Bidding is likely (e.g., "AI Calculated" budget), lean towards **Broad Match** for reach.
       - If Budget is limited or specific control is needed, use **Phrase/Exact Match**.
  2. **ADS**: You MUST generate at least 2 distinct Ad Variations (RSAs) per Ad Group.
     - Variation 1: Direct Offer/Hook focus.
     - Variation 2: Problem/Solution or Emotional focus.
  3. **ASSETS**: Ensure you provide at least 5 headlines and 4 descriptions as per the Creative Excellence pillar.
  
  **SCHEMA MAPPING INSTRUCTIONS**:
  The JSON schema uses standard field names ("adGroups", "keywords", "ads"). You MUST map your campaign type concepts to these fields:
  
  1. **"adGroups"**:
     - For PMAX: Generate **ASSET GROUPS**.
     - For Video: Generate **VIDEO TOPIC GROUPS**.
     - For Search: Generate **KEYWORD THEMES**.
  
  2. **"keywords"** (inside adGroups):
     - For PMAX: Generate **AUDIENCE SIGNALS** (Interests, Custom Segments). Set 'matchType' to 'Signal'.
     - For Video: Generate **TARGETING CRITERIA** (Channels, Topics). Set 'matchType' to 'Topic' or 'Placement'.
     - For Search: Generate standard Keywords. Use 'Broad', 'Phrase', 'Exact'.
  
  3. **"ads"**:
     - For PMAX/Video: Generate Headlines/Descriptions suitable for video/display assets.
     - For Call-Only: Ensure headlines are call-to-actions (e.g. "Call Now").

  CONTEXT & BUDGET:
  - ${budgetInstruction}
  
  STRUCTURE INSTRUCTIONS:
  ${adGroupInstruction}
  ${adFormatPref}

  Return JSON according to the schema.`;


  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: campaignSchema,
      thinkingConfig: { thinkingBudget: 32768 },
    }
  });

  return JSON.parse(cleanJson(response.text || "{}"));
};

// ... existing Meta generation ...
// (Meta generation is generally stable with existing prompt, no major changes needed here 
//  unless user specifically flagged Meta issues, but the prompt focused on Google Ads campaign types)
export const generateMetaCampaign = async (data: UserInput): Promise<any> => {
  await ensureApiKey();
  const ai = getClient();
  const benchmarks = await fetchIndustryBenchmarks(data.industry, data.location, "Meta/Facebook");

  // Logic to determine ad set instruction based on user input
  let adSetInstruction = "";
  let targetCount = parseInt(data.targetAdGroupCount || "0");
  if (targetCount > 0) {
    adSetInstruction = `1. **Ad Sets**: Create EXACTLY ${targetCount} distinct Ad Sets.`;
  } else {
    adSetInstruction = `1. **Ad Sets**: Create 3 distinct angles.`;
  }

  const isFixedBudget = data.budgetPreference === 'fixed' && data.monthlyBudget;
  let budgetInstruction = "";
  if (isFixedBudget) {
    budgetInstruction = `Constraint: Monthly budget is ${data.monthlyBudget}. Provide 3 scenarios.`;
  } else {
    budgetInstruction = `Estimate budget for aggressive growth.`;
  }

  const strategicDeepDive = `
  STRATEGIC DEEP DIVE (USE THIS FOR COPY & TARGETING):
  - **Discovery Notes Context**: "${data.discoveryNotes || 'None'}" -> Use this raw context to inform all creative and strategic decisions.
  - **Competitor Weakness**: "${data.competitorWeakness || 'Not specified'}" -> Exploit this in Primary Text.
  - **Psychological Hook**: "${data.psychologicalHook || 'General Benefit'}" -> Drive the visual hook.
  - **Creative Angles**: "${data.creativeAngles || 'AI Autogenerated'}" -> Use these as the core themes for Ad Sets 1, 2, and 3.
  - **Launch Urgency**: "${data.launchTiming || 'Standard'}" -> Adjust 'Testing Plan'.
  `;

  const META_DATA_FOUNDATION_ANALYSIS = `
  DATA MATURITY AUDIT:
  - CRM: ${data.crmTool || 'None'}
  - Customer Match: ${data.hasCustomerMatch ? 'Available' : 'Unavailable'}
  - Tracking: ${data.trackingStatus || 'Unknown'}

  INSTRUCTIONS:
  1. If Tracking is 'None' or 'Basic', you MUST include a "Critical Fix" in the 'capiInstructions' array urging CAPI (Conversions API) Implementation.
  2. If Customer Match is 'Available', you MUST recommend creating a "Customer Match" audience segment in the 'targeting' section of Ad Sets.
  `;

  const prompt = `You are a world-class Direct Response Copywriter & Meta Ads Strategist (Ogilvy meets TikTok Creator).
  
  OBJECTIVE: Create a high-converting Facebook & Instagram campaign for: ${JSON.stringify(data)}.
  
  REAL-TIME BENCHMARKS (Industry Specific): ${benchmarks}
  
  ${strategicDeepDive}
  
  ${META_ADS_GUIDE_2026}

  PERFORMANCE 5 FRAMEWORK CHECKLIST:
  ${PERFORMANCE_5_CHECKLIST.join('\n')}

  CREATIVE SPECS REFERENCE:
  ${JSON.stringify(CREATIVE_SPECS, null, 2)}

  ${META_DATA_FOUNDATION_ANALYSIS}
  
  ${NEGATIVE_CONSTRAINTS}
  
  ELITE COPYWRITING FRAMEWORK (FOLLOW EXACTLY — THIS IS THE MOST IMPORTANT SECTION):

  **HEADLINE** (ABSOLUTE MAX 40 chars — you MUST count every character including spaces):
  - Names a specific benefit or concrete outcome. Numbers always outperform vague adjectives.
  - Proven formulas: "[Number] [Result] in [Timeframe]" | "Finally: [Specific Benefit]" | "Stop [Pain]. Get [Gain]." | "Free [High-Value Thing] for [Target]"
  - ✅ GOOD: "Get More Leads in 48 Hours" (26 chars) | "Finally Debt-Free This Year" (27 chars) | "50% Off Ends Sunday" (19 chars)
  - ❌ BAD (too vague): "Transform Your Business Today" | "Innovative Solutions For You" | "Take It to the Next Level"

  **DESCRIPTION** (ABSOLUTE MAX 30 chars — count every character):
  - Reinforce the CTA or add urgency/scarcity. One punchy phrase.
  - ✅ GOOD: "Free estimate. No pressure." (28) | "Limited spots—book now." (23) | "No contracts. Cancel anytime." (29)

  **PRIMARY TEXT** (The highest-leverage element. Write it like a mini sales letter, not ad copy):
  Format with blank lines between each paragraph. Total: 150–500 characters. Never one wall of text.

  MANDATORY STRUCTURE — follow this exact order:

  🪝 PARAGRAPH 1 — SCROLL-STOPPING HOOK (1 sentence, max 2):
  Make them feel seen, shocked, or curious. Choose ONE formula:
    → Pain mirror: "Still [paying too much / wasting time on / struggling with X] without getting [desired result]?"
    → Bold claim: "We've helped [specific number] [target audience] [specific result] in [timeframe]."
    → Counterintuitive: "The reason your [X] isn't working has nothing to do with [what they think]."

  😤 PARAGRAPH 2 — AGITATE THE PAIN (1-2 sentences):
  Name their exact frustration using their own language. Be visceral and specific. No fluff.

  💡 PARAGRAPH 3 — YOUR SOLUTION (2-3 sentences):
  What you do + your unique mechanism. Include ONE concrete number or stat (not a range). "We don't guess — we [specific process that makes you different]."

  ⭐ PARAGRAPH 4 — SOCIAL PROOF (1 sentence):
  One credibility signal: customer count, star rating, award, specific case study result.

  👉 PARAGRAPH 5 — FRICTIONLESS CTA (1-2 sentences):
  Tell them exactly what to do AND what they get. Make the next step obvious and low-risk.
  Example: "Click 'Learn More' → fill out our 60-second form → get your custom quote by tomorrow morning."

  EMOJI RULES: Max 2 emojis in entire primary text. Use ✅ for social proof, 🔥 for urgency. NO decorative emoji spam.
  TONE: Confident expert texting a friend. Short sentences. Active voice. Zero corporate speak.

  **MANDATORY COPY ANGLE DIVERSITY — EACH AD SET MUST USE A DIFFERENT PSYCHOLOGICAL DRIVER**:
  - Ad Set 1 → PAIN/PROBLEM ANGLE: Open by naming the specific frustration. Dig into it. Offer relief only at the end.
  - Ad Set 2 → DREAM OUTCOME ANGLE: Open with the vivid after-state. Paint their ideal result first, then show how.
  - Ad Set 3 → AUTHORITY/PROOF ANGLE: Open with a credential, number, or case study result. Build trust before selling.

  POWER WORDS (weave in naturally, don't stuff): Proven, Guaranteed, Free, Finally, Stop, Warning, Discover, Exclusive, Limited, Save, Secret, Real, Instant, Zero [risk/hassle/contracts].
  ABSOLUTELY FORBIDDEN PHRASES (instant failure): "game-changer", "seamless experience", "cutting-edge", "take your business to the next level", "in today's landscape", "innovative solution", "leverage synergies", "empower your brand".

  **Instagram Nuance**: End CTA with "Link in bio ↑" or "Tap the link below." Slightly warmer, more personal tone. Shorter sentences.
  
  IMAGE PROMPT RULES:
  - Generative AI prompts must be descriptive enough to create "Instagram-ready" visuals without editing.
  - Include specific lighting (e.g. "Cinematic teal and orange", "Natural window light").
  - Focus on *Outcome* or *Emotion*.
  
  BUDGET CONTEXT: ${budgetInstruction}
  
  STRUCTURE INSTRUCTIONS:
  - You MUST output the "Two-Campaign System" in the 'accountStructure' field.
  - ${adSetInstruction}
  - FOR 'visualDescription':
    - You are an expert AI Prompt Engineer for Midjourney/Imagen.
    - Write a DETAILED, SELF-CONTAINED image prompt.
    - STRUCTURE: [Subject/Action] + [Environment/Background] + [Lighting/Mood] + [Style/Camera] + [Text Requirement].
    - STYLE: If 'UGC' is selected, specify "iPhone photography, raw, authentic, selfie style". If 'Cinematic', specify "85mm lens, f/1.8, cinematic lighting, 4k".
    - TEXT: If the ad needs text IN the image, specify: 'The text "OFFER" appears clearly on...'.
  
  Return strictly JSON matching the schema.`;


  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: metaCampaignSchema,
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  return JSON.parse(cleanJson(response.text || "{}"));
};

// ... keep existing exports ...
export const createAdSpecialistChat = () => {
  const ai = getClient();
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: `You are an elite Google Ads and Meta Ads Strategist (2026 Edition).
      
      CAPABILITIES:
      1. You can analyze user-uploaded files, including:
         - **Images**: Screenshots of Google Ads/Facebook Ads dashboards, ad creative examples, or competitor ads.
         - **PDFs/Docs**: Strategy documents, campaign reports, or client briefs.
      
      BEHAVIOR:
      1. When a file is uploaded, analyze its visual and textual content deeply before responding. 
      2. If it's a dashboard screenshot, extract metrics (CPA, CTR, ROAS) and critique them.
      3. If it's a PDF report, summarize key findings and suggest next steps.
      4. Be direct, professional, and high-level.
      5. Use specific metrics in your advice.
      6. Critique ruthlessly but constructively.
      
      Do not provide generic advice. Provide actionable "fix it now" steps.`,
    }
  });
};

export const generateAudit = async (dataBlob: string): Promise<any> => {
  await ensureApiKey();
  const ai = getClient();

  const auditSchema: any = {
    type: Type.OBJECT,
    properties: {
      sourceSummary: { type: Type.STRING },
      industryContext: { type: Type.STRING },
      healthScore: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          rating: { type: Type.STRING },
          breakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { component: { type: Type.STRING }, score: { type: Type.NUMBER }, assessment: { type: Type.STRING } },
              required: ["component", "score", "assessment"]
            }
          }
        },
        required: ["score", "rating", "breakdown"]
      },
      benchmarks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { metric: { type: Type.STRING }, yourValue: { type: Type.STRING }, industryAvg: { type: Type.STRING }, assessment: { type: Type.STRING } },
          required: ["metric", "yourValue", "industryAvg", "assessment"]
        }
      },
      wastedSpend: {
        type: Type.OBJECT,
        properties: {
          total: { type: Type.STRING },
          percentage: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { category: { type: Type.STRING }, amount: { type: Type.STRING }, fix: { type: Type.STRING } },
              required: ["category", "amount", "fix"]
            }
          },
          projectedSavings: { type: Type.STRING }
        },
        required: ["total", "percentage", "items", "projectedSavings"]
      },
      opportunities: {
        type: Type.OBJECT,
        properties: {
          quickWins: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, impact: { type: Type.STRING }, action: { type: Type.STRING } }, required: ["title", "impact", "action"] } },
          mediumTerm: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, impact: { type: Type.STRING }, action: { type: Type.STRING } }, required: ["title", "impact", "action"] } },
          strategic: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, impact: { type: Type.STRING }, action: { type: Type.STRING } }, required: ["title", "impact", "action"] } }
        },
        required: ["quickWins", "mediumTerm", "strategic"]
      },
      recommendations: {
        type: Type.OBJECT,
        properties: {
          keywords: { type: Type.OBJECT, properties: { pause: { type: Type.ARRAY, items: { type: Type.STRING } }, scale: { type: Type.ARRAY, items: { type: Type.STRING } }, add: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["pause", "scale", "add"] },
          adCopy: { type: Type.OBJECT, properties: { headlines: { type: Type.ARRAY, items: { type: Type.STRING } }, issues: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["headlines", "issues"] },
          bids: { type: Type.ARRAY, items: { type: Type.STRING } },
          structure: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["keywords", "adCopy", "bids", "structure"]
      },
      actionPlan: {
        type: Type.OBJECT,
        properties: {
          immediate: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { action: { type: Type.STRING }, steps: { type: Type.STRING } }, required: ["action", "steps"] } },
          weekly: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { action: { type: Type.STRING }, steps: { type: Type.STRING } }, required: ["action", "steps"] } },
          monthly: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { action: { type: Type.STRING }, steps: { type: Type.STRING } }, required: ["action", "steps"] } }
        },
        required: ["immediate", "weekly", "monthly"]
      }
    },
    required: ["sourceSummary", "industryContext", "healthScore", "benchmarks", "wastedSpend", "opportunities", "recommendations", "actionPlan"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Detailed account audit for: ${dataBlob}. Identify budget waste and scaling winners. Return strictly JSON matching the schema.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: auditSchema,
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });
  return JSON.parse(cleanJson(response.text || "{}"));
};

export const generateMoreKeywords = async (industry: string, location: string, theme: string, existingKeywords: string[]): Promise<KeywordEntry[]> => {
  const ai = getClient();

  // Define strict schema for the keywords
  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        term: { type: Type.STRING },
        matchType: { type: Type.STRING }, // Relaxed
        intent: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
        searchVolume: { type: Type.STRING },
        avgCpc: { type: Type.STRING }
      },
      required: ["term", "matchType", "intent", "searchVolume", "avgCpc"]
    }
  };

  try {
    // Use Google Search Tool to get accurate volume/CPC data for the specific niche
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5-10 NEW, high-intent Google Ads keywords/signals for:
            Industry: ${industry}
            Location: ${location}
            Theme: ${theme}
            
            **CRITICAL DATA REQUIREMENT:**
            - Use Google Search to find REAL-TIME Search Volume trends and CPC ranges for this specific niche in 2025/2026.
            - Do not guess. If high competition, show high CPC.
            
            Constraints:
            - STRICTLY EXCLUDE these existing terms: ${existingKeywords.join(', ')}.
            - Focus on commercial/transactional intent.
            
            Return purely a JSON Array matching the schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema as any,
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "[]";
    const parsed = JSON.parse(cleanJson(text));
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Keyword generation failed", e);
    return [];
  }
};

export const extractMetricsFromImage = async (base64Image: string): Promise<any> => {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/png", data: base64Image } },
        { text: "Extract Google Ads metrics: spend, conversions, clicks, impressions, value, optScore, bidStrategy. Return JSON." }
      ]
    },
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(cleanJson(response.text || "{}"));
}

export const editCampaignWithAI = async (campaign: any, editInstruction: string, platform: 'google' | 'meta'): Promise<any> => {
  await ensureApiKey();
  const ai = getClient();

  const prompt = `You are an expert ${platform === 'google' ? 'Google Ads' : 'Meta/Facebook Ads'} strategist.

You are given an existing campaign strategy as JSON. The user wants to make the following edit:

"${editInstruction}"

EXISTING CAMPAIGN DATA:
${JSON.stringify(campaign, null, 2)}

INSTRUCTIONS:
1. Apply the user's requested changes to the campaign data.
2. Maintain the EXACT same JSON structure and all existing fields.
3. Only modify the fields relevant to the user's request.
4. Keep all IDs, timestamps, and metadata unchanged.
5. Return the COMPLETE updated campaign JSON (not just the changed parts).

Return ONLY the updated JSON object with the same schema as the input.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: platform === 'google' ? campaignSchema : metaCampaignSchema,
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });

  const updated = JSON.parse(cleanJson(response.text || "{}"));

  // Preserve fields that shouldn't change
  updated.id = campaign.id;
  updated.createdAt = campaign.createdAt;
  updated.businessName = campaign.businessName;
  updated.industry = campaign.industry;
  updated.location = campaign.location;

  return updated;
};


