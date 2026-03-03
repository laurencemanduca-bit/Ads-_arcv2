
// ... existing types ...

export interface ClientRecord {
  id: string;
  name: string;
  industry?: string;
  createdAt: number;
}

export interface ProjectFile {
  id: string;
  name: string;
  folderId?: string;
  size: string;
  status: 'Draft' | 'Active' | 'Paused';
  type: 'google' | 'meta' | 'audit' | 'asset_image' | 'asset_video' | 'campaign_google' | 'campaign_meta' | 'audit' | 'document' | 'report_pdf'; 
  data: any;
  createdAt: number;
  downloadUrl?: string;
  storagePath?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  createdAt: number;
}

export interface NoteRecord {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export interface UserInput {
  assignedClientId?: string;
  businessName: string;
  website: string;
  industry: string;
  productService: string;
  location: string;
  targetAudience: string;
  painPoints: string;
  usps: string;
  offers: string;
  competitors: string;
  competitorWeakness?: string; 
  
  brandVoice: string;
  primaryOffer: string;
  psychologicalHook?: string; 
  visualStyle: string;
  campaignTypePreference?: string;
  adFormatPreference?: 'Text' | 'Display' | 'Video' | 'Mixed'; // New
  structurePreference?: 'Single Campaign' | 'Split Campaigns'; // New
  negativeKeywords?: string; 
  discoveryNotes?: string; // New: Raw notes from discovery call

  // Data Foundation (AI Essentials)
  crmTool?: string; // e.g. HubSpot, Salesforce, None
  hasCustomerMatch?: boolean; // Do they have a list of emails?
  trackingStatus?: 'None' | 'Basic' | 'Enhanced'; // Current state of tracking

  // Meta Specific
  creativeAngles?: string; // New: Specific angles to test (e.g. "Founder Story", "Us vs Them")
  metaObjective?: string; // New: Specific Meta Objective (Leads, Sales, Awareness...)

  avgSaleValue: string;
  profitMargin: string;
  customerLtv: string;
  targetLeadsPerMonth: string;
  maxCpa: string;
  
  goal: string;
  conversionDefinition: string;
  leadToCustomerRate: string;
  
  competitorDetail: string;
  seasonality: string;
  upcomingEvents: string;
  launchTiming: string;

  monthlyBudget: string;
  budgetPreference: 'fixed' | 'ai';
  accountMaturity: 'new' | 'mature';
  currentMarketingBudget: string;
  pastExperience: string;

  targetAdGroupCount: string;
}

export interface ResponsiveSearchAd {
  headlines: string[];
  descriptions: string[];
  paths: [string, string];
}

export interface KeywordEntry {
  term: string;
  matchType: string; 
  intent: 'High' | 'Medium' | 'Low';
  searchVolume: string;
  avgCpc: string;
}

export interface AdGroup {
  name: string;
  theme: string;
  targetCpc: string;
  individualBidStrategy: string;
  keywords: KeywordEntry[];
  negativeKeywords: string[];
  ads: ResponsiveSearchAd[];
}

export interface Sitelink {
  text: string;
  desc1: string;
  desc2: string;
  purpose: string;
}

export interface Callout {
  text: string;
}

export interface StructuredSnippet {
  header: string;
  values: string[];
}

export interface ImageIdea {
  description: string;
  style: string;
  ratio: 'Square (1:1)' | 'Landscape (1.91:1)';
}

export interface PriceAssetItem {
  name: string;
  price: string;
  description: string;
}

export interface PriceAsset {
  header: string;
  items: PriceAssetItem[];
}

export interface LeadFormAsset {
  headline: string;
  description: string;
  requiredFields: string[];
  ctaType: string;
}

export interface BudgetScenario {
  label: string;
  budget: string;
  expectedClicks: string;
  expectedConversions: string;
  estCpa: string;
  timeline: string;
  description: string;
}

export interface SeasonalAdjustment {
  month: string;
  adjustment: string;
  amount: string;
  reasoning: string;
}

export interface HealthScoreComponent {
  component: string;
  score: number;
  maxScore: number;
  assessment: string;
}

export interface BudgetHealthScore {
  overallScore: number;
  rating: string;
  breakdown: HealthScoreComponent[];
  strengths: string[];
  risks: string[];
  recommendations: string[];
  confidenceLevel: string;
}

export interface CompetitorSpendAnalysis {
  estimatedSpendLow: string;
  estimatedSpendHigh: string;
  marketPosition: string;
  strategyRecommendation: string;
}

export interface BudgetAllocationItem {
  category: string;
  percentage: string;
  amount: string;
  reasoning: string;
}

export interface BudgetAnalysis {
  benchmarks: {
    avgCpc: string;
    avgCvr: string;
  };
  maxCpaAnalysis: {
    breakEvenCpa: string;
    targetCpa: string;
  };
  scenarios: BudgetScenario[];
  roiProjection: {
    monthlyAdSpend: string;
    estimatedRevenue: string;
    estimatedProfit: string;
    roas: string;
  };
  recommendation: {
    monthlyBudget: string;
    dailyBudget: string;
    reasoning: string;
  };
  seasonalAnalysis: {
    adjustments: SeasonalAdjustment[];
    currentMonthMultiplier: string;
  };
  healthScore: BudgetHealthScore;
  competitorSpendAnalysis: CompetitorSpendAnalysis;
  allocationBreakdown: BudgetAllocationItem[];
}

export interface CampaignStrategy {
  campaignType: string;
  objective: string;
  biddingStrategy: string;
  biddingReasoning: string;
  budgetAllocation: string;
  audienceSegments: string[];
  demographicTargeting: string;
  locationStrategy: string;
  adSchedule: string;
}

export interface CampaignStructure {
  diagram: string;
  networks: string[];
  settings: {
    languages: string;
    adRotation: string;
    startDate: string;
    urlOptions: string;
  };
}

export interface ConversionTracking {
  primaryActions: string[];
  secondaryActions: string[];
  setupInstructions: string;
  gtmInstructions: string[];
  eventSnippet: string;
  enhancedConversions: string;
  attributionModel: string;
}

export interface LandingPageAudit {
  headlineRecommendation: string;
  contentSuggestions: string[];
  speedOptimization: string;
  mobileChecklist: string[];
}

export interface OptimizationRoadmap {
  launchPhase: string;
  learningPhase: string;
  scalingPhase: string;
  keyMetrics: string[];
}

export interface CompetitorInsights {
  missingKeywords: string[];
  messagingGaps: string[];
  differentiationStrategy: string;
  citations: { source: string; url: string }[];
}

export interface GeneratedCampaign {
  id: string;
  createdAt: number;
  businessName: string;
  industry: string;
  location: string;
  budgetAnalysis: BudgetAnalysis;
  strategy: CampaignStrategy;
  structure: CampaignStructure;
  adGroups: AdGroup[];
  assets: {
    sitelinks: Sitelink[];
    callouts: Callout[];
    snippets: StructuredSnippet[];
    imageIdeas: ImageIdea[];
    priceAssets?: PriceAsset;
    leadForm?: LeadFormAsset;
    callAsset?: string;
    promotion?: {
      occasion: string;
      details: string;
    };
  };
  conversionTracking: ConversionTracking;
  landingPage: LandingPageAudit;
  optimization: OptimizationRoadmap;
  competitorAnalysis: CompetitorInsights;
}

export interface MetaAd {
  name: string;
  format: string;
  primaryText: string;
  headline: string;
  description: string;
  callToAction: string;
  visualDescription: string;
}

export interface MetaAdSet {
  name: string;
  targeting: {
    audienceType: string;
    details: string;
    location: string;
    age: string;
  };
  placements: string;
  budgetAllocation: string;
  ads: MetaAd[];
}

export interface MetaCreativeStrategy {
  visualHooks: string[];
  copyAngles: string[];
  formatSuggestions: string[];
}

export interface MetaTrackingSetup {
  pixelInstallation: string[]; 
  standardEvents: string[];
  gtmInstructions: string[]; 
  domainVerification: string;
  capiInstructions: string[];
}

export interface MetaCampaignStructure {
  structureType: string;
  campaigns: {
    name: string;
    purpose: string;
    budgetSplit: string;
  }[];
  rationale: string;
}

export interface Performance5Score {
  overallScore: number;
  breakdown: {
    pillar: string;
    score: number;
    assessment: string;
    recommendation: string;
  }[];
}

export interface GeneratedMetaCampaign {
  id: string;
  createdAt: number;
  businessName: string;
  industry: string;
  location: string;
  
  campaignName: string;
  objective: string;
  specialAdCategories: string;
  buyingType: string;
  
  performance5Score?: Performance5Score;

  budgetAnalysis: BudgetAnalysis;
  budgetStrategy: {
    dailyBudget: string;
    bidStrategy: string;
  };
  
  accountStructure: MetaCampaignStructure;
  
  creativeStrategy: MetaCreativeStrategy;
  adSets: MetaAdSet[];
  
  trackingSetup: MetaTrackingSetup;

  optimization: {
    testingPlan: string;
    scalingMetrics: string[];
  };
}

export interface BenchmarkComparison {
  metric: string;
  yourValue: string;
  industryAvg: string;
  assessment: 'Good' | 'Average' | 'Poor';
}

export interface WastedSpendItem {
  category: string;
  amount: string;
  fix: string;
}

export interface Opportunity {
  title: string;
  impact: string;
  action: string;
}

export interface AuditAction {
  action: string;
  steps: string;
}

export interface AuditReport {
  id: string;
  createdAt: number;
  sourceSummary: string;
  businessName?: string;
  industryContext: string;
  healthScore: {
    score: number;
    rating: string;
    breakdown: { component: string; score: number; assessment: string }[];
  };
  benchmarks: BenchmarkComparison[];
  wastedSpend: {
    total: string;
    percentage: string;
    items: WastedSpendItem[];
    projectedSavings: string;
  };
  opportunities: {
    quickWins: Opportunity[];
    mediumTerm: Opportunity[];
    strategic: Opportunity[];
  };
  recommendations: {
    keywords: { pause: any[]; scale: any[]; add: string[] };
    adCopy: { headlines: string[]; issues: string[] };
    bids: string[];
    structure: string[];
  };
  actionPlan: {
    immediate: AuditAction[];
    weekly: AuditAction[];
    monthly: AuditAction[];
  };
}

export enum AppStatus {
  IDLE,
  ANALYZING_COMPETITORS,
  GENERATING_CAMPAIGN,
  GENERATING_AUDIT,
  SUCCESS,
  ERROR,
}
