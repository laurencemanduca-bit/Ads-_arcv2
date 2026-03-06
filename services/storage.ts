
import { GeneratedCampaign, AuditReport } from '../types';

const CAMPAIGN_KEY = 'ads_architect_campaigns';
const AUDIT_KEY = 'ads_architect_audits';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Campaign Storage ---

export const saveCampaignToHistory = (
    campaignData: Omit<GeneratedCampaign, 'id' | 'createdAt' | 'businessName' | 'industry' | 'location'>, 
    meta: { businessName: string; industry: string; location: string }
): GeneratedCampaign => {
  const newCampaign: GeneratedCampaign = {
    ...campaignData,
    id: generateId(),
    createdAt: Date.now(),
    businessName: meta.businessName,
    industry: meta.industry,
    location: meta.location
  };

  const existing = getCampaignHistory();
  const updated = [newCampaign, ...existing].slice(0, 50); // Keep last 50
  localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(updated));
  
  return newCampaign;
};

export const getCampaignHistory = (): GeneratedCampaign[] => {
  const data = localStorage.getItem(CAMPAIGN_KEY);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};

export const deleteCampaign = (id: string) => {
  const existing = getCampaignHistory();
  const updated = existing.filter(c => c.id !== id);
  localStorage.setItem(CAMPAIGN_KEY, JSON.stringify(updated));
};

// --- Audit Storage ---

export const saveAuditToHistory = (
    audit: Omit<AuditReport, 'id' | 'createdAt' | 'sourceSummary' | 'businessName'>, 
    summary: string, 
    businessName?: string
): AuditReport => {
  const newAudit: AuditReport = {
    ...audit,
    id: generateId(),
    createdAt: Date.now(),
    sourceSummary: summary,
    businessName: businessName
  };

  const existing = getAuditHistory();
  const updated = [newAudit, ...existing].slice(0, 50); // Keep last 50
  localStorage.setItem(AUDIT_KEY, JSON.stringify(updated));

  return newAudit;
};

export const getAuditHistory = (): AuditReport[] => {
  const data = localStorage.getItem(AUDIT_KEY);
  if (!data) return [];
  try { return JSON.parse(data); } catch { return []; }
};

export const deleteAudit = (id: string) => {
  const existing = getAuditHistory();
  const updated = existing.filter(a => a.id !== id);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(updated));
};
