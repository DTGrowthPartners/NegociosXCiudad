import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a sample scrape run
  const scrapeRun = await prisma.scrapeRun.create({
    data: {
      city: 'Bogotá',
      category: 'Restaurantes',
      status: 'SUCCESS',
      startedAt: new Date(Date.now() - 3600000),
      finishedAt: new Date(),
      totalFound: 10,
      totalSaved: 8,
      errorsCount: 2,
      errors: JSON.stringify([
        { business: 'Negocio X', error: 'Timeout al cargar ficha' },
        { business: 'Negocio Y', error: 'Selector no encontrado' },
      ]),
    },
  });

  // Sample leads data
  const leadsData = [
    {
      businessName: 'Restaurante El Buen Sabor',
      city: 'Bogotá',
      category: 'Restaurantes',
      address: 'Calle 85 #15-20, Chapinero',
      phone: '3001234567',
      websiteUrl: null,
      instagramUrl: null,
      hasWebsite: false,
      hasInstagram: false,
      opportunityScore: 65,
      status: 'NEW',
      scrapeRunId: scrapeRun.id,
    },
    {
      businessName: 'Pizzería La Italiana',
      city: 'Bogotá',
      category: 'Restaurantes',
      address: 'Carrera 7 #45-30',
      phone: '3109876543',
      websiteUrl: 'https://pizzeria-laitaliana.wixsite.com/menu',
      instagramUrl: null,
      hasWebsite: true,
      hasInstagram: false,
      opportunityScore: 35,
      status: 'NEW',
      scrapeRunId: scrapeRun.id,
    },
    {
      businessName: 'Café del Parque',
      city: 'Bogotá',
      category: 'Restaurantes',
      address: 'Calle 93 #11-40',
      phone: '3205551234',
      websiteUrl: 'https://cafedelparque.com',
      instagramUrl: 'https://instagram.com/cafedelparque',
      hasWebsite: true,
      hasInstagram: true,
      opportunityScore: 0,
      status: 'CONTACTED',
      scrapeRunId: scrapeRun.id,
    },
    {
      businessName: 'Asadero Don Julio',
      city: 'Bogotá',
      category: 'Restaurantes',
      address: 'Avenida 68 #22-15',
      phone: '3157778899',
      websiteUrl: null,
      instagramUrl: 'https://instagram.com/asaderodonj',
      hasWebsite: false,
      hasInstagram: true,
      opportunityScore: 50,
      status: 'NEW',
      scrapeRunId: scrapeRun.id,
    },
    {
      businessName: 'Sushi Express',
      city: 'Bogotá',
      category: 'Restaurantes',
      address: 'Calle 116 #18-50',
      phone: null,
      websiteUrl: null,
      instagramUrl: null,
      hasWebsite: false,
      hasInstagram: false,
      opportunityScore: 75,
      status: 'NEW',
      scrapeRunId: scrapeRun.id,
    },
    {
      businessName: 'Panadería San Miguel',
      city: 'Medellín',
      category: 'Panaderías',
      address: 'Calle 10 #43-25, El Poblado',
      phone: '3042223344',
      websiteUrl: 'https://linktr.ee/panaderiasanmiguel',
      instagramUrl: null,
      hasWebsite: true,
      hasInstagram: false,
      opportunityScore: 35,
      status: 'NEW',
      scrapeRunId: scrapeRun.id,
    },
    {
      businessName: 'Ferretería Central',
      city: 'Medellín',
      category: 'Ferreterías',
      address: 'Carrera 52 #48-20',
      phone: '3118889900',
      websiteUrl: null,
      instagramUrl: null,
      hasWebsite: false,
      hasInstagram: false,
      opportunityScore: 65,
      status: 'REPLIED',
      notes: 'Interesado en cotización para página básica',
      scrapeRunId: scrapeRun.id,
    },
    {
      businessName: 'Barbería Los Clásicos',
      city: 'Cali',
      category: 'Barberías',
      address: 'Calle 5 #38-12',
      phone: '3006667788',
      websiteUrl: null,
      instagramUrl: 'https://instagram.com/losclasicosbarber',
      hasWebsite: false,
      hasInstagram: true,
      opportunityScore: 50,
      status: 'WON',
      notes: 'Cerrado! Contrato por landing page + gestión IG',
      scrapeRunId: scrapeRun.id,
    },
  ];

  for (const lead of leadsData) {
    await prisma.lead.create({ data: lead });
  }

  console.log(`✅ Created ${leadsData.length} sample leads`);
  console.log(`✅ Created 1 sample scrape run`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
