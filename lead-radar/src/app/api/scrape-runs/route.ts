import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const [scrapeRuns, totalCount] = await Promise.all([
      prisma.scrapeRun.findMany({
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { leads: true },
          },
        },
      }),
      prisma.scrapeRun.count(),
    ]);

    return NextResponse.json({
      scrapeRuns: scrapeRuns.map((run) => ({
        ...run,
        leadsCount: run._count.leads,
        errors: run.errors ? JSON.parse(run.errors) : [],
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching scrape runs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scrape runs' },
      { status: 500 }
    );
  }
}
