import { Lead, ScrapeRun } from '@prisma/client';

export type { Lead, ScrapeRun };

// Define status types as string literals since SQLite doesn't support enums
export type LeadStatus = 'NEW' | 'CONTACTED' | 'REPLIED' | 'WON' | 'LOST' | 'DISCARDED';
export type ScrapeStatus = 'RUNNING' | 'SUCCESS' | 'FAILED';

export interface ScrapedBusiness {
  businessName: string;
  address: string | null;
  phone: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
}

export interface ScrapeParams {
  city: string;
  category: string;
  limit: number;
}

export interface ScrapeResult {
  success: boolean;
  scrapeRunId: string;
  totalFound: number;
  totalSaved: number;
  errorsCount: number;
  errors: ScrapeError[];
}

export interface ScrapeError {
  business?: string;
  error: string;
  timestamp?: string;
}

export interface LeadFilters {
  status?: LeadStatus | 'ALL';
  minScore?: number;
  maxScore?: number;
  hasWebsite?: boolean | 'ALL';
  hasInstagram?: boolean | 'ALL';
  city?: string;
  category?: string;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface LeadWithScore extends Lead {
  opportunityScore: number;
}

export interface OutreachMessage {
  template: string;
  message: string;
  whatsappUrl: string | null;
}

export type MessageTemplate = 'NO_WEBSITE' | 'NO_INSTAGRAM' | 'HIGH_OPPORTUNITY' | 'GENERIC';
