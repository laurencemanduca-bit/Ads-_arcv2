export const META_ADS_GUIDE_2026 = `
# META ADS BEST PRACTICES & AI ESSENTIALS 2.0 (FEBRUARY 2026)

## EXECUTIVE OVERVIEW
Meta’s advertising ecosystem in 2025/2026 has shifted toward AI-driven automation. Success now depends on high-quality creative inputs and clean first-party data, not manual micro-targeting.
- **Creative Impact**: 70–80% of performance stems from creative quality.
- **Advantage+**: Fully automated suite for targeting, creative, and budget.

## PILLAR 1: TRACKING & MEASUREMENT INFRASTRUCTURE
- **Hybrid Model**: Run Meta Pixel + Conversions API (CAPI) simultaneously.
- **Event Deduplication**: Essential when using both Pixel and CAPI.
- **Event Match Quality (EMQ)**: Aim for score > 6.0 (send email, phone, fbc, fbp).
- **Attribution**: Standardize on 7-day click + 1-day view.

## PILLAR 2: CREATIVE STRATEGY (THE NEW TARGETING)
- **Philosophy**: Creative IS the targeting. Broad targeting + creative variety outperforms granular slicing.
- **Core Principles**:
  - Mobile-first design (4:5 or 9:16).
  - Hook in 0-3 seconds.
  - Captions on every frame (80% sound-off).
  - Native feel (UGC outperforms polished).
- **Testing Framework**:
  - Concept Testing (new ideas).
  - Iteration Testing (variations of winners).
  - Scaling (push winners to broad audiences).

## PILLAR 3: CAMPAIGN ARCHITECTURE & OBJECTIVES
- **Simplified Objectives**:
  1. Awareness (Brand recall)
  2. Traffic (Clicks)
  3. Engagement (Community)
  4. Leads (Forms/Messages)
  5. App Promotion (Installs)
  6. Sales (Conversions)
- **Structure**: Consolidated campaigns. One campaign per objective/stage.
- **Advantage+ Sales (ASC+)**: Merges prospecting and remarketing. +22% revenue/spend.

## PILLAR 4: AUDIENCE & DATA STRATEGY
- **Signal-Based Optimization**: Use audience suggestions as signals, not hard constraints.
- **First-Party Data**: Sync CRM data (Salesforce, HubSpot) via CAPI.
- **Exclusions**: Exclude current customers from prospecting.

## PILLAR 5: PERFORMANCE 5 FRAMEWORK
1. **Account Simplification**: Consolidate structures.
2. **Automation**: Leverage Advantage+ suite.
3. **Creative Diversification**: Test diverse concepts/formats.
4. **Data Quality**: CAPI + Pixel + CRM.
5. **Results Validation**: Lift testing + Incrementality.

## INDUSTRY SPECIFICS: TRADES & SERVICES
- **Objective**: Leads (Instant Forms with multiple choice qualification).
- **Creative**: Before/after photos, UGC testimonials, seasonal urgency.
- **Targeting**: Geo-radius (25-50km) + Homeowner signals.
`;

export const META_CAMPAIGN_OBJECTIVES = {
  AWARENESS: "Maximize brand recall and reach (Top of Funnel)",
  TRAFFIC: "Drive visits to websites or apps (Middle of Funnel)",
  ENGAGEMENT: "Increase likes, shares, comments (Middle of Funnel)",
  LEADS: "Collect contact info via Instant Forms (Bottom of Funnel - Service Biz)",
  APP_PROMOTION: "Drive app installs and actions",
  SALES: "Drive conversions and revenue (Bottom of Funnel - E-commerce)"
};

export const ADVANTAGE_PLUS_FEATURES = {
  ASC: "Advantage+ Sales Campaigns: Automated prospecting + remarketing for e-commerce.",
  AUDIENCE: "AI targeting using your data as signals, expanding to find best users.",
  CREATIVE: "Auto-enhancements: Standard enhancements, Image brightness/contrast, Music.",
  PLACEMENTS: "Automatic distribution across FB, IG, Messenger, Audience Network.",
  BUDGET: "Advantage+ Campaign Budget (formerly CBO): AI distributes budget to top ad sets."
};

export const CREATIVE_SPECS = {
  FEED: { ratio: "4:5", res: "1080x1350", length: "15-60s" },
  STORIES_REELS: { ratio: "9:16", res: "1080x1920", length: "15-60s (Reels up to 90s)" },
  RIGHT_COLUMN: { ratio: "1:1", res: "1080x1080", length: "Image only" }
};

export const PERFORMANCE_5_CHECKLIST = [
  "Account Simplification (Consolidated Structure)",
  "Automation (Advantage+ Suite)",
  "Creative Diversification (Concepts & Formats)",
  "Data Quality (CAPI + Pixel)",
  "Results Validation (Lift Testing)"
];
