import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Papa from 'papaparse';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Build where clause from query params
    const where: Prisma.LeadWhereInput = {};

    const status = searchParams.get('status');
    if (status && status !== 'ALL') {
      where.status = status as any;
    }

    const minScore = searchParams.get('minScore');
    if (minScore) {
      where.opportunityScore = {
        ...((where.opportunityScore as Prisma.IntFilter) || {}),
        gte: parseInt(minScore),
      };
    }

    const hasWebsite = searchParams.get('hasWebsite');
    if (hasWebsite && hasWebsite !== 'ALL') {
      where.hasWebsite = hasWebsite === 'true';
    }

    const hasInstagram = searchParams.get('hasInstagram');
    if (hasInstagram && hasInstagram !== 'ALL') {
      where.hasInstagram = hasInstagram === 'true';
    }

    const city = searchParams.get('city');
    if (city) {
      where.city = { contains: city };
    }

    const category = searchParams.get('category');
    if (category) {
      where.category = { contains: category };
    }

    // Fetch leads
    const leads = await prisma.lead.findMany({
      where,
      orderBy: [{ opportunityScore: 'desc' }, { createdAt: 'desc' }],
    });

    // Transform data for CSV
    const csvData = leads.map((lead) => ({
      'Nombre del Negocio': lead.businessName,
      Ciudad: lead.city,
      Categoría: lead.category,
      Dirección: lead.address || '',
      Teléfono: lead.phone || '',
      'Sitio Web': lead.websiteUrl || '',
      Instagram: lead.instagramUrl || '',
      'Tiene Web': lead.hasWebsite ? 'Sí' : 'No',
      'Tiene Instagram': lead.hasInstagram ? 'Sí' : 'No',
      'Score de Oportunidad': lead.opportunityScore,
      Estado: translateStatus(lead.status),
      Notas: lead.notes || '',
      'Fecha de Creación': lead.createdAt.toISOString(),
    }));

    // Generate CSV
    const csv = Papa.unparse(csvData, {
      quotes: true,
      header: true,
    });

    // Return CSV file
    const filename = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting leads:', error);
    return NextResponse.json(
      { error: 'Failed to export leads' },
      { status: 500 }
    );
  }
}

function translateStatus(status: string): string {
  const translations: Record<string, string> = {
    NEW: 'Nuevo',
    CONTACTED: 'Contactado',
    REPLIED: 'Respondió',
    WON: 'Ganado',
    LOST: 'Perdido',
    DISCARDED: 'Descartado',
  };
  return translations[status] || status;
}
