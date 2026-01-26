import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { leadFiltersSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate query parameters
    const params = {
      status: searchParams.get('status') || undefined,
      minScore: searchParams.get('minScore')
        ? parseInt(searchParams.get('minScore')!)
        : undefined,
      maxScore: searchParams.get('maxScore')
        ? parseInt(searchParams.get('maxScore')!)
        : undefined,
      hasWebsite: searchParams.get('hasWebsite') || undefined,
      hasInstagram: searchParams.get('hasInstagram') || undefined,
      city: searchParams.get('city') || undefined,
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    };

    const validated = leadFiltersSchema.parse(params);

    // Build where clause
    const where: Prisma.LeadWhereInput = {};

    if (validated.status && validated.status !== 'ALL') {
      where.status = validated.status;
    }

    if (validated.minScore !== undefined) {
      where.opportunityScore = {
        ...((where.opportunityScore as Prisma.IntFilter) || {}),
        gte: validated.minScore,
      };
    }

    if (validated.maxScore !== undefined) {
      where.opportunityScore = {
        ...((where.opportunityScore as Prisma.IntFilter) || {}),
        lte: validated.maxScore,
      };
    }

    if (validated.hasWebsite && validated.hasWebsite !== 'ALL') {
      where.hasWebsite = validated.hasWebsite === 'true';
    }

    if (validated.hasInstagram && validated.hasInstagram !== 'ALL') {
      where.hasInstagram = validated.hasInstagram === 'true';
    }

    if (validated.city) {
      where.city = { contains: validated.city };
    }

    if (validated.category) {
      where.category = { contains: validated.category };
    }

    if (validated.search) {
      where.OR = [
        { businessName: { contains: validated.search } },
        { address: { contains: validated.search } },
        { notes: { contains: validated.search } },
      ];
    }

    // Get total count
    const totalCount = await prisma.lead.count({ where });

    // Get leads with pagination
    const leads = await prisma.lead.findMany({
      where,
      orderBy: [
        { opportunityScore: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (validated.page - 1) * validated.limit,
      take: validated.limit,
    });

    // Get unique cities and categories for filters
    const [cities, categories] = await Promise.all([
      prisma.lead.findMany({
        select: { city: true },
        distinct: ['city'],
      }),
      prisma.lead.findMany({
        select: { category: true },
        distinct: ['category'],
      }),
    ]);

    return NextResponse.json({
      leads,
      pagination: {
        page: validated.page,
        limit: validated.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / validated.limit),
      },
      filters: {
        cities: cities.map((c) => c.city),
        categories: categories.map((c) => c.category),
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
