// Google Ads Best Practices Knowledge Base — February 2026
// Source: Google Ads Help Center & AI Essentials 2.0

export const GOOGLE_ADS_GUIDE_2026 = `
# GOOGLE ADS BEST PRACTICES & AI ESSENTIALS 2.0 (FEBRUARY 2026)

## FRAMEWORK: AI ESSENTIALS 2.0

Google's AI Essentials 2.0 is the central performance framework. All campaigns should be evaluated against its three pillars.

---

## PILLAR 1: MEASUREMENT FOUNDATION

Robust, privacy-safe data collection is the foundation of all AI-driven optimization.

### Required Actions
- **Sitewide Tagging**: Install the Google tag across ALL pages — the source of all conversion and audience data.
- **Enhanced Conversions**: Send hashed first-party data (email, phone) alongside conversion tags to improve attribution accuracy.
- **Conversion Values**: Assign revenue, profit margins, or LTV to conversion actions to enable value-based bidding. This is mandatory for Target ROAS.
- **Consent Mode**: Required for all advertisers in EEA and UK. Without it, Smart Bidding is severely degraded.
- **Data Manager**: Connect CRM, website, and app interactions for a unified customer view.
- **Offline Conversion Imports**: Required for businesses where sales happen after the click (phone calls, CRM-stage progressions, in-store).
- **GA4 Integration Warning**: Avoid using GA4 as the primary conversion source due to 6–18 hour data lag that degrades Smart Bidding.

### Data Strength Score
A new assessment metric evaluating the completeness of your data infrastructure. Key inputs:
1. Sitewide tagging completeness
2. Enhanced conversions setup
3. Conversion values assigned
4. Customer Match lists active
5. Data Manager connections

Higher Data Strength = better AI optimization and ROI. Your campaign should output a Data Strength score and specific improvement actions.

---

## PILLAR 2: CREATIVE EXCELLENCE

Creative assets account for approximately **49% of total advertising sales impact** (NCS Solutions 2023).

### Asset Requirements by Type
| Asset Type | Minimum | Recommended | Notes |
|---|---|---|---|
| Headlines | 5 | 15 (maximum) | Include keywords naturally in 3–5 |
| Descriptions | 2 | 4 (maximum) | Highlight USPs and CTAs |
| Images | 5 | 15–20 | Mix: lifestyle, product, branded, text-free |
| Videos | 1 | 3+ | One per orientation: horizontal, vertical, square |
| Logos | 1 | 2 | Square and landscape versions |
| Business Name | 1 | 1 | Shown with logo in Search ads |

### Ad Strength
- **Aim for Excellent**: Improving from Poor to Excellent yields an average **+12% more conversions**.
- **Business logo + name**: +8% more conversions at similar CPA.
- **Image assets in Search**: +6% increase in CTR.
- Monitor continuously and share top-performing asset insights with creative teams.

### Pinning Rules
- Pin headlines and descriptions sparingly — only for brand name or legal disclaimers.
- Overpinning kills algorithmic testing and reduces Ad Strength.

### AI Creative Tools
- **Asset Studio**: Generate high-quality images, lifestyle visuals, and video using Veo and Imagen AI models.
- **Text Customization**: Auto-generate headlines and descriptions in Search and PMax matched to user context.
- **Conversational Experience**: Create Search campaigns through chat with AI-generated keyword, headline, and image suggestions.
- **Product Studio** (Merchant Center): Enhance and update product imagery for relevance across ad formats.
- **Generative AI in PMax**: Generate headlines, descriptions, and lifestyle images directly in Google Ads interface.

---

## PILLAR 3: AI-POWERED CAMPAIGNS

### Ads Power Pairing (Recommended Structure)
The Power Pairing drives incremental results by combining three AI campaign types:
1. **AI Max for Search** — expands reach to new relevant queries on AI surfaces.
2. **Performance Max** — runs across all Google inventory from one campaign.
3. **Demand Gen** — visual storytelling across YouTube, Shorts, Discover, Gmail.

### Smart Bidding Strategy Selection
| Strategy | Best For | Requirements |
|---|---|---|
| Target ROAS | Revenue/profit-focused advertisers | 50+ conversions/month; conversion value tracking |
| Maximize Conversion Value | Maximizing total value within budget | Conversion value tracking enabled |
| Target CPA | Lead generation, equal-value conversions | 30+ conversions/month; reliable tracking |
| Maximize Conversions | Maximum conversion volume within budget | Basic conversion tracking |
| Manual CPC | Budgets under $2,000/month or < 15 conversions | Initial data gathering only |

### Smart Bidding Best Practices
- Pair **broad match keywords** with Smart Bidding — algorithms learn faster and find better auction opportunities.
- Allow **2–3 weeks learning period** before evaluating performance; no manual adjustments during this phase.
- Use the **same conversion goals** across PMax and Search for consistent optimization signals.
- Enable **Smart Bidding Exploration** to capture more conversions with flexible ROAS targets.
- **Customer Lifecycle Bidding**: Set New Customer Acquisition goal to pay more for first-time buyers.

### Customer Match
- Upload with multiple keys (email, phone, postal address) to maximize match rates.
- Minimum 100 active members per list, refreshed within last 540 days.
- Auto-sync via CRM integrations (Salesforce, HubSpot, Zapier).
- **Benchmark**: 52% higher conversion rate, 15% lower CPA (ImmoScout24 case study).

---

## CAMPAIGN-SPECIFIC BEST PRACTICES

### SEARCH CAMPAIGNS

**Account Structure:**
- Separate Search and Display into different campaigns — never combine them.
- Use **STAG model** (Single Theme Ad Group): 5–15 tightly related keywords per ad group.
- Start with Brand + Non-Brand campaigns; scale to 6–10 campaigns as budget allows.
- Turn off Auto-Apply recommendations, Search Partners, and exclude app placements by default.

**Keyword Strategy:**
- **~60% Broad Match** + Smart Bidding: Primary scaling approach for accounts with 50+ monthly conversions.
- **~30% Exact Match**: High-value brand terms and high-commercial-intent keywords.
- **~10% Phrase Match**: Transitional holdover for moderation.
- Review Search Terms Report monthly for new keyword opportunities.
- Build account-level negative keyword lists blocking: free, jobs, cheap, diy, reviews, wikipedia.

**RSA Requirements:**
- Provide all 15 headlines + 4 descriptions (maximum allowed).
- Include primary keywords naturally in at least 3–5 headlines.
- Pin sparingly: only brand name or legal disclaimers.
- Add image assets → +6% CTR. Show business logo + name → +8% conversions.

### PERFORMANCE MAX (PMAX)

**Setup:**
- Select conversion goals matching your other campaigns for bidding consistency.
- Use **value-based bidding** (Max Conversion Value + Target ROAS) when tracking revenue.
- Use **Max Conversions + optional CPA target** when all conversions have equal value.
- Keep **text customization** and **Final URL expansion** ON.

**Asset Requirements (MANDATORY):**
- 15–20 images (lifestyle, product, branded, text-free — diverse mix)
- 5+ headlines, 5+ descriptions
- At least 1 video in EACH orientation: horizontal, vertical, square
- Video in all 3 orientations → **+20% YouTube conversions**
- Campaigns with video see **25–40% better performance** than static-only

**Structure:**
- Create **3–7 asset groups** per campaign organized by product category or theme.
- Each asset group needs its own tailored creative + audience signals.

**Audience Signals:**
- Customer Match lists (existing customers + high-LTV segments)
- In-market audiences and custom intent based on top-performing keywords
- Competitor-related signals
- **New Customer Only mode**: +13% better new customer ratio, +19% lower acquisition cost.
- Exclude existing customers from acquisition campaigns.

**Optimization:**
- Allow **2–4 weeks learning period** before significant changes.
- Use channel performance reporting to understand results per Google channel.

**Benchmarks:**
- PMax adoption → **+27% conversions/value at similar CPA/ROAS** vs. standard campaigns.

### DEMAND GEN CAMPAIGNS

- Part of the **Power Pack** alongside AI Max for Search and Performance Max.
- Runs across YouTube, Shorts, Discover, Gmail, and Google Display Network.
- Prioritize high-quality visual creative tailored for each placement surface.
- Use audience signals and Customer Match data.
- Follow the Creative Excellence Guide for Demand Gen.

### SHOPPING CAMPAIGNS

- **Product feed quality is the #1 performance factor**: optimize titles, descriptions, images, and structured data.
- White background images for Shopping placements; lifestyle shots as supplemental for Display.
- Consider PMax + Standard Shopping pairing: PMax for automation, Standard for search query visibility.
- Use Product Studio in Merchant Center for easy imagery updates.

### VIDEO CAMPAIGNS

- Drive sales/leads/traffic with Video Action campaigns optimized for conversions.
- Build awareness with Video Reach Campaigns (non-skippable format now in global beta).
- Create content in all **3 orientations**: vertical, horizontal, and square.
- Leverage creator partnerships to amplify brand messages through trusted YouTube creators.

### DISPLAY CAMPAIGNS

- Optimize separately from Search with distinct budgets and success metrics.
- Focus on visually compelling banner and image ads.
- Use remarketing audiences to re-engage previous website visitors.
- Exclude low-quality placements and app inventory to prevent budget waste.

### LOCAL / CALL-ONLY CAMPAIGNS

- Optimize Google Business Profile with complete, accurate business information.
- Use call extensions and call campaigns for phone inquiries from high-intent local searchers.
- Target with radius targeting and location bid adjustments.

### APP CAMPAIGNS

- Set up in-app conversion tracking before launching.
- Provide diverse creative: text, images, video, and HTML5 content.
- Let Google AI optimize placements across Search, Play, YouTube, and Display.

---

## EMERGING AI FEATURES (2025/2026)

### AI Max for Search Campaigns
- Drives performance on new, relevant queries; expands reach to AI surfaces.
- Uses landing page content to match ads to complex, conversational queries.
- Requires broad match with Smart Bidding; landing pages must use structured data.

### Ads in AI Overviews & AI Mode
- Ads placed directly within AI Overview responses.
- Highest user engagement and satisfaction placement.
- New ad formats being tested integrated into and below AI Mode responses.

### Smart Bidding Exploration
- Flexible ROAS targets with advanced algorithms to capture additional conversions.

### Meridian & Budgeting Tool
- Advanced measurement in Google Analytics for budget allocation decisions.

---

## KEY BENCHMARKS (2025/2026)

| Metric | Impact | Source |
|---|---|---|
| Ad Strength Poor → Excellent | +12% conversions average | Google Internal |
| Business logo + name in Search | +8% conversions at similar CPA | Google Internal |
| Image assets in Search | +6% CTR average | Google Internal |
| Video in all 3 orientations (PMax) | +20% YouTube conversions | Google Internal |
| PMax adoption | +27% conversions/value at similar targets | Google Internal |
| New Customer Only mode (PMax) | +13% new customer ratio, +19% lower acquisition cost | Google Internal |
| Creative contribution to ad sales | 49% of total impact | NCS Solutions 2023 |
| Customer Match (ImmoScout24) | 52% higher conversion rate, 15% lower CPA | Google Case Study |
| Smart Bidding learning period | 2–3 weeks minimum before evaluation | Google Best Practice |
| Broad match + Smart Bidding | Recommended for 50+ monthly conversions | Google Best Practice |
`;

export const CAMPAIGN_STRUCTURE_RULES = {
  SEARCH: {
    adGroupModel: "STAG (Single Theme Ad Group) — 5–15 tightly related keywords per group",
    keywordsPerGroup: "5–15",
    matchTypeAllocation: "60% Broad Match (+ Smart Bidding), 30% Exact Match, 10% Phrase Match",
    matchTypeStrategy: "Broad Match + Smart Bidding for scale (50+ conv/mo); Exact for brand/high-control terms",
    negativeKeywords: "Account-level lists required: free, jobs, cheap, diy, how to, reviews, wikipedia",
    structure: "Brand + Non-Brand campaigns minimum; scale to 6–10 campaigns",
    avoidSettings: "Turn off Auto-Apply, Search Partners, App placements by default",
    rsaRequirements: "15 headlines + 4 descriptions; include keywords in 3–5 headlines; pin sparingly"
  },
  PMAX: {
    assetGroups: "3–7 per campaign, organized by product category or theme",
    requiredAssets: ["15–20 Images (lifestyle, product, branded, text-free)", "5+ Headlines", "5+ Descriptions", "3 Videos (Horizontal, Vertical, Square)"],
    signals: ["Customer Match (existing customers + high-LTV)", "Custom Intent (top keywords + competitor URLs)", "In-Market Audiences"],
    settings: "URL expansion ON; text customization ON; conversion goals match Search campaigns",
    biddingStrategy: "Target ROAS for revenue; Maximize Conversions + optional CPA for leads",
    learningPeriod: "2–4 weeks minimum before significant changes",
    newCustomerMode: "+13% new customer ratio, +19% lower acquisition cost"
  },
  DEMAND_GEN: {
    placements: "YouTube, Shorts, Discover, Gmail, Google Display Network",
    creative: "High-quality visual assets tailored per placement surface",
    audiences: "Audience signals + Customer Match; lookalikes",
    powerPack: "Part of Power Pack with AI Max for Search + PMax"
  },
  SHOPPING: {
    feedPriority: "#1 performance factor — optimize titles, descriptions, images, structured data",
    imageSpec: "White background for Shopping; lifestyle shots as supplemental for Display/Discover",
    strategy: "PMax for automation OR Standard Shopping for search query control; consider both together"
  },
  VIDEO: {
    orientations: "Produce all 3: horizontal (16:9), vertical (9:16), square (1:1)",
    formats: "Skippable in-stream, non-skippable (beta), bumper (6s), Video Action for conversions",
    benchmark: "All 3 orientations → +20% YouTube conversions"
  }
};

export const SMART_BIDDING_GUIDE = {
  TARGET_ROAS: {
    bestFor: "Revenue/profit-focused advertisers tracking conversion values",
    requirement: "50+ conversions/month; conversion value tracking enabled",
    note: "Requires strong Data Strength — enhanced conversions + conversion values assigned"
  },
  MAXIMIZE_CONVERSION_VALUE: {
    bestFor: "Maximizing total value within budget without specific ROAS target",
    requirement: "Conversion value tracking enabled",
    note: "Use when you have value data but don't want to constrain with ROAS target"
  },
  TARGET_CPA: {
    bestFor: "Lead generation or equal-value conversions with specific cost target",
    requirement: "30+ conversions/month; reliable conversion tracking",
    note: "Most common for service businesses"
  },
  MAXIMIZE_CONVERSIONS: {
    bestFor: "Maximum conversion volume within budget; new accounts",
    requirement: "Basic conversion tracking enabled",
    note: "Best starting point for new accounts; transition to tCPA after 30+ conversions"
  },
  MANUAL_CPC: {
    bestFor: "Initial data gathering; budgets under $2,000/month or < 15 conversions",
    requirement: "No minimum conversions required",
    note: "Transition to Smart Bidding as soon as you reach 15–30 conversions/month"
  }
};

export const DATA_STRENGTH_REQUIREMENTS = [
  "1. Sitewide Google tag installed on all pages",
  "2. Enhanced conversions configured (send hashed email/phone with conversions)",
  "3. Conversion values assigned (revenue, profit, or LTV — not just count)",
  "4. Customer Match lists uploaded (100+ members, refreshed within 540 days)",
  "5. Data Manager connections (CRM and offline conversion imports)",
  "6. Consent Mode implemented (required for EEA/UK; degrades Smart Bidding without it)",
  "7. GA4 integration active (do NOT use as primary conversion source — use Google Ads tag)"
];

export const ASSET_REQUIREMENTS = {
  search: {
    headlines: { min: 5, max: 15, recommended: 15, rule: "Include primary keywords in 3–5; pin sparingly" },
    descriptions: { min: 2, max: 4, recommended: 4, rule: "Highlight USPs and CTAs; no repetition" },
    images: { min: 0, max: 20, recommended: 5, rule: "Optional but +6% CTR; mix lifestyle and product" },
    logo: { min: 0, max: 1, recommended: 1, rule: "Shows with business name; +8% conversions" }
  },
  pmax: {
    headlines: { min: 5, max: 15, recommended: 15, rule: "Include product/service keywords naturally" },
    descriptions: { min: 2, max: 5, recommended: 5, rule: "Cover different USPs and audience angles" },
    images: { min: 1, max: 20, recommended: 15, rule: "Mix lifestyle, product, branded, text-free" },
    videos: { min: 1, max: 5, recommended: 3, rule: "One each: horizontal 16:9, vertical 9:16, square 1:1" },
    logos: { min: 1, max: 2, recommended: 2, rule: "Square and landscape versions" }
  }
};

export const NEGATIVE_KEYWORD_STRATEGY = {
  accountLevel: [
    "free", "cheap", "cheapest", "affordable", "low cost", "discount",
    "how to", "tutorial", "diy", "youtube", "reddit", "wikipedia",
    "definition", "what is", "jobs", "careers", "hiring",
    "scam", "fraud", "complaint", "complaints", "lawsuit",
    "template", "sample", "example", "course", "training"
  ],
  reviewMonthly: "Search Terms Report — identify new irrelevant themes monthly",
  structure: "Account-level list + campaign-level + ad group-level for highest granularity"
};

export const AI_ESSENTIALS_CHECKLIST = [
  "Measurement: Google tag sitewide + enhanced conversions + conversion values",
  "Measurement: Consent Mode for EEA/UK compliance",
  "Measurement: Customer Match list active (100+ members)",
  "Measurement: Offline conversion imports configured",
  "Creative: 15 headlines + 4 descriptions per RSA",
  "Creative: Ad Strength = Excellent on all active ads",
  "Creative: Image assets added to Search ads",
  "Creative: Business logo + name enabled",
  "Creative: 3 video orientations for PMax (H, V, S)",
  "AI Campaigns: Smart Bidding active (not Manual CPC post-learning)",
  "AI Campaigns: Broad match paired with Smart Bidding for scale",
  "AI Campaigns: PMax campaign active (Power Pairing)",
  "AI Campaigns: New Customer Acquisition goal enabled in PMax"
];
