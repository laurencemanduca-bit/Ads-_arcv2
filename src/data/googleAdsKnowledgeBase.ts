export const GOOGLE_ADS_GUIDE_2026 = `
# GOOGLE ADS BEST PRACTICES & AI ESSENTIALS 2.0 (2026)

## PILLAR 1: MEASUREMENT FOUNDATION
- **Sitewide Tagging**: Implement Google tag across all pages.
- **Enhanced Conversions**: Send hashed first-party data.
- **Value-Based Bidding**: Assign revenue/profit values to conversions.
- **Consent Mode**: Required for EEA/UK.
- **Data Manager**: Connect CRM and offline data.

## PILLAR 2: CREATIVE EXCELLENCE
- **Asset Variety**: 
  - Headlines: 15 (include keywords in 3-5)
  - Descriptions: 4 (highlight USPs)
  - Images: 15-20 (lifestyle, product, text-free)
  - Videos: 3+ (Horizontal, Vertical, Square)
- **Ad Strength**: Aim for "Excellent" (yields +12% conversions).
- **Gen AI**: Use Asset Studio for scaling variations.

## PILLAR 3: AI-POWERED CAMPAIGNS
- **Power Pairing**: Search (Broad Match) + Performance Max.
- **Smart Bidding**:
  - Target ROAS: For revenue focus (50+ conv/mo).
  - Target CPA: For lead gen (30+ conv/mo).
  - Maximize Conversions: For volume/new accounts.
- **Customer Match**: Upload high-LTV lists for PMax signals.
- **New Customer Acquisition**: Use "New Customer Only" mode in PMax.

## CAMPAIGN SPECIFIC RULES

### SEARCH
- **Structure**: Single Theme Ad Groups (STAG), 5-15 keywords per group.
- **Match Types**: 
  - Broad Match + Smart Bidding (Scaling).
  - Exact Match (Brand/High-Control).
  - Allocation: ~60% Broad, 30% Exact.
- **RSAs**: Pin sparingly. Include business logo/name (+8% conv).

### PERFORMANCE MAX (PMAX)
- **Assets**: 3-7 Asset Groups per campaign (by theme).
- **Signals**: Customer Match + Custom Intent + In-Market.
- **Settings**: URL Expansion ON.
- **Video**: Mandatory (Horizontal, Vertical, Square) -> +20% YouTube conv.

### DEMAND GEN
- **Focus**: Visual storytelling (YouTube, Shorts, Discover).
- **Creative**: High-quality visual assets are priority.

### SHOPPING
- **Feed**: #1 performance factor. Optimize titles/images.
- **Strategy**: PMax for automation OR Standard Shopping for control.

## BENCHMARKS & IMPACT
- Ad Strength Excellent: +12% Conversions
- PMax Adoption: +27% Conversions/Value
- Video in PMax: +20% YouTube Conversions
- Image Assets in Search: +6% CTR
`;

export const CAMPAIGN_STRUCTURE_RULES = {
  SEARCH: {
    adGroupModel: "STAG (Single Theme Ad Group)",
    keywordsPerGroup: "5-15",
    matchTypeStrategy: "Broad Match + Smart Bidding for scale, Exact for control",
    negativeKeywords: "Account-level lists required"
  },
  PMAX: {
    assetGroups: "3-7 per campaign",
    requiredAssets: ["15 Images", "5 Headlines", "5 Descriptions", "3 Videos (H/V/S)"],
    signals: ["Customer Match", "Custom Intent", "In-Market"]
  }
};

export const SMART_BIDDING_GUIDE = {
  REVENUE: "Target ROAS (Requires 50+ conv/mo)",
  LEADS: "Target CPA (Requires 30+ conv/mo)",
  GROWTH: "Maximize Conversions (New accounts)",
  AWARENESS: "Target Impression Share"
};
