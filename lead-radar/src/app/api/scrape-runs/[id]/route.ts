import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scrapeRun = await prisma.scrapeRun.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { leads: true },
        },
      },
    });

    if (!scrapeRun) {
      return NextResponse.json(
        { error: 'Scrape run not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: scrapeRun.id,
      status: scrapeRun.status,
      city: scrapeRun.city,
      category: scrapeRun.category,
      totalFound: scrapeRun.totalFound,
      totalSaved: scrapeRun.totalSaved,
      errorsCount: scrapeRun.errorsCount,
      leadsCount: scrapeRun._count.leads,
      startedAt: scrapeRun.startedAt,
      finishedAt: scrapeRun.finishedAt,
    });
  } catch (error) {
    console.error('Error fetching scrape run:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scrape run status' },
      { status: 500 }
    );
  }
}
