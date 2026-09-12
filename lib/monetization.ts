export interface CommercialOffer {
  id: string;
  merchant: string;
  destinationUrl: string;
  campaign: string;
  relationship: "affiliate" | "cloud_gpu" | "sponsor" | "premium";
  disclosure: string;
  active: boolean;
  placement?: "workflow" | "compatibility" | "hardware" | "guide" | "lab";
}

// Offers stay inactive until a real agreement and destination are configured.
export const COMMERCIAL_OFFERS: CommercialOffer[] = [];

export interface HardwareRecommendation {
  id: string;
  productName: string;
  category: "GPU" | "RAM" | "NVMe SSD" | "AI workstation";
  merchant: string;
  destinationUrl: string;
  affiliateUrl: string;
  active: boolean;
  evidenceBasis: "TESTED_BY_NEURALDRIFT" | "SPEC_BASED_RECOMMENDATION" | "GENERAL_OPTION";
  editorialNote: string;
  disclosure: string;
}

// Products are intentionally empty until a real merchant relationship exists.
export const HARDWARE_RECOMMENDATIONS: HardwareRecommendation[] = [];

export interface ProductionPackManifest {
  id: string;
  name: string;
  status: "interest_only" | "available";
  workflowIds: string[];
  includedAssets: string[];
  missingAssets: string[];
}

export const PRODUCTION_PACKS: ProductionPackManifest[] = [{
  id: "local-image-creation-starter",
  name: "Local Image Creation Starter Production Pack",
  status: "interest_only",
  workflowIds: ["06", "03", "01", "27", "31", "22"],
  includedAssets: ["Existing workflow JSON files and public execution evidence where available"],
  missingAssets: ["Pack-specific presets", "Unified setup documentation", "Product delivery and checkout"],
}];

export const KPI_DEFINITIONS = {
  organicSessions: "Aggregate sessions attributed to organic search in the configured analytics provider.",
  workflowViews: "workflow_view events",
  workflowDownloads: "workflow_download events",
  downloadRate: "workflow_downloads divided by workflow_views",
  compatibilityChecks: "compatibility_check events",
  tutorialViews: "tutorial_view events",
  newsletterSignups: "newsletter_signup events",
  newsletterConversionRate: "newsletter_signups divided by newsletter CTA views",
  cloudGpuClicks: "cloud_gpu_click events",
  hardwareAffiliateClicks: "affiliate_hardware_click events",
  premiumPackInterest: "premium_pack_interest events",
} as const;

export function getActiveOffer(relationship: CommercialOffer["relationship"]): CommercialOffer | null {
  return COMMERCIAL_OFFERS.find((offer) => offer.active && offer.relationship === relationship) || null;
}
