import { chromium, Browser, Page } from 'playwright';
import * as cheerio from 'cheerio';
import { ScrapedBusiness, ScrapeError, ScrapeStatus } from '@/types';
import { calculateOpportunityScore } from './scoring';
import { isKnownBrand, getMatchingBrand } from './knownBrands';
import prisma from './prisma';
import * as fs from 'fs';
import * as path from 'path';

// Ensure screenshots directory exists
const SCREENSHOTS_DIR = path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

/**
 * Random delay to avoid rate limiting
 */
function randomDelay(min: number = 1500, max: number = 3000): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Extract Instagram URL from website HTML - improved version
 */
function extractInstagramFromHtml(html: string): string | null {
  const $ = cheerio.load(html);
  const excluded = ['explore', 'accounts', 'directory', 'about', 'legal', 'p', 'reel', 'reels', 'stories', 'tv', 'direct'];

  // Strategy 1: Look for Instagram links in common places
  const linkSelectors = [
    'a[href*="instagram.com"]',
    'a[href*="instagr.am"]',
    // Common social icon containers
    '.social a[href*="instagram"]',
    '.social-links a[href*="instagram"]',
    '.redes-sociales a[href*="instagram"]',
    'footer a[href*="instagram"]',
    'header a[href*="instagram"]',
    // Icon-based links
    'a[class*="instagram"]',
    'a[class*="insta"]',
    'a[aria-label*="instagram" i]',
    'a[title*="instagram" i]',
  ];

  for (const selector of linkSelectors) {
    try {
      const links = $(selector);
      for (let i = 0; i < links.length; i++) {
        const href = $(links[i]).attr('href');
        if (href && href.includes('instagram.com/')) {
          const match = href.match(/instagram\.com\/([a-zA-Z0-9_.]{1,30})/i);
          if (match && match[1] && !excluded.includes(match[1].toLowerCase())) {
            return `https://www.instagram.com/${match[1]}`;
          }
        }
      }
    } catch {
      continue;
    }
  }

  // Strategy 2: Look in meta tags (Open Graph, etc.)
  const metaContent = $('meta[property*="instagram"], meta[name*="instagram"], meta[content*="instagram.com"]').attr('content');
  if (metaContent) {
    const match = metaContent.match(/instagram\.com\/([a-zA-Z0-9_.]{1,30})/i);
    if (match && match[1] && !excluded.includes(match[1].toLowerCase())) {
      return `https://www.instagram.com/${match[1]}`;
    }
  }

  // Strategy 3: Look in JSON-LD structured data
  const jsonLdScripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < jsonLdScripts.length; i++) {
    try {
      const content = $(jsonLdScripts[i]).html();
      if (content && content.includes('instagram.com')) {
        const match = content.match(/instagram\.com\/([a-zA-Z0-9_.]{1,30})/i);
        if (match && match[1] && !excluded.includes(match[1].toLowerCase())) {
          return `https://www.instagram.com/${match[1]}`;
        }
      }
    } catch {
      continue;
    }
  }

  // Strategy 4: Search in all page text/HTML for Instagram patterns
  const fullHtml = $.html();
  const allMatches = fullHtml.match(/instagram\.com\/([a-zA-Z0-9_.]{1,30})/gi) || [];
  for (const match of allMatches) {
    const usernameMatch = match.match(/instagram\.com\/([a-zA-Z0-9_.]{1,30})/i);
    if (usernameMatch && usernameMatch[1] && !excluded.includes(usernameMatch[1].toLowerCase())) {
      return `https://www.instagram.com/${usernameMatch[1]}`;
    }
  }

  // Strategy 5: Look for @username patterns that might indicate Instagram
  const bodyText = $('body').text();
  const atMention = bodyText.match(/@([a-zA-Z0-9_.]{3,30})(?:\s|$|\)|,)/);
  if (atMention && atMention[1]) {
    // This is less reliable, so we return it with lower confidence
    // Only return if it looks like a business handle (not a generic word)
    const handle = atMention[1].toLowerCase();
    if (!['gmail', 'hotmail', 'yahoo', 'outlook', 'email', 'correo'].includes(handle)) {
      // We don't return this as it could be Twitter or other platform
      // Just log it for debugging
      console.log(`      (Posible Instagram @${atMention[1]} encontrado en texto)`);
    }
  }

  return null;
}

/**
 * Try to fetch website and extract Instagram link
 */
async function fetchInstagramFromWebsite(
  page: Page,
  websiteUrl: string
): Promise<string | null> {
  try {
    // First try main page
    await page.goto(websiteUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await randomDelay(500, 1000);

    let html = await page.content();
    let instagram = extractInstagramFromHtml(html);
    if (instagram) return instagram;

    // Strategy 2: Try clicking on contact/about links to find social media
    const contactLinks = ['contacto', 'contact', 'about', 'nosotros', 'quienes-somos', 'sobre-nosotros'];
    for (const linkText of contactLinks) {
      try {
        const link = page.locator(`a[href*="${linkText}"]`).first();
        if (await link.isVisible({ timeout: 1000 })) {
          await link.click();
          await randomDelay(1000, 1500);
          html = await page.content();
          instagram = extractInstagramFromHtml(html);
          if (instagram) return instagram;
          // Go back to main page
          await page.goBack();
          await randomDelay(500, 1000);
        }
      } catch {
        continue;
      }
    }

    return null;
  } catch (error) {
    console.log(`Could not fetch website ${websiteUrl}:`, error);
    return null;
  }
}

/**
 * Extract Instagram username from various URL formats
 */
function extractInstagramUsername(text: string): string | null {
  // Patterns to match Instagram URLs and usernames
  const patterns = [
    /instagram\.com\/([a-zA-Z0-9_.]{1,30})\/?(?:\?|$|"|'|<|\s)/i,
    /instagram\.com\/([a-zA-Z0-9_.]{1,30})/i,
    /@([a-zA-Z0-9_.]{1,30})(?:\s|$|"|')/,
  ];

  const excluded = ['explore', 'accounts', 'directory', 'about', 'legal', 'p', 'reel', 'reels', 'stories', 'tv', 'direct', 'lite', 'static', 'developer', 'help', 'privacy', 'terms', 'press', 'api', 'brand', 'blog'];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1] && !excluded.includes(match[1].toLowerCase())) {
      return match[1];
    }
  }
  return null;
}

/**
 * Search for Instagram using multiple strategies
 */
async function searchInstagramMultiStrategy(
  page: Page,
  businessName: string,
  city: string
): Promise<string | null> {
  // Clean business name for search (remove special chars that might break search)
  const cleanName = businessName.replace(/[^\w\sáéíóúñü]/gi, '').trim();

  console.log(`      🔍 Buscando Instagram para: ${cleanName}`);

  // Strategy 1: Google search with site:instagram.com
  try {
    const googleQuery = `site:instagram.com "${cleanName}" ${city}`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(googleQuery)}&num=10`;

    await page.goto(googleUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await randomDelay(1500, 2500);

    // Get all href attributes that contain instagram
    const pageHtml = await page.content();

    // Look for Instagram URLs in the HTML
    const instagramMatches = pageHtml.match(/instagram\.com\/([a-zA-Z0-9_.]{1,30})/gi) || [];

    for (const match of instagramMatches) {
      const username = extractInstagramUsername(match);
      if (username) {
        console.log(`      ✓ Encontrado via Google site search: @${username}`);
        return `https://www.instagram.com/${username}`;
      }
    }
  } catch (error) {
    console.log(`      Google site search failed:`, error);
  }

  // Strategy 2: DuckDuckGo search (less likely to block)
  try {
    const ddgQuery = `${cleanName} ${city} instagram`;
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(ddgQuery)}`;

    await page.goto(ddgUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await randomDelay(1000, 2000);

    const ddgHtml = await page.content();
    const ddgMatches = ddgHtml.match(/instagram\.com\/([a-zA-Z0-9_.]{1,30})/gi) || [];

    for (const match of ddgMatches) {
      const username = extractInstagramUsername(match);
      if (username) {
        console.log(`      ✓ Encontrado via DuckDuckGo: @${username}`);
        return `https://www.instagram.com/${username}`;
      }
    }
  } catch (error) {
    console.log(`      DuckDuckGo search failed:`, error);
  }

  // Strategy 3: Regular Google search
  try {
    const query = `"${cleanName}" ${city} instagram`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=10`;

    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await randomDelay(1500, 2500);

    // Try to find Instagram links in href attributes
    const links = await page.locator('a').all();
    for (const link of links) {
      try {
        const href = await link.getAttribute('href');
        if (href && href.includes('instagram.com')) {
          const username = extractInstagramUsername(href);
          if (username) {
            console.log(`      ✓ Encontrado via Google regular: @${username}`);
            return `https://www.instagram.com/${username}`;
          }
        }
      } catch {
        continue;
      }
    }

    // Also check page content for Instagram URLs
    const pageContent = await page.content();
    const contentMatches = pageContent.match(/instagram\.com\/([a-zA-Z0-9_.]{1,30})/gi) || [];

    for (const match of contentMatches) {
      const username = extractInstagramUsername(match);
      if (username) {
        console.log(`      ✓ Encontrado en contenido Google: @${username}`);
        return `https://www.instagram.com/${username}`;
      }
    }
  } catch (error) {
    console.log(`      Google regular search failed:`, error);
  }

  // Strategy 4: Bing search as fallback
  try {
    const bingQuery = `${cleanName} ${city} instagram`;
    const bingUrl = `https://www.bing.com/search?q=${encodeURIComponent(bingQuery)}`;

    await page.goto(bingUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await randomDelay(1000, 2000);

    const bingHtml = await page.content();
    const bingMatches = bingHtml.match(/instagram\.com\/([a-zA-Z0-9_.]{1,30})/gi) || [];

    for (const match of bingMatches) {
      const username = extractInstagramUsername(match);
      if (username) {
        console.log(`      ✓ Encontrado via Bing: @${username}`);
        return `https://www.instagram.com/${username}`;
      }
    }
  } catch (error) {
    console.log(`      Bing search failed:`, error);
  }

  console.log(`      ✗ No se encontró Instagram para ${cleanName}`);
  return null;
}

/**
 * Main scraper class for Google Maps
 */
export class GoogleMapsScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private errors: ScrapeError[] = [];
  private scrapeRunId: string | null = null;

  async initialize(): Promise<void> {
    console.log('🚀 Initializing browser...');
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const context = await this.browser.newContext({
      locale: 'es-CO',
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 720 },
    });
    this.page = await context.newPage();
    console.log('✅ Browser initialized');
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  private async saveScreenshot(name: string): Promise<void> {
    if (!this.page) return;
    try {
      const filename = `${name}-${Date.now()}.png`;
      await this.page.screenshot({
        path: path.join(SCREENSHOTS_DIR, filename),
        fullPage: false,
      });
      console.log(`📸 Screenshot saved: ${filename}`);
    } catch (error) {
      console.log('Failed to save screenshot:', error);
    }
  }

  private logError(error: string, business?: string): void {
    const scrapeError: ScrapeError = {
      business,
      error,
      timestamp: new Date().toISOString(),
    };
    this.errors.push(scrapeError);
    console.error(`❌ Error${business ? ` (${business})` : ''}: ${error}`);
  }

  /**
   * Search Google Maps and scroll to load results
   */
  async searchAndScroll(
    city: string,
    category: string,
    limit: number
  ): Promise<string[]> {
    if (!this.page) throw new Error('Browser not initialized');

    const query = `${category} en ${city}`;
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;

    console.log(`🔍 Searching: ${query}`);

    // Use domcontentloaded instead of networkidle (Maps never stops loading)
    await this.page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for the page to stabilize
    await randomDelay(3000, 5000);

    // Accept cookies if dialog appears (try multiple languages)
    try {
      const cookieButtons = [
        'button:has-text("Aceptar todo")',
        'button:has-text("Accept all")',
        'button:has-text("Rechazar todo")',
        'button:has-text("Reject all")',
        '[aria-label="Accept all"]',
      ];

      for (const selector of cookieButtons) {
        try {
          const btn = this.page.locator(selector).first();
          if (await btn.isVisible({ timeout: 2000 })) {
            await btn.click();
            console.log('   ✓ Cookie dialog dismissed');
            await randomDelay(1000, 2000);
            break;
          }
        } catch {
          continue;
        }
      }
    } catch {
      // No cookie dialog, continue
    }

    // Wait for results to appear
    console.log('   Waiting for results to load...');
    await randomDelay(2000, 3000);

    // Find the scrollable results container
    const resultsContainerSelectors = [
      'div[role="feed"]',
      'div.m6QErb[aria-label]',
      'div.m6QErb.DxyBCb',
    ];

    let scrollContainer = null;
    for (const selector of resultsContainerSelectors) {
      try {
        const container = this.page.locator(selector).first();
        if (await container.isVisible({ timeout: 3000 })) {
          scrollContainer = container;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!scrollContainer) {
      await this.saveScreenshot('no-results-container');
      this.logError('Could not find results container');
      return [];
    }

    // Scroll to load more results
    const businessLinks: Set<string> = new Set();
    let previousCount = 0;
    let noNewResultsCount = 0;
    const maxNoNewResults = 3;

    console.log(`📜 Scrolling to load up to ${limit} results...`);

    while (businessLinks.size < limit && noNewResultsCount < maxNoNewResults) {
      // Get current business links
      const links = await this.page.locator('a[href*="/maps/place/"]').all();

      for (const link of links) {
        try {
          const href = await link.getAttribute('href');
          if (href && href.includes('/maps/place/')) {
            businessLinks.add(href);
          }
        } catch {
          continue;
        }
      }

      console.log(`   Found ${businessLinks.size} businesses so far...`);

      if (businessLinks.size >= limit) break;

      // Check if we got new results
      if (businessLinks.size === previousCount) {
        noNewResultsCount++;
      } else {
        noNewResultsCount = 0;
        previousCount = businessLinks.size;
      }

      // Scroll down
      await scrollContainer.evaluate((el) => {
        el.scrollTop = el.scrollTop + 500;
      });

      await randomDelay(1500, 2500);

      // Check for "end of list" indicator
      try {
        const endOfList = this.page.locator('span.HlvSq');
        if (await endOfList.isVisible({ timeout: 500 })) {
          console.log('   Reached end of results list');
          break;
        }
      } catch {
        // Continue scrolling
      }
    }

    const finalLinks = Array.from(businessLinks).slice(0, limit);
    console.log(`✅ Found ${finalLinks.length} business links`);

    return finalLinks;
  }

  /**
   * Extract business details from a place page
   */
  async extractBusinessDetails(placeUrl: string, city: string): Promise<ScrapedBusiness | null> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      await this.page.goto(placeUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await randomDelay(1500, 2500);

      // Extract business name
      let businessName = '';
      const nameSelectors = [
        'h1.DUwDvf',
        'h1[data-attrid="title"]',
        'div.qBF1Pd.fontHeadlineSmall',
        'h1',
      ];

      for (const selector of nameSelectors) {
        try {
          const nameEl = this.page.locator(selector).first();
          if (await nameEl.isVisible({ timeout: 1000 })) {
            businessName = (await nameEl.textContent()) || '';
            if (businessName) break;
          }
        } catch {
          continue;
        }
      }

      if (!businessName) {
        await this.saveScreenshot('no-business-name');
        this.logError('Could not extract business name');
        return null;
      }

      console.log(`   📍 Processing: ${businessName}`);

      // Extract address
      let address: string | null = null;
      try {
        const addressButton = this.page.locator('button[data-item-id="address"]').first();
        if (await addressButton.isVisible({ timeout: 2000 })) {
          address = await addressButton.getAttribute('aria-label');
          address = address?.replace('Dirección: ', '').trim() || null;
        }
      } catch {
        // Try alternative selector
        try {
          const addressEl = this.page.locator('[data-item-id="address"] .Io6YTe').first();
          address = await addressEl.textContent();
        } catch {
          // No address found
        }
      }

      // Extract phone
      let phone: string | null = null;
      try {
        const phoneButton = this.page.locator('button[data-item-id^="phone:"]').first();
        if (await phoneButton.isVisible({ timeout: 2000 })) {
          phone = await phoneButton.getAttribute('aria-label');
          phone = phone?.replace('Teléfono: ', '').replace(/\D/g, '') || null;
        }
      } catch {
        // Try alternative
        try {
          const phoneEl = this.page.locator('[data-item-id^="phone:"] .Io6YTe').first();
          const phoneText = await phoneEl.textContent();
          phone = phoneText?.replace(/\D/g, '') || null;
        } catch {
          // No phone found
        }
      }

      // Extract website
      let websiteUrl: string | null = null;
      try {
        const websiteButton = this.page.locator('a[data-item-id="authority"]').first();
        if (await websiteButton.isVisible({ timeout: 2000 })) {
          websiteUrl = await websiteButton.getAttribute('href');
        }
      } catch {
        // Try alternative
        try {
          const websiteLink = this.page.locator('a[aria-label*="Sitio web"]').first();
          websiteUrl = await websiteLink.getAttribute('href');
        } catch {
          // No website found
        }
      }

      // Try to find Instagram link on the Maps page
      let instagramUrl: string | null = null;
      try {
        const igLink = this.page.locator('a[href*="instagram.com"]').first();
        if (await igLink.isVisible({ timeout: 1000 })) {
          instagramUrl = await igLink.getAttribute('href');
          console.log(`      ✓ Found Instagram on Maps page`);
        }
      } catch {
        // Not found on Maps page
      }

      // If we have a website but no Instagram, try to fetch from website
      if (websiteUrl && !instagramUrl) {
        try {
          const newPage = await this.browser!.newContext().then((ctx) => ctx.newPage());
          instagramUrl = await fetchInstagramFromWebsite(newPage, websiteUrl);
          await newPage.close();
          if (instagramUrl) {
            console.log(`      ✓ Found Instagram on website`);
          }
        } catch {
          // Could not fetch from website
        }
      }

      // If still no Instagram, try multi-strategy search
      if (!instagramUrl) {
        try {
          const searchPage = await this.browser!.newContext().then((ctx) => ctx.newPage());
          instagramUrl = await searchInstagramMultiStrategy(searchPage, businessName, city);
          await searchPage.close();
        } catch {
          // Could not search for Instagram
        }
      }

      return {
        businessName: businessName.trim(),
        address,
        phone,
        websiteUrl,
        instagramUrl,
      };
    } catch (error) {
      this.logError(`Failed to extract details: ${error}`, 'Unknown');
      await this.saveScreenshot('extract-error');
      return null;
    }
  }

  /**
   * Main scrape method
   */
  async scrape(
    city: string,
    category: string,
    limit: number
  ): Promise<{
    businesses: ScrapedBusiness[];
    errors: ScrapeError[];
    totalFound: number;
  }> {
    const businesses: ScrapedBusiness[] = [];

    try {
      await this.initialize();

      // Search and get business links
      const businessLinks = await this.searchAndScroll(city, category, limit);
      const totalFound = businessLinks.length;

      console.log(`\n📊 Processing ${totalFound} businesses...`);

      // Extract details for each business
      for (let i = 0; i < businessLinks.length; i++) {
        const link = businessLinks[i];
        console.log(`\n[${i + 1}/${totalFound}]`);

        try {
          const business = await this.extractBusinessDetails(link, city);
          if (business) {
            businesses.push(business);
          }
        } catch (error) {
          this.logError(`Failed to process business: ${error}`);
        }

        // Rate limiting
        if (i < businessLinks.length - 1) {
          await randomDelay(1500, 3000);
        }
      }
    } finally {
      await this.close();
    }

    return {
      businesses,
      errors: this.errors,
      totalFound: businesses.length + this.errors.length,
    };
  }
}

/**
 * Run scraping job and save results to database
 */
export async function runScrapeJob(
  city: string,
  category: string,
  limit: number
): Promise<{
  success: boolean;
  scrapeRunId: string;
  totalFound: number;
  totalSaved: number;
  errorsCount: number;
}> {
  // Define categories to scrape
  const categoriesToScrape = category
    ? [category]
    : [
        'Restaurantes',
        'Cafeterías',
        'Dentistas',
        'Gimnasios',
        'Barberías',
        'Centros de estética',
        'Consultorios médicos',
        'Agencias de viajes',
        'Fotografía',
        'Florerías',
      ];

  // Create scrape run record
  const scrapeRun = await prisma.scrapeRun.create({
    data: {
      city,
      category: category || 'Todas las categorías',
      status: 'RUNNING' as ScrapeStatus,
      startedAt: new Date(),
    },
  });

  console.log(`\n🎯 Started scrape run: ${scrapeRun.id}`);
  console.log(`   City: ${city}`);
  console.log(`   Category: ${category || 'Todas las categorías'}`);
  console.log(`   Limit: ${limit}`);
  console.log(`   Categories to scrape: ${categoriesToScrape.join(', ')}`);

  const scraper = new GoogleMapsScraper();
  let totalSaved = 0;
  let totalFound = 0;
  const allErrors: string[] = [];

  try {
    // Distribute limit among categories
    const limitPerCategory = category ? limit : Math.max(1, Math.floor(limit / categoriesToScrape.length));

    for (const cat of categoriesToScrape) {
      if (totalSaved >= limit) break; // Stop if we reached the total limit

      console.log(`\n📂 Scraping category: ${cat}`);
      const remainingLimit = limit - totalSaved;
      const categoryLimit = Math.min(limitPerCategory, remainingLimit);

      const { businesses, errors, totalFound: catFound } = await scraper.scrape(
        city,
        cat,
        categoryLimit
      );

      totalFound += catFound;
      allErrors.push(...errors.map(e => e.error || String(e)));

      // Filter out known brands/franchises
      const filteredBusinesses = businesses.filter((business) => {
        const matchingBrand = getMatchingBrand(business.businessName, cat);
        if (matchingBrand) {
          console.log(`   ⏭️ Skipping known brand: ${business.businessName} (matches: ${matchingBrand})`);
          return false;
        }
        return true;
      });

      const skippedCount = businesses.length - filteredBusinesses.length;
      console.log(`💾 Saving ${filteredBusinesses.length} businesses to database (${skippedCount} known brands skipped)...`);

      // Save businesses to database
      for (const business of filteredBusinesses) {
        try {
          const score = calculateOpportunityScore(business);

          await prisma.lead.create({
            data: {
              businessName: business.businessName,
              city,
              category: cat,
              address: business.address,
              phone: business.phone,
              websiteUrl: business.websiteUrl,
              instagramUrl: business.instagramUrl,
              hasWebsite: !!business.websiteUrl,
              hasInstagram: !!business.instagramUrl,
              opportunityScore: score,
              scrapeRunId: scrapeRun.id,
            },
          });
          totalSaved++;
        } catch (error) {
          console.error(`Failed to save business ${business.businessName}:`, error);
        }
      }
    }

    // Update scrape run with results
    await prisma.scrapeRun.update({
      where: { id: scrapeRun.id },
      data: {
        status: 'SUCCESS' as ScrapeStatus,
        finishedAt: new Date(),
        totalFound,
        totalSaved,
        errorsCount: allErrors.length,
        errors: JSON.stringify(allErrors),
      },
    });

    console.log(`\n✅ Scrape completed!`);
    console.log(`   Total found: ${totalFound}`);
    console.log(`   Total saved: ${totalSaved}`);
    console.log(`   Errors: ${allErrors.length}`);

    return {
      success: true,
      scrapeRunId: scrapeRun.id,
      totalFound,
      totalSaved,
      errorsCount: allErrors.length,
    };
  } catch (error) {
    console.error('❌ Scrape failed:', error);

    // Update scrape run with failure
    await prisma.scrapeRun.update({
      where: { id: scrapeRun.id },
      data: {
        status: 'FAILED' as ScrapeStatus,
        finishedAt: new Date(),
        errors: JSON.stringify([{ error: String(error) }]),
        errorsCount: 1,
      },
    });

    return {
      success: false,
      scrapeRunId: scrapeRun.id,
      totalFound: 0,
      totalSaved: 0,
      errorsCount: 1,
    };
  }
}
