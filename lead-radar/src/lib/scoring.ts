import { ScrapedBusiness } from '@/types';

// Generic website patterns that indicate low-quality or placeholder sites
const GENERIC_WEBSITE_PATTERNS = [
  'wixsite.com',
  'wix.com',
  'linktr.ee',
  'linktree.com',
  'bit.ly',
  'taplink.cc',
  'carrd.co',
  'bio.link',
  'beacons.ai',
  'solo.to',
  'milkshake.app',
  'campsite.bio',
  'withkoji.com',
  'hoo.be',
  'snipfeed.co',
  'stan.store',
  'lnk.bio',
  'direct.me',
  'flowpage.com',
  'shorby.com',
];

/**
 * Check if a website URL is considered "generic" or low-quality
 */
export function isGenericWebsite(url: string | null): boolean {
  if (!url) return false;

  const lowerUrl = url.toLowerCase();
  return GENERIC_WEBSITE_PATTERNS.some((pattern) => lowerUrl.includes(pattern));
}

/**
 * Calculate opportunity score for a business
 * Higher score = better opportunity (more likely to need web services)
 *
 * Scoring rules:
 * - No website: +40 points
 * - No Instagram: +15 points
 * - No phone: +10 points
 * - Generic/placeholder website: +10 points
 *
 * Score is clamped to 0-100
 */
export function calculateOpportunityScore(business: ScrapedBusiness): number {
  let score = 0;

  // No website is the biggest opportunity
  if (!business.websiteUrl) {
    score += 40;
  } else if (isGenericWebsite(business.websiteUrl)) {
    // Has website but it's generic/low-quality
    score += 10;
  }

  // No Instagram presence
  if (!business.instagramUrl) {
    score += 15;
  }

  // No phone listed (harder to contact but may indicate less digital presence)
  if (!business.phone) {
    score += 10;
  }

  // Clamp score to 0-100
  return Math.min(100, Math.max(0, score));
}

/**
 * Get score interpretation label
 */
export function getScoreLabel(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 70) {
    return {
      label: 'Alta',
      color: 'text-green-600 bg-green-100',
      description: 'Excelente oportunidad - negocio con poca presencia digital',
    };
  }
  if (score >= 40) {
    return {
      label: 'Media',
      color: 'text-yellow-600 bg-yellow-100',
      description: 'Buena oportunidad - puede mejorar su presencia',
    };
  }
  if (score > 0) {
    return {
      label: 'Baja',
      color: 'text-orange-600 bg-orange-100',
      description: 'Oportunidad limitada - ya tiene cierta presencia',
    };
  }
  return {
    label: 'Mínima',
    color: 'text-gray-600 bg-gray-100',
    description: 'Sin oportunidad clara - ya tiene web e Instagram',
  };
}

/**
 * Get score as percentage for progress bars
 */
export function getScorePercentage(score: number): number {
  return Math.min(100, Math.max(0, score));
}
