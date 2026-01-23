/**
 * Known franchise brands and chains in Colombia by category
 * These businesses have corporate social media presence and should be excluded from lead generation
 */

export const KNOWN_BRANDS: Record<string, string[]> = {
  // Gimnasios
  'Gimnasios': [
    'bodytech',
    'smart fit',
    'smartfit',
    'spinning center',
    'athletic',
    'hard body',
    'hardbody',
    'crossfit',
    'anytime fitness',
    'gold gym',
    'gold\'s gym',
    'planet fitness',
    'curves',
    'energy fitness',
    'fuerza gym',
    'iron gym',
  ],

  // Restaurantes
  'Restaurantes': [
    'mcdonald',
    'mcdonalds',
    'mc donald',
    'burger king',
    'subway',
    'domino',
    'dominos',
    'pizza hut',
    'papa john',
    'papa johns',
    'kfc',
    'kentucky fried',
    'pollo frisby',
    'frisby',
    'kokoriko',
    'la brasa roja',
    'crepes & waffles',
    'crepes and waffles',
    'el corral',
    'presto',
    'jeno\'s pizza',
    'jenos pizza',
    'archie\'s',
    'archies',
    'wok',
    'taco bell',
    'wendy\'s',
    'wendys',
    'starbucks',
    'juan valdez',
    'oma',
    'dunkin',
    'buffalo wings',
    'hooters',
    'chili\'s',
    'chilis',
    'friday\'s',
    'fridays',
    'outback',
    'p.f. chang',
    'pf chang',
    'la 33',
    'andrés carne de res',
    'andres carne de res',
    'la biferia',
    'cali mio',
    'calimio',
  ],

  // Pizzerías
  'Pizzerías': [
    'domino',
    'dominos',
    'pizza hut',
    'papa john',
    'papa johns',
    'jeno\'s pizza',
    'jenos pizza',
    'archie\'s',
    'archies',
    'telepizza',
    'little caesars',
  ],

  // Cafeterías
  'Cafeterías': [
    'starbucks',
    'juan valdez',
    'oma',
    'dunkin',
    'dunkin donuts',
    'krispy kreme',
    'tostao',
    'tostao\'',
    'crem helado',
  ],

  // Droguerías
  'Droguerías': [
    'drogas la rebaja',
    'la rebaja',
    'cruz verde',
    'farmatodo',
    'colsubsidio',
    'cafam',
    'locatel',
    'alemana',
    'pasteur',
    'drogueria olimpica',
    'olímpica',
  ],

  // Supermercados
  'Supermercados': [
    'exito',
    'éxito',
    'carulla',
    'jumbo',
    'metro',
    'makro',
    'alkosto',
    'd1',
    'd 1',
    'ara',
    'justo y bueno',
    'olimpica',
    'olímpica',
    'colsubsidio',
    'la 14',
    'surtimax',
    'euro',
    'pricesmart',
    'costco',
  ],

  // Hoteles
  'Hoteles': [
    'marriott',
    'hilton',
    'holiday inn',
    'ibis',
    'novotel',
    'sheraton',
    'westin',
    'hyatt',
    'radisson',
    'intercontinental',
    'crowne plaza',
    'four points',
    'hampton inn',
    'courtyard',
    'doubletree',
    'wyndham',
    'estelar',
    'dann',
    'ghl',
    'sonesta',
    'ac hotel',
    'fairfield',
    'best western',
    'four seasons',
    'jw marriott',
  ],

  // Tiendas de ropa
  'Tiendas de ropa': [
    'zara',
    'h&m',
    'forever 21',
    'pull&bear',
    'pull and bear',
    'bershka',
    'stradivarius',
    'mango',
    'tennis',
    'studio f',
    'arturo calle',
    'ela',
    'offcorss',
    'patprimo',
    'bosi',
    'vélez',
    'velez',
    'mario hernandez',
    'mario hernández',
    'totto',
    'naf naf',
    'americanino',
    'chevignon',
    'diesel',
    'levis',
    'levi\'s',
    'koaj',
    'adidas',
    'nike',
    'puma',
    'new balance',
    'under armour',
    'reebok',
  ],

  // Zapaterías
  'Zapaterías': [
    'bata',
    'spring step',
    'calzatodo',
    'croydon',
    'payless',
    'hush puppies',
    'ecco',
    'adidas',
    'nike',
    'puma',
    'skechers',
    'vélez',
    'velez',
    'bosi',
  ],

  // Clínicas dentales / Dentistas
  'Clínicas dentales': [
    'dentisalud',
    'sonria',
    'sonría',
    'oral center',
    'bocca',
    'colsanitas',
    'sura',
    'coomeva',
    'compensar',
  ],
  'Dentistas': [
    'dentisalud',
    'sonria',
    'sonría',
    'oral center',
    'bocca',
    'colsanitas',
    'sura',
    'coomeva',
    'compensar',
  ],

  // Ópticas
  'Ópticas': [
    'lafam',
    'optica alemana',
    'óptica alemana',
    'gmoficial',
    'gmo',
    'sunglass hut',
    'lens express',
    'optica colsanitas',
    'luxottica',
  ],

  // Veterinarias / Clínicas veterinarias
  'Veterinarias': [
    'gabrica',
    'pet shop',
    'animalandia',
    'puppis',
    'laika',
  ],
  'Clínicas veterinarias': [
    'gabrica',
    'animalandia',
    'puppis',
    'laika',
  ],

  // Tiendas de mascotas
  'Tiendas de mascotas': [
    'gabrica',
    'pet shop',
    'animalandia',
    'puppis',
    'laika',
    'agrocampo',
  ],

  // Centros de estética / Salones de belleza / Peluquerías
  'Centros de estética': [
    'bodytech wellness',
    'green spa',
    'splendor',
  ],
  'Salones de belleza': [
    'marco aldany',
    'llongueras',
  ],
  'Peluquerías': [
    'marco aldany',
    'llongueras',
  ],
  'Barberías': [
    'jeff\'s barbershop',
  ],

  // Spas
  'Spas': [
    'bodytech wellness',
    'green spa',
  ],

  // Inmobiliarias
  'Inmobiliarias': [
    'century 21',
    'coldwell banker',
    'remax',
    're/max',
    'metrocuadrado',
    'la haus',
    'lahaus',
    'ciencuadras',
    'properati',
    'fincaraiz',
  ],

  // Aseguradoras
  'Aseguradoras': [
    'sura',
    'allianz',
    'mapfre',
    'axa colpatria',
    'colpatria',
    'liberty',
    'seguros bolivar',
    'seguros bolívar',
    'previsora',
    'equidad',
    'positiva',
    'mundial',
  ],

  // Ferreterías
  'Ferreterías': [
    'homecenter',
    'home center',
    'constructor',
    'easy',
    'ferricentro',
    'sodimac',
  ],

  // Agencias de viajes
  'Agencias de viajes': [
    'avianca',
    'latam',
    'aviatur',
    'on vacation',
    'despegar',
    'decameron',
    'price travel',
    'booking',
    'expedia',
  ],

  // Academias de inglés
  'Academias de inglés': [
    'berlitz',
    'wall street english',
    'british council',
    'centro colombo americano',
    'colombo',
    'alianza francesa',
    'open english',
    'smart',
  ],

  // Colegios
  'Colegios': [
    'san jorge',
    'gimnasio moderno',
    'colegio anglo',
    'marymount',
    'nueva granada',
    'los nogales',
    'san carlos',
  ],

  // Escuelas de conducción
  'Escuelas de conducción': [
    'montessori',
    'cesvi',
    'safercar',
  ],

  // Imprentas
  'Imprentas': [
    'fedex',
    'servientrega',
  ],

  // Lavanderías
  'Lavanderías': [
    'mr jeff',
    'lavaseco',
  ],
};

/**
 * Check if a business name matches a known brand
 */
export function isKnownBrand(businessName: string, category: string): boolean {
  const normalizedName = businessName.toLowerCase().trim();

  // Get brands for this specific category
  const categoryBrands = KNOWN_BRANDS[category] || [];

  // Check if the business name contains any known brand
  for (const brand of categoryBrands) {
    if (normalizedName.includes(brand.toLowerCase())) {
      return true;
    }
  }

  return false;
}

/**
 * Get the matching brand name if found
 */
export function getMatchingBrand(businessName: string, category: string): string | null {
  const normalizedName = businessName.toLowerCase().trim();

  const categoryBrands = KNOWN_BRANDS[category] || [];

  for (const brand of categoryBrands) {
    if (normalizedName.includes(brand.toLowerCase())) {
      return brand;
    }
  }

  return null;
}
