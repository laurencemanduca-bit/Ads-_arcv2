// Meta Ads Best Practices Knowledge Base — February 2026
// Source: Meta Ads Best Practices Comprehensive Knowledge Base

export const META_ADS_GUIDE_2026 = `
# META ADS BEST PRACTICES & PLATFORM INTELLIGENCE (FEBRUARY 2026)

## EXECUTIVE OVERVIEW
Meta's advertising ecosystem in 2025/2026 has undergone a fundamental shift toward AI-driven automation.
The platform rewards advertisers who provide high-quality creative inputs and clean first-party data —
NOT manual micro-targeting. Research confirms: **70–80% of ad performance stems from creative quality**.

---

## PILLAR 1: TRACKING & MEASUREMENT INFRASTRUCTURE

### Hybrid Tracking Model (MANDATORY)
- Run Meta Pixel + Conversions API (CAPI) simultaneously with event deduplication.
- The Pixel captures real-time browser events; CAPI recovers 20–30% of lost conversion data via server-side.
- Over 50% of browser-side conversions go untracked with Pixel alone (iOS, ad blockers).
- CAPI now handles BOTH online AND offline conversions (Offline Conversions API discontinued May 2025).

### Pixel Setup Requirements
- Install base code in <head> of every page.
- Standard events: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase, Lead, CompleteRegistration.
- Event parameters: content_ids, content_type, value, currency, num_items.
- Verify domain in Business Manager; configure Aggregated Event Measurement (AEM) priorities.
- Block Pixel until user grants consent (GDPR/CCPA compliance).

### Conversions API (CAPI) Setup
- Choose integration: platform-native (Shopify, WooCommerce), GTM server-side, CAPI Gateway, or direct API.
- Deduplicate via matching event_id values to prevent double-counting.
- **Event Match Quality (EMQ) target: above 6.0/10** — send email, phone, fbc, fbp parameters.
- Capture and store fbclid values in CRM at form submission for downstream attribution.
- Ensure event_time values fall within Meta's 7-day acceptance window.

### Attribution & Measurement
- Standard attribution window: **7-day click + 1-day view**.
- Use incremental attribution via A/B tests and brand lift studies for true causal impact.
- Monitor Opportunity Score (0–100) in Ads Manager for setup health.
- Compare platform event counts vs. Ads Manager to diagnose performance drops.

---

## PILLAR 2: CAMPAIGN OBJECTIVES (SIX SIMPLIFIED)

| Objective | Goal | Best For |
|---|---|---|
| Awareness | Maximize brand recall and reach | Brand building, product launches, TOF |
| Traffic | Drive website or app visits | Blog content, landing pages |
| Engagement | Increase likes, shares, comments | Community building, social proof |
| Leads | Collect contact info via instant forms | Lead gen, service businesses, consultations |
| App Promotion | Drive app installs and in-app actions | Mobile app growth |
| Sales | Drive conversions, purchases, revenue | E-commerce, direct response |

---

## PILLAR 3: ADVANTAGE+ AUTOMATION SUITE

### Advantage+ Sales Campaigns (ASC+) — FLAGSHIP
- Merges prospecting and remarketing in ONE automated campaign.
- **+22% higher revenue per dollar** vs. manual campaigns (Meta internal data).
- **17% lower cost per conversion** vs. manual campaigns.
- ASC+ grew 70% YoY in Q4 2024, surpassing $20B annual revenue run rate.
- Structure: unlimited ad sets, capped at 150 ads total (50 per ad set max).
- Budget flexibility: pulls up to 20% from underperforming ad sets to top performers.

**ASC+ Setup Requirements:**
1. Configure Pixel + CAPI with proper deduplication first.
2. Upload 3–6 high-quality diverse creative assets to start.
3. Set customer exclusions to separate prospecting from remarketing.
4. Allow 50+ conversions before enabling full automation (learning phase exit).
5. Use 7-day click / 1-day view attribution.
6. Scale budgets gradually at 20–30% increments every few days.

### Other Advantage+ Tools
- **Advantage+ Audience**: AI finds users beyond saved audiences; use audiences as signals, not hard constraints.
- **Advantage+ Creative**: Auto-crops, animates statics, swaps backgrounds, translates audio/captions, extracts positive comment keywords as stickers.
- **Advantage+ Campaign Budget (ACB)**: Distributes budget across ad sets automatically. Ad set spend limits changed from hard caps to averages in 2025.
- **Advantage+ Placements**: Distributes across FB Feed, Stories, Reels, Messenger, Audience Network.
- **Advantage+ Leads Campaigns**: New in 2025 — same automation system as ASC+ but for lead gen.
- **Advantage+ Catalog Ads**: Dynamic product showcase matching products to users based on browsing behavior.
- **Advantage+ Destinations**: Can send users to a different URL if predicted to improve conversions.

---

## PILLAR 4: CREATIVE STRATEGY — THE NEW TARGETING

Creative quality is the #1 performance driver. Creative IS the targeting.

### Core Creative Principles
- **Mobile-first**: Design for 4:5 or 9:16 first — the vast majority of Meta users are on smartphones.
- **Hook in 0–3 seconds**: Movement, bold text, or unexpected visual to stop the scroll.
- **Captions on every frame**: 80% of Reels/video plays are sound-off. Bold black-on-white captions improve retention.
- **Native feel**: UGC-style ads (authentic, phone-filmed, raw) consistently outperform polished brand videos.
- **Clear CTA**: Every ad needs a specific CTA — Learn More, Book Now, Shop Now, Get Quote.
- **Benefit-led copy**: Focus on problem solving/life improvement, not features. Keep primary text under 125 characters for mobile.
- **Creative diversification**: 32% increased efficiency with diverse assets. Broad targeting + creative variety > granular audience slicing.

### Creative Format Specs
| Placement | Ratio | Resolution | Video Length |
|---|---|---|---|
| Feed (FB/IG) | 4:5 vertical | 1080x1350px min | Up to 240 min (15–60s optimal) |
| Stories | 9:16 vertical | 1080x1920px | Up to 60s (under 15s optimal) |
| Reels | 9:16 vertical | 1080x1920px | Up to 90s (7–15s optimal) |
| Messenger | 1.91:1 horizontal | 1200x628px | Up to 240 min |
| Right Column | 1:1 square | 1080x1080px | Image only |
| Audience Network | 9:16 vertical | 1080x1920px | Up to 120s |

### Creative Testing Framework (3 Phases)
1. **Concept Testing**: Test entirely new ideas against each other. Never test new vs. legacy ads (legacy has accumulated social proof).
2. **Iteration Testing**: Take winners, vary hooks, copy, CTAs.
3. **Scaling**: Push proven creatives to broader audiences.
- Test 3–6 new creatives per cycle. Quality over quantity.
- **Creative lifespan: ~21 days** before fatigue (frequency > 3–4 triggers refresh).
- Refresh creative every 2–4 weeks.
- Review data every 2 weeks; make evidence-based adjustments.

### AI Creative Tools (2025/2026)
- Auto-animate: static images → motion ads with background swaps.
- Text variations: AI-generated headline and description suggestions.
- Auto-translate: audio, captions, and text overlays into other languages.
- Comment keyword stickers: extracts positive comments and displays them in ads.
- Video expansion for Reels: landscape clip auto-reformats to vertical.

---

## PILLAR 5: AUDIENCE & FIRST-PARTY DATA STRATEGY

### Signal-Based Optimization
- Creative diversity directly improves targeting precision over time.
- Eliminate conflicting optimization events and maintain consistent campaign structures.
- Let winning ads run longer to reinforce strong signals before replacing.

### Custom Audiences
- **Website Custom Audiences**: Pixel/CAPI data — retarget by page, event, time window.
- **Customer List Audiences**: Upload CRM data (email, phone) for direct user matching.
- **Engagement Audiences**: FB Page, IG profile, ads, video interactions.
- **App Activity Audiences**: In-app action retargeting.

### Lookalike Audiences
- Build from highest-quality source: top customers, high-LTV purchasers.
- Start at 1% for tightest match; expand to 3–5% for broader reach.
- In Advantage+ campaigns, provide lookalikes as signals — not hard constraints.

### First-Party Data Pipeline
- Connect CRM (Salesforce, HubSpot, GoHighLevel) via automated data bridges.
- Implement Offline Conversions via CAPI: track phone calls, in-person visits, qualified leads.
- Capture and store fbclid values with contact records for downstream attribution.
- Regularly refresh customer lists — stale data degrades match rates.

### Exclusion Strategy
- Always exclude current customers and recently engaged users from prospecting.
- ASC+ supports custom audience exclusions and basic demographic preferences.
- Create separate campaigns for retention/upsell targeting of existing customers.

---

## PILLAR 6: PERFORMANCE 5 FRAMEWORK

Meta's official five-pillar playbook for highest performance gains:

1. **Account Simplification**: Consolidate campaigns. Fewer ad sets with broader targeting = faster AI learning. Combine prospecting and remarketing.
2. **Automation (Advantage+ Suite)**: Leverage Advantage+ for budget, creative, placement, and audience optimization.
3. **Creative Diversification**: Wide variety of assets across concepts and formats. **32% increased efficiency** with diverse creative.
4. **Data Quality**: CAPI + Pixel redundancy. Connect CRM and offline data. Achieve EMQ > 6.0. CAPI restores up to 15% of lost attribution.
5. **Results Validation**: Lift testing and incrementality experiments. Monthly A/B tests and brand lift studies. Focus on incremental ROAS, not last-click.

---

## PILLAR 7: FULL-FUNNEL CAMPAIGN STRATEGY

### Top of Funnel (Awareness / Prospecting)
- Objective: Awareness or Sales with broad targeting + Advantage+ Audience.
- Creative: Educational content addressing pain points; create demand.
- Formats: Video (Reels, short-form), carousel stories, UGC-style.
- Audience: Broad targeting with audience signals.
- Budget: Largest allocation — new customer acquisition starts here.

### Middle of Funnel (Consideration / Engagement)
- Objective: Traffic, Engagement, or Sales retargeting warm audiences.
- Creative: Product demos, testimonials, case studies, comparison content.
- Formats: Carousel storytelling, video with social proof, Instant Experience.
- Audience: Website visitors, video viewers, page engagers, email list lookalikes.
- Budget: Medium allocation — nurture engaged prospects.

### Bottom of Funnel (Conversion / Remarketing)
- Objective: Sales or Leads with remarketing audiences.
- Creative: Strong offers, urgency, social proof, specific case study results, irresistible CTAs.
- Formats: Dynamic product ads (catalog), collection ads, Lead Form ads.
- Audience: Cart abandoners, product viewers, form starters, engaged leads from CRM.
- Budget: Smallest allocation but highest ROAS — warmest prospects.

### 2025 Consolidation Trend
- One campaign with creative that serves all funnel stages (let algorithm sort delivery).
- Hybrid model: ASC+ for scaling proven winners + manual campaigns for testing/niche retargeting.

---

## PILLAR 8: LEAD GENERATION BEST PRACTICES

For service businesses (HVAC, plumbing, roofing, mortgage, legal, etc.):

### Lead Form Optimization
- Offer clear value upfront: discount, guide, consultation, or quote in exchange for contact info.
- Use rich media: eye-catching image or short video as creative.
- Keep forms short: minimize questions to reduce abandonment. Prefill where possible.
- Use multiple-choice questions to qualify leads at capture.
- Customize the intro section to explain what happens after submission.
- Customize the thank-you/completion screen to guide next steps (book a call, download guide).

### Lead Quality Optimization
- Use **Higher Intent** form type: adds a review step before submission to filter casual clicks.
- Optimize for downstream events: connect CRM conversions via CAPI so Meta learns which leads become customers.
- Leverage Offline Conversions: integrate phone calls, qualified leads, and closed deals into reporting.
- Build lookalike audiences from best customers (high-LTV, closed-won leads), NOT all leads.
- Test different form lengths to balance lead volume vs. quality.

---

## PILLAR 9: BUDGET & BIDDING STRATEGY

### Budget Allocation
- Use Advantage+ Campaign Budget to let AI distribute spend across ad sets.
- Start with enough budget for **50+ conversions per week** to exit learning phase quickly.
- Scale gradually: increase budgets by **20–30% every few days** to avoid resetting learning.
- For small budgets (< 50 weekly conversions), use manual cost caps to control spend.

### Bidding Strategies
| Strategy | Description | Best For |
|---|---|---|
| Lowest Cost (Default) | Meta gets the most results at lowest cost | New campaigns, discovery phase |
| Cost Cap | Maximum average cost per result | Scaling while maintaining CPA targets |
| ROAS Goal | Target minimum return on ad spend | E-commerce with revenue tracking |
| Bid Cap | Hard limit on maximum bid per auction | Maximum cost control, experienced advertisers |

---

## PILLAR 10: AD POLICIES & COMPLIANCE

### Special Ad Categories (MUST DECLARE AT CAMPAIGN CREATION)
- Housing, Employment, Credit, and Politics/Social Issues require pre-approval.
- Limited targeting options in these categories (anti-discrimination compliance).
- **Mortgage advertising = Credit/Housing special category** (additional restrictions apply).
- Failure to declare special categories risks account suspension.

### Prohibited Content
- Discriminatory targeting based on protected characteristics.
- Misleading claims, deceptive practices, sensationalized content.
- Restricted: tobacco, weapons, adult content, illegal substances.
- Before/after images implying unrealistic results.

### Privacy Compliance
- Implement Consent Management Platform (CMP) for GDPR, CCPA, PIPEDA compliance.
- Block Pixel from firing until user grants consent.
- CAPI requires valid legal basis for data processing.

---

## KEY METRICS & BENCHMARKS (2025/2026)

| Metric | Benchmark | Source |
|---|---|---|
| Creative impact on performance | 70–80% of performance from creative | AppsFlyer 2025 |
| ASC+ revenue per dollar | +22% vs. manual campaigns | Meta Internal |
| ASC+ cost per conversion | 17% lower vs. manual | Meta Internal |
| Creative diversification impact | +32% efficiency | Meta Performance 5 |
| CAPI data recovery | 20–30% of lost conversions | Industry consensus |
| 4:5 vertical vs 1:1 (Feed) | Up to 15% higher engagement | Billo 2025 |
| Video time on platform | 60%+ of FB/IG time | Meta 2025 |
| Creative lifespan | ~21 days before fatigue | Industry benchmark |
| EMQ target | > 6.0 out of 10 | Meta Best Practice |
| Learning phase exit | 50+ conversions/week | Meta Best Practice |
| Budget scaling cadence | 20–30% increase every few days | Meta Best Practice |

---

## INDUSTRY-SPECIFIC: TRADES & SERVICE BUSINESSES

For HVAC, plumbing, roofing, electrical, mortgage, legal, and similar local services:

### Campaign Structure for Trades
- Primary objective: **Leads** (phone calls and form fills).
- Lead Form ads with instant forms including service type selection (multiple choice for qualification).
- Configure Offline Conversions via CAPI to track which leads become booked jobs.
- Declare Housing/Credit special category for mortgage advertising.

### Creative for Trades
- Before/after project photos (where policy permits).
- Short video testimonials from real customers (UGC-style, phone-filmed, with captions).
- Seasonal urgency: furnace tune-ups before winter, AC service before summer, roof inspections after storms.
- Social proof: review counts, star ratings, years in business, license numbers.

### Targeting for Local Services
- Geographic targeting with radius around service area (typically 25–50km).
- Provide Advantage+ Audience signals with homeowner demographics and relevant interests.
- Build remarketing audiences from website visitors and form starters.
- Lookalike audiences from best customers (closed jobs, repeat clients, high-value projects).

---

## KEY 2025/2026 PLATFORM CHANGES

- **Andromeda**: Meta's new AI ad retrieval system emphasizing creative diversification.
- **Advantage+ naming unification**: All features now carry the Advantage+ prefix.
- **Offline Conversions API discontinued** (May 2025): All offline tracking flows through standard CAPI.
- **Learning phase changes**: Adding new ads to an ad set no longer always resets learning phase.
- **Ad set spending limits** changed from hard caps to averages with ACB.
- **Creative test duplication**: Duplicate an ad to test up to 5–10 new variations.
- **Advantage+ Destinations**: Meta can send users to a different page if predicted to improve conversions.
- **Auto-generated carousels and collections** from single image/video ads + product catalog.
- **Generative AI features**: auto-animate, background swaps, text suggestions, audio translation.
- **Opportunity Score** integrated into Advantage+ Campaign Setup.
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
  ASC: "Advantage+ Sales Campaigns: Automated prospecting + remarketing. +22% revenue/$ vs. manual.",
  AUDIENCE: "Advantage+ Audience: AI targeting using your data as signals, expanding to find best users.",
  CREATIVE: "Advantage+ Creative: Auto-enhancements — crop, animate, background swap, translate, stickers.",
  PLACEMENTS: "Advantage+ Placements: Automatic distribution across FB, IG, Messenger, Audience Network.",
  BUDGET: "Advantage+ Campaign Budget (ACB): AI distributes budget to top ad sets. Averages, not hard caps.",
  LEADS: "Advantage+ Leads Campaigns: Same automation as ASC+ but optimized for lead generation (New 2025).",
  CATALOG: "Advantage+ Catalog Ads: Dynamic product showcase matched to users based on browsing behavior.",
  DESTINATIONS: "Advantage+ Destinations: Meta can redirect users to a higher-converting URL on your site."
};

export const CREATIVE_SPECS = {
  FEED: {
    ratio: "4:5 vertical (recommended) or 1:1 square",
    resolution: "1080x1350px minimum",
    videoLength: "Up to 240 min (15–60s optimal)",
    tip: "4:5 gets up to 15% higher engagement than 1:1 in Feed"
  },
  STORIES: {
    ratio: "9:16 vertical",
    resolution: "1080x1920px",
    videoLength: "Up to 60s (under 15s optimal)",
    tip: "Leave top 14% and bottom 20% free of text/logos (UI overlay zones)"
  },
  REELS: {
    ratio: "9:16 vertical",
    resolution: "1080x1920px",
    videoLength: "Up to 90s (7–15s optimal for performance)",
    tip: "GEM on Reels delivers up to 5% more ad conversions"
  },
  MESSENGER: {
    ratio: "1.91:1 horizontal",
    resolution: "1200x628px",
    videoLength: "Up to 240 min",
    tip: "Use for retargeting warm audiences in inbox"
  },
  RIGHT_COLUMN: {
    ratio: "1:1 square",
    resolution: "1080x1080px",
    videoLength: "Image only",
    tip: "Desktop-only placement; lower CPM but lower engagement"
  },
  AUDIENCE_NETWORK: {
    ratio: "9:16 vertical (recommended) or 16:9",
    resolution: "1080x1920px",
    videoLength: "Up to 120s",
    tip: "App inventory; strong for reach extension at low CPM"
  }
};

export const PERFORMANCE_5_CHECKLIST = [
  "1. Account Simplification: Consolidate campaigns. Fewer ad sets + broader targeting = faster AI learning. Combine prospecting and remarketing.",
  "2. Automation: Leverage Advantage+ suite — ACB, Advantage+ Audience, Advantage+ Creative, Advantage+ Placements.",
  "3. Creative Diversification: Wide variety of concepts, formats, and tones. +32% efficiency with diverse creative assets.",
  "4. Data Quality: Run Pixel + CAPI simultaneously. Connect CRM and offline data. Target EMQ > 6.0.",
  "5. Results Validation: Monthly A/B tests and brand lift studies. Measure incremental ROAS, not last-click attribution."
];

export const BIDDING_STRATEGIES = {
  LOWEST_COST: "Default — Meta gets the most results at the lowest cost per result. Best for new campaigns and discovery.",
  COST_CAP: "Set a maximum average cost per result. Best for scaling while maintaining CPA targets.",
  ROAS_GOAL: "Target a minimum return on ad spend. Best for e-commerce with revenue tracking enabled.",
  BID_CAP: "Hard limit on maximum bid per auction. Best for maximum cost control by experienced advertisers."
};

export const SPECIAL_AD_CATEGORIES = [
  "Credit: Mortgage, loans, credit cards, insurance — restricted targeting; no age/gender/zip exclusions.",
  "Housing: Real estate, rentals, home services — restricted targeting under Fair Housing Act.",
  "Employment: Job listings, staffing, recruitment — restricted targeting.",
  "Social Issues / Elections / Politics: Political ads — requires authorization and disclaimer."
];

export const LEAD_FORM_BEST_PRACTICES = {
  formTypes: {
    MORE_VOLUME: "Standard form — lower friction, higher volume, lower quality.",
    HIGHER_INTENT: "Adds a review step before submission — fewer leads but significantly higher quality."
  },
  optimization: [
    "Offer clear value upfront (free quote, consultation, guide, discount).",
    "Use rich media creative (image or short video).",
    "Keep form short: name, email, phone maximum for service businesses.",
    "Use multiple-choice questions to qualify at capture (e.g., 'What service do you need?').",
    "Prefill fields wherever Meta can autofill from user profile.",
    "Customize thank-you screen with clear next steps (book a call, download, confirm).",
    "Connect CRM via CAPI Offline Conversions to teach Meta which leads convert.",
    "Build lookalike audiences from closed jobs/won deals — NOT from all leads."
  ]
};

export const FULL_FUNNEL_STRATEGY = {
  TOF: {
    objective: "Awareness or Sales (broad)",
    creative: "Educational content, problem-aware hooks, UGC, Reels",
    audience: "Broad targeting with Advantage+ Audience signals",
    budget: "Largest allocation (50–60% of total)"
  },
  MOF: {
    objective: "Traffic, Engagement, or Sales (warm retargeting)",
    creative: "Testimonials, demos, case studies, social proof carousels",
    audience: "Website visitors (30–90 day), video viewers, page engagers, email lookalikes",
    budget: "Medium allocation (25–35% of total)"
  },
  BOF: {
    objective: "Sales or Leads (remarketing)",
    creative: "Strong offers, urgency, specific results, irresistible CTAs",
    audience: "Cart abandoners, product viewers, form starters, warm CRM leads",
    budget: "Smallest allocation but highest ROAS (10–20% of total)"
  }
};
