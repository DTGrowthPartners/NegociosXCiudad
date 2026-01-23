import { NextRequest, NextResponse } from 'next/server';
import { scrapeParamsSchema } from '@/lib/validations';
import { runScrapeJob } from '@/lib/scraper';

export const maxDuration = 300; // 5 minutes max for serverless
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

    // Run the scrape job
    const result = await runScrapeJob(
      validated.city,
      validated.category,
      validated.limit
    );

    return NextResponse.json({
      success: result.success,
      data: {
        scrapeRunId: result.scrapeRunId,
        totalFound: result.totalFound,
        totalSaved: result.totalSaved,
        errorsCount: result.errorsCount,
      },
      message: result.success
        ? `Scraping completado: ${result.totalSaved} negocios guardados`
        : 'Scraping falló - revisa los logs',
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
      { error: 'Failed to run scrape job', details: String(error) },
      { status: 500 }
    );
  }
}
