import { NextRequest, NextResponse } from 'next/server';
import { scrapeParamsSchema } from '@/lib/validations';
import { startScrapeJob } from '@/lib/scraper';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validated = scrapeParamsSchema.parse(body);

    console.log('🎯 Starting scrape job...');
    console.log(`   City: ${validated.city}`);
    console.log(`   Category: ${validated.category}`);
    console.log(`   Limit: ${validated.limit}`);

    // Start scrape job in background and return immediately
    const scrapeRunId = await startScrapeJob(
      validated.city,
      validated.category,
      validated.limit
    );

    return NextResponse.json({
      success: true,
      data: { scrapeRunId },
      message: 'Scraping iniciado en segundo plano',
    });
  } catch (error) {
    console.error('Scrape error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input parameters', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to start scrape job', details: String(error) },
      { status: 500 }
    );
  }
}
