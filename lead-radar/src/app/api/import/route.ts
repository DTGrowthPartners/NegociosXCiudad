import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Papa from 'papaparse';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Archivo demasiado grande. Máximo 10MB.' },
        { status: 400 }
      );
    }

    // Read file content
    const csvText = await file.text();

    // Parse CSV
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid CSV format', details: parseResult.errors },
        { status: 400 }
      );
    }

    const leads = parseResult.data as any[];
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Process each lead
    for (const lead of leads) {
      try {
        // Validate required fields
        if (!lead.businessName || !lead.city || !lead.category) {
          skipped++;
          errors.push(`Lead ${lead.businessName || 'unknown'}: Missing required fields`);
          continue;
        }

        // Check if lead already exists (by business name + city + category)
        const existing = await prisma.lead.findFirst({
          where: {
            businessName: lead.businessName,
            city: lead.city,
            category: lead.category,
          },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Create new lead
        await prisma.lead.create({
          data: {
            businessName: lead.businessName,
            city: lead.city,
            category: lead.category,
            address: lead.address || '',
            phone: lead.phone || '',
            websiteUrl: lead.websiteUrl || null,
            instagramUrl: lead.instagramUrl || null,
            hasWebsite: !!lead.websiteUrl,
            hasInstagram: !!lead.instagramUrl,
            opportunityScore: parseInt(lead.opportunityScore) || 0,
            status: ['NEW', 'CONTACTED', 'REPLIED', 'WON', 'LOST', 'DISCARDED'].includes(lead.status) ? lead.status : 'NEW',
            notes: lead.notes ? String(lead.notes).slice(0, 1000) : '',
          },
        });

        imported++;
      } catch (error) {
        console.error('Error importing lead:', error);
        skipped++;
        errors.push(`Lead ${lead.businessName || 'unknown'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Importado ${imported} leads, omitidos ${skipped}`,
      imported,
      skipped,
      errors: errors.slice(0, 10), // Limit errors shown
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import leads' },
      { status: 500 }
    );
  }
}