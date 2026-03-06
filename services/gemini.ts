
import { GoogleGenAI, Type, Schema, GenerateContentResponse, Chat } from "@google/genai";
import { GeneratedCampaign, UserInput, AuditReport, KeywordEntry, GeneratedMetaCampaign, ResponsiveSearchAd } from "../types";
import { GOOGLE_ADS_GUIDE_2026, CAMPAIGN_STRUCTURE_RULES, SMART_BIDDING_GUIDE, DATA_STRENGTH_REQUIREMENTS, ASSET_REQUIREMENTS, NEGATIVE_KEYWORD_STRATEGY, AI_ESSENTIALS_CHECKLIST } from "../src/data/googleAdsKnowledgeBase";
import { META_ADS_GUIDE_2026, PERFORMANCE_5_CHECKLIST, CREATIVE_SPECS, BIDDING_STRATEGIES, LEAD_FORM_BEST_PRACTICES, FULL_FUNNEL_STRATEGY, SPECIAL_AD_CATEGORIES } from "../src/data/metaAdsKnowledgeBase";

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
    **CAMPAIGN TYPE: SEARCH (HIGH INTENT) — February 2026 Best Practices**

    ACCOUNT STRUCTURE:
    - Use STAG model: Single Theme Ad Groups, 5–15 tightly related keywords per group with identical search intent.
    - Separate Search and Display into different campaigns — never combine them.
    - Start with Brand + Non-Brand campaigns; scale to 6–10 campaigns.
    - Turn off: Auto-Apply recommendations, Search Partners, App placements.

    KEYWORD STRATEGY:
    - ~60% Broad Match + Smart Bidding (for accounts with 50+ monthly conversions).
    - ~30% Exact Match (brand terms, high-commercial-intent "money keywords").
    - ~10% Phrase Match (transitional holdover only).
    - Generate account-level negative keywords: free, cheap, jobs, diy, how to, reviews, wikipedia, scam.
    - Review Search Terms Report monthly for expansion opportunities.

    RSA REQUIREMENTS (MANDATORY):
    - EXACTLY 15 headlines + EXACTLY 4 descriptions.
    - Include primary keywords naturally in 3–5 headlines.
    - Pin ONLY brand name or legal disclaimers.
    - Add image assets (+6% CTR), business logo + name (+8% conversions).
    - Ad Strength target: EXCELLENT (+12% conversions vs. Poor).

    SMART BIDDING:
    - Target CPA: best for lead gen (requires 30+ conversions/month).
    - Maximize Conversions: best for new campaigns until 30+ conversions reached.
    - Target ROAS: best for revenue tracking (requires 50+ conversions/month).
    - Allow 2–3 week learning period — no adjustments during this phase.

    METRICS: CPC, CTR, CPA, Quality Score, Ad Strength, Impression Share.
  `,

  'PMAX': `
    **CAMPAIGN TYPE: PERFORMANCE MAX (PMAX) — February 2026 Best Practices**

    OVERVIEW:
    - Runs across ALL Google inventory: Search, Display, YouTube, Discover, Gmail, Maps.
    - +27% conversions/value at similar CPA/ROAS vs. standard campaigns.
    - Requires value-based bidding for best results.

    SETUP REQUIREMENTS:
    - Conversion goals must MATCH your Search campaigns for consistent signals.
    - Value-based bidding: Maximize Conversion Value + Target ROAS (when tracking revenue).
    - Maximize Conversions + optional CPA target (when all conversions equal value).
    - Keep text customization ON and Final URL expansion ON.

    ASSET GROUP STRUCTURE (3–7 per campaign):
    - Organize by product category or theme — NOT by audience.
    - Each asset group needs tailored creative + audience signals.
    - Generate asset groups as the 'adGroups' in the schema.

    MANDATORY CREATIVE ASSETS (PER ASSET GROUP):
    - 15–20 Images: mix of lifestyle, product, branded, text-free backgrounds.
    - 5+ Headlines, 5+ Descriptions.
    - At least 1 video in EACH orientation: horizontal (16:9), vertical (9:16), square (1:1).
    - Video in all 3 orientations → +20% YouTube conversions. No video = 25–40% worse performance.

    AUDIENCE SIGNALS (map to 'keywords' field in schema with matchType: 'Signal'):
    - Customer Match: existing customers + high-LTV segments.
    - Custom Intent: based on top-performing keywords + competitor URLs.
    - In-Market: relevant purchase-intent categories.
    - New Customer Only mode: +13% new customer ratio, +19% lower acquisition cost.
    - Exclude existing customers from acquisition asset groups.

    OPTIMIZATION:
    - Allow 2–4 weeks learning before significant changes.
    - Use channel performance reporting to analyze per-channel results.

    METRICS: Conversion Value, ROAS, New Customer Ratio, Asset Group Performance.
  `,

  'Display': `
    **CAMPAIGN TYPE: DISPLAY (REMARKETING/AWARENESS) — February 2026 Best Practices**

    - Best For: Retargeting website visitors; brand awareness in browsing contexts.
    - Optimize SEPARATELY from Search with distinct budgets and success metrics.
    - Structure: Audience-based Ad Groups (e.g., "All Visitors 30D", "Cart Abandoners 7D", "Product Viewers 14D").
    - Targeting: Custom Intent segments, In-Market audiences, remarketing lists.
    - Exclude low-quality placements and app inventory to prevent budget waste.
    - Ads: Responsive Display Ads with high-quality visuals + compelling text.
    - Focus on visually compelling banners that capture attention in browsing contexts.
    - Use 180+ day remarketing windows for maximum audience coverage.
    - METRICS: CPM, CTR, View-Through Conversions, Frequency.
  `,

  'Video': `
    **CAMPAIGN TYPE: VIDEO (YOUTUBE) — February 2026 Best Practices**

    - Best For: Awareness, consideration, trust-building, and video action conversions.
    - CRITICAL: Produce content in ALL 3 orientations → +20% YouTube conversions.
      * Horizontal 16:9 (standard YouTube)
      * Vertical 9:16 (YouTube Shorts, mobile)
      * Square 1:1 (YouTube feed)

    CAMPAIGN SUBTYPES:
    - Video Action: drive sales, leads, web traffic (conversion-optimized).
    - Video Reach: non-skippable awareness (global beta in 2025/2026).
    - Video View: maximize views with format controls.

    TARGETING (map to 'keywords' field in schema):
    - Topics (content targeting on channels/videos): matchType = 'Topic'
    - Channel/Video Placements: matchType = 'Placement'
    - In-Market Audiences: matchType = 'In-Market'
    - Affinity Audiences: matchType = 'Affinity'

    CREATIVE REQUIREMENTS:
    - Hook in first 5 seconds (skippable ads) — most viewers skip after this.
    - Clear brand presence in first 5 seconds.
    - Include captions for sound-off viewers.
    - Leverage creator partnerships to amplify through trusted YouTube creators.

    METRICS: CPV (Cost Per View), VTR (View-Through Rate), Brand Lift, Video Completion Rate.
  `,

  'Shopping': `
    **CAMPAIGN TYPE: SHOPPING — February 2026 Best Practices**

    - Best For: E-commerce with physical or digital products in Google Merchant Center.
    - PRODUCT FEED IS THE #1 PERFORMANCE FACTOR — optimize before anything else.

    FEED OPTIMIZATION (generate as ad copy guidance):
    - Titles: [Brand] + [Product Type] + [Key Attributes] (color, size, material).
    - Descriptions: 500–5000 chars; include top keywords naturally; cover materials, use cases, specs.
    - Images: White background for main Shopping image; lifestyle shots as supplemental.
    - Structured data: GTINs, MPNs, brand, product category — completeness matters.

    CAMPAIGN STRATEGY:
    - PMax for full automation (recommended for most advertisers).
    - Standard Shopping for search query visibility and bid control.
    - Consider running both: PMax handles automation; Standard Shopping provides transparency.
    - Use Product Studio in Merchant Center for easy imagery updates.

    TARGETING (map to 'keywords' field — Shopping uses only negative keywords):
    - Generate negative keywords to filter irrelevant traffic.
    - matchType for Shopping: 'Negative Exact' or 'Negative Phrase'.

    METRICS: ROAS, Revenue, Cost/Conv, Impression Share, Shopping CTR, Benchmark CTR.
  `,

  'DemandGen': `
    **CAMPAIGN TYPE: DEMAND GEN — February 2026 Best Practices**

    - Part of the Power Pack: AI Max for Search + Performance Max + Demand Gen.
    - Runs across: YouTube, YouTube Shorts, Discover, Gmail, Google Display Network.
    - Best For: Demand creation, discovery, top-of-funnel visual storytelling.

    CREATIVE REQUIREMENTS:
    - High-quality visual assets tailored for EACH placement surface.
    - YouTube: 9:16 vertical Shorts + 16:9 horizontal.
    - Discover: 1.91:1 wide or 1:1 square; strong visual + minimal text.
    - Gmail: Collapsible ad with compelling subject-line-style headline.
    - Follow the Creative Excellence Guide for Demand Gen.

    AUDIENCE (map to 'keywords' field with matchType: 'Signal'):
    - Lookalike audiences based on Customer Match lists.
    - Affinity segments: matchType = 'Affinity'.
    - In-Market: matchType = 'In-Market'.
    - Life Events: matchType = 'Life Event'.
    - Custom Intent segments based on top keywords.

    METRICS: Reach, Video Views, Engagement Rate, Assisted Conversions, New User Rate.
  `,

  'Local': `
    **CAMPAIGN TYPE: LOCAL / CALL-ONLY — February 2026 Best Practices**

    - Best For: Driving phone calls and in-store visits for local service businesses.
    - Optimize Google Business Profile FIRST with complete, accurate information.
    - Use call extensions + location extensions on all Search campaigns.

    TARGETING:
    - Radius targeting around service area (typical: 10–50 miles/km).
    - Location bid adjustments for highest-converting zones.
    - "Near me" intent keywords: "[service] near me", "[service] in [city]", "[service] [zip]".

    AD STRUCTURE:
    - Call-Only Ads: Phone number is primary CTA.
    - Headline 1: Primary service (e.g., "Emergency HVAC Repair").
    - Headline 2: Location or offer (e.g., "Serving Dallas TX" or "Same-Day Service").
    - Description: Social proof + CTA (e.g., "500+ 5-Star Reviews. Call Now — We Answer 24/7.").

    CALL TRACKING:
    - Import call conversions with 60+ second duration threshold.
    - Use Google forwarding numbers for call analytics.
    - Configure offline conversion imports for booked appointments.

    METRICS: Calls, Call Duration, Cost Per Call, Store Visits, Local Actions.
  `,

  'App': `
    **CAMPAIGN TYPE: APP — February 2026 Best Practices**

    - Best For: Mobile app installs and in-app engagement/purchases.
    - Set up in-app conversion tracking BEFORE launching campaigns.
    - Let Google AI optimize placements across Search, Play, YouTube, and Display.

    ASSET REQUIREMENTS:
    - Text assets: 5 headlines (30 chars max), 5 descriptions (90 chars max).
    - Images: Mix of 1:1, 1.91:1, and 4:5 aspect ratios.
    - Videos: 15–30 seconds showing core app experience.
    - HTML5 assets: Interactive app previews for Display.

    BIDDING:
    - App Installs: Target CPI (Cost Per Install).
    - In-App Actions: Target CPA for specific actions (purchase, subscription, etc.).
    - Target ROAS for revenue-generating apps.

    AUDIENCES (map to 'keywords' field):
    - Similar audiences to existing users: matchType = 'Lookalike'.
    - In-market for app category: matchType = 'In-Market'.
    - Re-engagement for lapsed users: matchType = 'Remarketing'.

    METRICS: CPI, In-App Conversion Rate, Retention Rate, LTV, ROAS.
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
      model: "gemini-2.5-flash",
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
      model: "gemini-2.5-flash",
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
      model: "gemini-2.5-flash",
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
    },
    fullFunnelStrategy: {
      type: Type.OBJECT,
      properties: {
        topOfFunnel: { type: Type.OBJECT, properties: { objective: { type: Type.STRING }, creative: { type: Type.STRING }, audience: { type: Type.STRING }, budget: { type: Type.STRING }, keyFormats: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["objective", "creative", "audience", "budget", "keyFormats"] },
        middleOfFunnel: { type: Type.OBJECT, properties: { objective: { type: Type.STRING }, creative: { type: Type.STRING }, audience: { type: Type.STRING }, budget: { type: Type.STRING }, keyFormats: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["objective", "creative", "audience", "budget", "keyFormats"] },
        bottomOfFunnel: { type: Type.OBJECT, properties: { objective: { type: Type.STRING }, creative: { type: Type.STRING }, audience: { type: Type.STRING }, budget: { type: Type.STRING }, keyFormats: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["objective", "creative", "audience", "budget", "keyFormats"] },
        consolidationRecommendation: { type: Type.STRING }
      },
      required: ["topOfFunnel", "middleOfFunnel", "bottomOfFunnel", "consolidationRecommendation"]
    },
    leadFormStrategy: {
      type: Type.OBJECT,
      properties: {
        recommended: { type: Type.BOOLEAN },
        formType: { type: Type.STRING },
        qualifyingQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        valueOffer: { type: Type.STRING },
        thankYouScreenCopy: { type: Type.STRING },
        leadQualityTips: { type: Type.ARRAY, items: { type: Type.STRING } },
        offlineConversionSetup: { type: Type.STRING }
      },
      required: ["recommended", "formType", "qualifyingQuestions", "valueOffer", "thankYouScreenCopy", "leadQualityTips", "offlineConversionSetup"]
    },
    complianceFlags: {
      type: Type.OBJECT,
      properties: {
        specialAdCategory: { type: Type.STRING },
        requiresDeclaration: { type: Type.BOOLEAN },
        restrictedTargeting: { type: Type.ARRAY, items: { type: Type.STRING } },
        prohibitedContent: { type: Type.ARRAY, items: { type: Type.STRING } },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["specialAdCategory", "requiresDeclaration", "restrictedTargeting", "prohibitedContent", "recommendations"]
    },
    creativeFatigueSchedule: {
      type: Type.OBJECT,
      properties: {
        estimatedLifespanDays: { type: Type.NUMBER },
        refreshTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
        cycleOneCreatives: { type: Type.STRING },
        cycleTwoAngles: { type: Type.ARRAY, items: { type: Type.STRING } },
        scalingStrategy: { type: Type.STRING }
      },
      required: ["estimatedLifespanDays", "refreshTriggers", "cycleOneCreatives", "cycleTwoAngles", "scalingStrategy"]
    },
    ascPlusConfig: {
      type: Type.OBJECT,
      properties: {
        recommended: { type: Type.BOOLEAN },
        reasoning: { type: Type.STRING },
        audienceExclusions: { type: Type.ARRAY, items: { type: Type.STRING } },
        budgetScalingPlan: { type: Type.STRING },
        learningPhaseRequirements: { type: Type.STRING },
        creativeAssetChecklist: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["recommended", "reasoning", "audienceExclusions", "budgetScalingPlan", "learningPhaseRequirements", "creativeAssetChecklist"]
    }
  },
  required: ["campaignName", "objective", "performance5Score", "budgetAnalysis", "budgetStrategy", "accountStructure", "creativeStrategy", "adSets", "trackingSetup", "optimization", "fullFunnelStrategy", "leadFormStrategy", "complianceFlags", "creativeFatigueSchedule", "ascPlusConfig"]
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

  const prompt = `You are an Elite Google Ads Architect and Direct Response Copywriter (February 2026 edition).
  Build a comprehensive, production-ready Google Ads campaign for:
  ${JSON.stringify(data)}

  ============================================================
  REAL-TIME MARKET DATA (${userCampaignType} — ${data.industry}, ${data.location}):
  ============================================================
  ${benchmarks}

  ${strategicDeepDive}

  ============================================================
  GOOGLE ADS PLATFORM INTELLIGENCE (2026)
  ============================================================
  ${GOOGLE_ADS_GUIDE_2026}

  AI ESSENTIALS 2.0 CHECKLIST (evaluate this campaign against each item):
  ${AI_ESSENTIALS_CHECKLIST.join('\n')}

  SMART BIDDING STRATEGY MATRIX:
  ${JSON.stringify(SMART_BIDDING_GUIDE, null, 2)}

  ASSET REQUIREMENTS:
  ${JSON.stringify(ASSET_REQUIREMENTS, null, 2)}

  NEGATIVE KEYWORD STRATEGY:
  Account-level negatives (ALWAYS include): ${NEGATIVE_KEYWORD_STRATEGY.accountLevel.join(', ')}
  Plus user-specified: ${data.negativeKeywords || 'none'}

  DATA STRENGTH REQUIREMENTS (evaluate and output score):
  ${DATA_STRENGTH_REQUIREMENTS.join('\n')}

  ${DATA_FOUNDATION_ANALYSIS}

  ${NEGATIVE_CONSTRAINTS}

  ============================================================
  RSA COPYWRITING RULES (STRICT CHARACTER LIMITS — MANDATORY)
  ============================================================
  ${GOOGLE_ADS_COPY_MASTERY}

  KEYWORD MATCHING STRATEGY (2026):
  ${KEYWORD_MATCHING_GUIDE}

  BRAND VOICE: ${data.brandVoice || 'Professional & Trustworthy'}

  ============================================================
  CAMPAIGN-SPECIFIC RULES FOR: ${userCampaignType.toUpperCase()}
  ============================================================
  ${campaignKnowledge}

  ============================================================
  DELIVERABLE REQUIREMENTS (ALL MANDATORY)
  ============================================================

  1. KEYWORDS (per ad group):
     - Minimum 15 keywords per ad group with commercial intent.
     - DATA ACCURACY: Search Volume and Avg CPC MUST align with benchmarks above. No hallucinated $0.10 CPCs if benchmark is $5.00.
     - Match type allocation: ~60% Broad (for Smart Bidding scale), ~30% Exact (brand/high-control), ~10% Phrase.
     - Include negative keywords array per ad group.

  2. ADS (per ad group — minimum 2 RSA variations):
     - Variation 1: Direct Offer/Hook — benefit-led, numbers-first.
     - Variation 2: Problem/Solution — pain-aware, emotional resolution.
     - MANDATORY: EXACTLY 15 headlines + EXACTLY 4 descriptions per RSA.
     - Ad Strength target: Excellent. No generic phrases.
     - Image assets suggestions in 'paths' field (for image asset guidance).

  3. BIDDING STRATEGY:
     - Select from SMART_BIDDING_GUIDE based on: tracking status (${data.trackingStatus}), budget (${data.monthlyBudget || 'unknown'}), conversions history.
     - If tracking is 'None' or 'Basic': recommend Maximize Clicks → transition to Maximize Conversions after data.
     - Include specific threshold (conversion count) before switching strategies.

  4. CONVERSION TRACKING:
     - Output specific enhanced conversions setup instructions.
     - Data Strength score (0–100) based on their current setup.
     - If CRM is ${data.crmTool || 'None'}: include CRM-specific offline conversion import instructions.

  5. SCHEMA MAPPING:
     - adGroups: Search=Keyword Themes; PMax=Asset Groups; Video=Topic Groups; Shopping=Product Groups; DemandGen=Creative Themes.
     - keywords: Search=standard keywords (Broad/Phrase/Exact); PMax=Audience Signals (matchType:'Signal'); Video=Topics/Placements (matchType:'Topic'/'Placement').
     - ads: All campaign types use the RSA schema; adapt headline/description content for the campaign type.

  CONTEXT & BUDGET:
  ${budgetInstruction}

  STRUCTURE:
  ${adGroupInstruction}
  ${adFormatPref}

  Return strictly valid JSON matching the schema.`;


  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: campaignSchema,
      thinkingConfig: { thinkingBudget: 32768 },
    }
  });

  return JSON.parse(cleanJson(response.text || "{}"));
};

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

  const metaGoal = (data.metaObjective || data.campaignTypePreference || '').toLowerCase();
  const isLeadsObjective = metaGoal.includes('lead') || (data.industry || '').match(/hvac|plumb|roof|legal|mortgage|dental|medical|insurance|contractor/i);
  const isEcomObjective = metaGoal.includes('sale') || metaGoal.includes('ecom');

  const prompt = `You are a world-class Meta Ads Strategist and Direct Response Copywriter — expert in the 2026 Meta platform (Ogilvy-level strategy meets UGC-native creative execution).

  OBJECTIVE: Build a comprehensive, production-ready Facebook & Instagram campaign for:
  ${JSON.stringify(data)}

  REAL-TIME BENCHMARKS (${data.industry} industry, ${data.location}):
  ${benchmarks}

  ${strategicDeepDive}

  ============================================================
  META ADS PLATFORM INTELLIGENCE (2026)
  ============================================================
  ${META_ADS_GUIDE_2026}

  PERFORMANCE 5 FRAMEWORK (score each pillar 0–10 in the schema):
  ${PERFORMANCE_5_CHECKLIST.join('\n')}

  CREATIVE SPECS REFERENCE:
  ${JSON.stringify(CREATIVE_SPECS, null, 2)}

  BIDDING STRATEGIES:
  ${JSON.stringify(BIDDING_STRATEGIES, null, 2)}

  LEAD FORM BEST PRACTICES:
  ${JSON.stringify(LEAD_FORM_BEST_PRACTICES, null, 2)}

  FULL-FUNNEL FRAMEWORK:
  ${JSON.stringify(FULL_FUNNEL_STRATEGY, null, 2)}

  SPECIAL AD CATEGORIES (check if applicable):
  ${SPECIAL_AD_CATEGORIES.join('\n')}

  ${META_DATA_FOUNDATION_ANALYSIS}

  ${NEGATIVE_CONSTRAINTS}

  ============================================================
  ELITE COPYWRITING FRAMEWORK — FOLLOW EXACTLY
  ============================================================

  **HEADLINE** (ABSOLUTE MAX 40 chars — count every character including spaces):
  - Specific benefit or concrete outcome. Numbers beat vague adjectives.
  - Formulas: "[Number] [Result] in [Timeframe]" | "Finally: [Benefit]" | "Stop [Pain]. Get [Gain]." | "Free [High-Value Thing] for [Target]"
  - GOOD: "Get More Leads in 48 Hours" (26) | "50% Off Ends Sunday" (19) | "3 Leads Guaranteed or Free" (26)
  - BAD: "Transform Your Business Today" | "Innovative Solutions For You"

  **DESCRIPTION** (ABSOLUTE MAX 30 chars — count every character):
  - One punchy phrase reinforcing CTA or urgency.
  - GOOD: "Free estimate. No pressure." (27) | "Limited spots—book now." (23)

  **PRIMARY TEXT** (Write like a mini sales letter, not ad copy. 150–500 characters total. Blank line between each paragraph):

  MANDATORY 5-PARAGRAPH STRUCTURE:

  PARAGRAPH 1 — SCROLL-STOPPING HOOK (1–2 sentences):
  Make them feel seen, shocked, or curious. Choose ONE:
    → Pain mirror: "Still [struggling with X] without [desired result]?"
    → Bold claim: "We've helped [specific number] [target audience] [specific result] in [timeframe]."
    → Counterintuitive: "The reason your [X] isn't working has nothing to do with [common belief]."

  PARAGRAPH 2 — AGITATE THE PAIN (1–2 sentences):
  Name their exact frustration using their own language. Visceral and specific. No fluff.

  PARAGRAPH 3 — YOUR SOLUTION (2–3 sentences):
  What you do + your unique mechanism. Include ONE concrete number or stat. "We don't guess — we [specific differentiating process]."

  PARAGRAPH 4 — SOCIAL PROOF (1 sentence):
  Customer count, star rating, award, or specific case study result.

  PARAGRAPH 5 — FRICTIONLESS CTA (1–2 sentences):
  Tell them exactly what to do AND what they get. Make the next step obvious and low-risk.
  Example: "Click 'Learn More' → fill out our 60-second form → get your custom quote by tomorrow morning."

  EMOJI RULES: Max 2 emojis in entire primary text. Use for social proof or urgency only. NO decorative emoji spam.
  TONE: Confident expert texting a friend. Short sentences. Active voice. Zero corporate speak.

  MANDATORY COPY ANGLE DIVERSITY — EACH AD SET MUST USE A DIFFERENT PSYCHOLOGICAL DRIVER:
  - Ad Set 1 → PAIN/PROBLEM ANGLE: Open by naming the specific frustration. Dig into it. Offer relief only at the end.
  - Ad Set 2 → DREAM OUTCOME ANGLE: Open with the vivid after-state. Paint their ideal result first, then show how.
  - Ad Set 3 → AUTHORITY/PROOF ANGLE: Open with a credential, number, or case study result. Build trust before selling.

  POWER WORDS (weave in naturally): Proven, Guaranteed, Free, Finally, Stop, Warning, Discover, Exclusive, Limited, Save, Secret, Real, Instant, Zero [risk/hassle/contracts].
  FORBIDDEN PHRASES: "game-changer", "seamless experience", "cutting-edge", "take your business to the next level", "in today's landscape", "innovative solution", "leverage synergies", "empower your brand".

  Instagram Nuance: End CTA with "Link in bio" or "Tap the link below." Warmer, more personal tone. Shorter sentences.

  IMAGE PROMPT RULES (for 'visualDescription' field):
  - Write a DETAILED, SELF-CONTAINED generative AI prompt (Midjourney/Imagen quality).
  - STRUCTURE: [Subject/Action] + [Environment/Background] + [Lighting/Mood] + [Style/Camera] + [Text Requirement if needed].
  - UGC style: "iPhone photography, raw, authentic, selfie style, natural light."
  - Cinematic style: "85mm lens, f/1.8, cinematic lighting, 4K."
  - Focus on Outcome or Emotion, not product features.

  ============================================================
  SCHEMA FIELD INSTRUCTIONS
  ============================================================

  'fullFunnelStrategy': Build a complete TOF/MOF/BOF plan with specific objectives, creative types, audiences, budget splits, and format recommendations for this specific business.

  'leadFormStrategy': ${isLeadsObjective ? 'REQUIRED — this is a lead gen business. Provide Higher Intent form type, 3 qualifying multiple-choice questions specific to this industry, a compelling value offer, thank-you screen copy, and offline conversion setup instructions.' : 'Set recommended: false and provide basic guidance.'}

  'complianceFlags': Analyze whether this business (${data.industry}, ${data.businessName}) requires a Special Ad Category declaration. Flag any prohibited content risks. Mortgage = Credit/Housing. Law firms = may require Housing/Employment depending on practice area.

  'creativeFatigueSchedule': Based on the 21-day average lifespan, provide a realistic refresh schedule with frequency-based triggers, cycle 1 creative count, cycle 2 angle variations, and a scaling strategy.

  'ascPlusConfig': ${isEcomObjective ? 'STRONGLY recommend ASC+ for this e-commerce/sales objective.' : 'Recommend based on objective and data maturity.'} Include audience exclusion list, budget scaling plan (20–30% increments), learning phase requirements (50+ conversions/week), and a creative asset checklist.

  'trackingSetup': ${META_DATA_FOUNDATION_ANALYSIS} Include specific capiInstructions for their platform (${data.crmTool || 'generic'}). Emphasize Event Match Quality target of 6.0+.

  BUDGET CONTEXT: ${budgetInstruction}

  STRUCTURE INSTRUCTIONS:
  - Output the recommended account structure in 'accountStructure'.
  - ${adSetInstruction}
  - Each ad set must have 2+ ads with distinct copy angles.

  Return strictly valid JSON matching the schema.`;


  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
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
    model: 'gemini-2.5-flash',
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
    model: "gemini-2.5-pro",
    contents: `You are an elite Google Ads auditor with 15+ years of PPC experience. Your job is to provide a brutally honest, actionable account audit.

ACCOUNT DATA TO AUDIT:
${dataBlob}

AUDIT FRAMEWORK:
1. **Health Score (0-100)**: Score each component: Keywords Quality, Ad Copy Quality, Bid Strategy, Audience Targeting, Conversion Tracking, Account Structure, Budget Efficiency, Landing Page.
2. **Benchmark Analysis**: Compare every provided metric (CTR, CPC, CPA, ROAS, Conv Rate, Impression Share) against 2025/2026 industry standards. Be specific about the industry if mentioned.
3. **Wasted Spend Analysis**: Identify specific categories of waste: irrelevant search terms, poor match types, underperforming ad groups, bid strategy misalignment, geographic waste, device bid adjustments, dayparting gaps.
4. **Opportunities**: Rank by ROI impact.
   - Quick Wins (< 1 week to implement, high impact)
   - Medium Term (1-4 weeks)
   - Strategic (1-3 months)
5. **Recommendations**:
   - Keywords: Which to pause (below Quality Score threshold or high CPA), which to scale (ROAS > target), which to add (gaps in coverage)
   - Ad Copy: Specific headline/description improvements based on what's underperforming
   - Bid Strategy: Smart Bidding recommendation based on data maturity
   - Structure: Campaign/ad group restructuring recommendations
6. **Action Plan**: Prioritized 30-60-90 day roadmap with specific steps.

IMPORTANT: Use real industry benchmarks. If no industry is specified, use general B2B/B2C averages. Be specific and quantitative wherever possible. Return strictly JSON matching the schema.`,
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
      model: "gemini-2.5-flash",
      contents: `Generate 5-10 NEW, high-intent Google Ads keywords/signals for:
            Industry: ${industry}
            Location: ${location}
            Theme: ${theme}

            **CRITICAL DATA REQUIREMENT:**
            - Use your real-world knowledge of search volumes and CPC ranges for this specific niche.
            - Do NOT use generic placeholder values. Be industry-specific.
            - High-competition niches (legal, medical, insurance, home services) have CPCs of $5-$80+.
            - Use realistic monthly search volume estimates (e.g., "1,000-10,000/mo" not just "High").

            Constraints:
            - STRICTLY EXCLUDE these existing terms: ${existingKeywords.join(', ')}.
            - Focus on commercial/transactional intent.

            Return purely a JSON Array matching the schema.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema as any
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

// NEW: Google Ads Scripts Generator
export const generateAdsScripts = async (campaign: GeneratedCampaign): Promise<{ name: string; category: string; description: string; difficulty: string; code: string; }[]> => {
  await ensureApiKey();
  const ai = getClient();

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        category: { type: Type.STRING },
        description: { type: Type.STRING },
        difficulty: { type: Type.STRING },
        code: { type: Type.STRING }
      },
      required: ["name", "category", "description", "difficulty", "code"]
    }
  };

  const prompt = `You are a Google Ads Scripts expert. Generate 5 production-ready, copy-paste Google Ads Scripts for this campaign:

Business: ${campaign.businessName}
Industry: ${campaign.industry}
Campaign Type: ${campaign.strategy?.campaignType || 'Search'}
Bid Strategy: ${campaign.strategy?.biddingStrategy || 'Maximize Conversions'}
Monthly Budget: ${campaign.budgetAnalysis?.recommendation?.monthlyBudget || 'Unknown'}
Target CPA: ${campaign.budgetAnalysis?.maxCpaAnalysis?.targetCpa || 'Unknown'}

Generate EXACTLY these 5 scripts:

1. **Budget Pacing Alert** (category: "Budget") - Monitor daily spend vs pace and email an alert if more than 20% off track. User configures: EMAIL_ADDRESS, DAILY_BUDGET.

2. **Search Term Auto-Negatives** (category: "Keywords") - Scan last 7 days search terms. Auto-add as campaign-level negatives any terms containing a configurable blocklist (jobs, free, diy, etc.) or terms with >5 clicks and 0 conversions. User configures: CAMPAIGN_NAME_CONTAINS, NEGATIVE_KEYWORDS_LIST, MIN_CLICKS_BEFORE_NEGATIVE.

3. **Quality Score Reporter** (category: "Quality") - Pull keywords with QS below threshold. Log to a Google Spreadsheet with: Campaign, Ad Group, Keyword, QS, Expected CTR, Ad Relevance, Landing Page Exp. User configures: SPREADSHEET_URL, MIN_QS_THRESHOLD.

4. **CPA-Based Bid Adjuster** (category: "Bidding") - For manual CPC: raise bids by 15% where CPA < Target CPA, lower by 15% where CPA > Target CPA * 1.5. User configures: TARGET_CPA, MAX_BID, MIN_BID, CAMPAIGN_NAME_FILTER.

5. **Dayparting Bid Optimizer** (category: "Bidding") - Analyze last 30 days conversion rate by hour. Set +20% bid adj on top-25% hours, -20% on bottom-25% hours. User configures: CAMPAIGN_NAME, LOOKBACK_DAYS.

For each script:
- Start with a CONFIG block with ALL user-configurable variables (with comments)
- Write complete working JavaScript using Google Ads Scripts API (AdsApp, MccApp, etc.)
- Use proper API calls: AdsApp.campaigns(), AdsApp.keywords(), etc.
- Include try/catch error handling
- Add inline comments explaining key logic
- Code should be 40-80 lines

Return JSON: name, category ("Budget"|"Keywords"|"Quality"|"Bidding"), description (1-2 sentences), difficulty ("Beginner"|"Intermediate"|"Advanced"), code.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema as any }
    });
    const parsed = JSON.parse(cleanJson(response.text || "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Script generation failed", e);
    return [];
  }
};

// NEW: Landing Page CRO Analyzer
export const analyzeLandingPage = async (url: string, businessName: string, industry: string, goal: string): Promise<any> => {
  await ensureApiKey();
  const ai = getClient();

  // Step 1: Research the URL with grounding
  let urlResearch = "URL research unavailable.";
  try {
    const searchRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Research this landing page for a PPC conversion audit: ${url}\nBusiness: ${businessName} (${industry})\n\nDescribe: page headline, main CTA button text, form fields visible, trust signals (testimonials, star ratings, certifications, guarantees), estimated page speed, mobile optimization signals, and overall first impression for someone clicking an ad.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    urlResearch = searchRes.text || urlResearch;
  } catch { /* use fallback */ }

  const schema = {
    type: Type.OBJECT,
    properties: {
      overallScore: { type: Type.NUMBER },
      verdict: { type: Type.STRING },
      estimatedCvrImprovement: { type: Type.STRING },
      checks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            criterion: { type: Type.STRING },
            status: { type: Type.STRING },
            note: { type: Type.STRING }
          },
          required: ["criterion", "status", "note"]
        }
      },
      wins: { type: Type.ARRAY, items: { type: Type.STRING } },
      criticalFixes: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["overallScore", "verdict", "checks", "wins", "criticalFixes", "recommendations", "estimatedCvrImprovement"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `CRO Landing Page Audit for PPC.
Business: ${businessName} (${industry})
Campaign Goal: ${goal}
URL: ${url}

Page Research: ${urlResearch}

Score 0-100 and evaluate these 8 criteria (status MUST be exactly "Pass", "Fail", or "Improve"):
1. Message Match - Does the LP headline align with what the ad likely promises?
2. Above-Fold CTA - Is the primary CTA visible without scrolling?
3. Load Speed - Is the page optimized for fast load?
4. Mobile UX - Is it mobile-first designed?
5. Trust Signals - Reviews, guarantees, certifications present?
6. Form Simplicity - Short form (< 5 fields) if lead gen goal?
7. Value Proposition - Is the main benefit clear within 3 seconds?
8. Keyword Relevance - Does page content match campaign keyword themes?

criticalFixes = things that directly hurt Google Quality Score or CVR and must be fixed immediately.
wins = what the page does well.
estimatedCvrImprovement = "X-Y%" if all critical fixes are applied.

Return JSON.`,
    config: { responseMimeType: "application/json", responseSchema: schema as any }
  });
  return JSON.parse(cleanJson(response.text || "{}"));
};

// NEW: Live Competitor Ad Intelligence
export const fetchLiveCompetitorAds = async (businessName: string, keywords: string[], location: string): Promise<any[]> => {
  await ensureApiKey();
  const ai = getClient();
  const topKeywords = keywords.slice(0, 5).join('", "');

  let rawSearch = "";
  try {
    const searchRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Search for businesses currently running Google Ads for these keywords in ${location}: "${topKeywords}".\n\nExclude "${businessName}" itself. For each competitor found (aim for 4-6 competitors), identify:\n- Company/Brand name\n- Their main ad headline (the blue clickable title)\n- Their ad description copy\n- Their display URL\n- The psychological angle they use (FEAR/LOSS, PRICE/VALUE, AUTHORITY/TRUST, URGENCY/SCARCITY, SOCIAL_PROOF, BENEFIT/OUTCOME)\n- Their most obvious weakness or gap in messaging\n\nBe specific with actual ad copy where possible.`,
      config: { tools: [{ googleSearch: {} }] }
    });
    rawSearch = searchRes.text || "";
  } catch { return []; }

  if (!rawSearch) return [];

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        competitor: { type: Type.STRING },
        headline: { type: Type.STRING },
        description: { type: Type.STRING },
        displayUrl: { type: Type.STRING },
        angle: { type: Type.STRING },
        weakness: { type: Type.STRING }
      },
      required: ["competitor", "headline", "description", "displayUrl", "angle", "weakness"]
    }
  };

  try {
    const parseRes = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract structured competitor ad data from this research and return as JSON array:\n\n${rawSearch}`,
      config: { responseMimeType: "application/json", responseSchema: schema as any }
    });
    const parsed = JSON.parse(cleanJson(parseRes.text || "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
};

// NEW: Multi-Platform Budget Allocator
export const generateMultiPlatformAllocation = async (totalBudget: string, goal: string, industry: string, businessInfo: string): Promise<any> => {
  await ensureApiKey();
  const ai = getClient();

  const schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      funnelStrategy: { type: Type.STRING },
      allocations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            platform: { type: Type.STRING },
            percentage: { type: Type.STRING },
            amount: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            expectedLeads: { type: Type.STRING },
            expectedCpa: { type: Type.STRING },
            keyMetric: { type: Type.STRING },
            topTip: { type: Type.STRING }
          },
          required: ["platform", "percentage", "amount", "reasoning", "expectedLeads", "expectedCpa", "keyMetric", "topTip"]
        }
      },
      warningFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
      priorityOrder: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["summary", "funnelStrategy", "allocations", "warningFlags", "priorityOrder"]
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: `You are a senior paid media strategist. Recommend an optimal multi-platform budget allocation.

Total Monthly Budget: ${totalBudget}
Primary Goal: ${goal}
Industry: ${industry}
Business Context: ${businessInfo}

Consider these platforms (only include ones appropriate for this budget/goal/industry):
- Google Search Ads (high intent, bottom-funnel)
- Google Performance Max (omnichannel AI, needs data to work)
- Meta Ads - Facebook+Instagram (social, awareness, retargeting, cold audience)
- YouTube Ads (video, awareness, remarketing)
- Microsoft/Bing Ads (B2B, older demographic, lower CPC, good for branded terms)
- LinkedIn Ads (B2B ONLY - $6-12 CPCs, min $3k/mo to be effective - skip if B2C)
- TikTok Ads (consumer products, younger demographic, creative-heavy)

Rules:
- Don't recommend platforms where budget is too low to generate meaningful data
- Each "amount" must be a specific dollar figure (e.g., "$2,400/mo")
- Use realistic 2025/2026 industry CPA benchmarks
- topTip = the single most important tactic for success on that platform
- warningFlags = risks or things that could waste money
- priorityOrder = recommended launch sequence (what to start first)

Return JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema as any,
      thinkingConfig: { thinkingBudget: 8192 }
    }
  });
  return JSON.parse(cleanJson(response.text || "{}"));
};

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
    model: "gemini-2.5-pro",
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


