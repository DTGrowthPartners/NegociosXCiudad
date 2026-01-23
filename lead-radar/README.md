# Lead Radar

MVP para detectar negocios que NO tienen página web (o la tienen pero es débil) y generar mensajes de outreach manual.

## Características

- **Scraping de Google Maps**: Busca negocios por ciudad + categoría
- **Detección automática**: Identifica si tienen website e Instagram
- **Scoring de oportunidad**: Calcula un score 0-100 basado en presencia digital
- **Mensajes personalizados**: Genera mensajes de outreach según el perfil del negocio
- **Acciones rápidas**: Copiar mensaje, abrir WhatsApp (wa.me), abrir website/Instagram
- **Dashboard completo**: Filtros, estados, notas y exportación CSV
- **Historial de scraping**: Revisa ejecuciones anteriores con métricas y errores

## Stack Técnico

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Base de datos**: SQLite con Prisma ORM
- **Scraping**: Playwright + Cheerio
- **Validación**: Zod
- **Exportación**: Papaparse

## Requisitos Previos

- **Node.js**: v18.17.0 o superior (recomendado: v20.x LTS)
- **npm**: v9.x o superior

## Instalación

### 1. Clonar/Descargar el proyecto

```bash
cd lead-radar
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Instalar navegadores de Playwright

```bash
npx playwright install chromium
```

> Nota: Solo necesitas Chromium para este proyecto. Si quieres todos los navegadores: `npx playwright install`

### 4. Configurar variables de entorno

El archivo `.env` ya está configurado con valores por defecto. Si necesitas modificarlo:

```bash
# Copiar ejemplo (opcional, ya existe .env)
cp .env.example .env
```

Variables disponibles:
```env
# Ruta de la base de datos SQLite
DATABASE_URL="file:./dev.db"

# Código de país por defecto para WhatsApp (sin +)
DEFAULT_COUNTRY_CODE="57"
```

### 5. Inicializar la base de datos

```bash
# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate
```

> Si es la primera vez, te pedirá un nombre para la migración. Puedes escribir: `init`

### 6. (Opcional) Cargar datos de ejemplo

```bash
npm run seed
```

Esto creará 8 leads de ejemplo para probar la UI sin necesidad de ejecutar scraping.

## Ejecución

### Modo desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Modo producción

```bash
npm run build
npm run start
```

## Uso

### 1. Dashboard Principal

1. Ve a [http://localhost:3000](http://localhost:3000)
2. En "Buscar Negocios":
   - Ingresa la **ciudad** (ej: "Bogotá", "Medellín")
   - Ingresa la **categoría** (ej: "Restaurantes", "Dentistas")
   - Selecciona el **límite** de resultados
   - Click en "Ejecutar Scraping"

3. El scraping puede tomar varios minutos dependiendo del límite seleccionado.

### 2. Gestión de Leads

- **Filtros**: Filtra por estado, score, presencia de website/Instagram, ciudad o categoría
- **Búsqueda**: Busca por nombre, dirección o notas
- **Acciones por lead**:
  - **Copiar mensaje**: Genera y copia un mensaje personalizado
  - **WhatsApp**: Abre wa.me con el mensaje precargado (si tiene teléfono)
  - **Website**: Abre el sitio web del negocio
  - **Instagram**: Abre el perfil de Instagram
- **Expandir lead**: Ver detalles completos, cambiar estado y agregar notas

### 3. Estados de Lead

- **Nuevo**: Lead recién descubierto
- **Contactado**: Ya se envió mensaje
- **Respondió**: El lead respondió
- **Ganado**: Cliente convertido
- **Perdido**: No interesado
- **Descartado**: No es un lead válido

### 4. Exportar CSV

Click en "Exportar CSV" para descargar los leads filtrados en formato CSV.

### 5. Historial de Scraping

Ve a [http://localhost:3000/scrape-runs](http://localhost:3000/scrape-runs) para ver:
- Historial de todas las ejecuciones
- Métricas por ejecución (encontrados, guardados, errores)
- Detalles de errores para debugging

## Sistema de Scoring

El score de oportunidad (0-100) se calcula así:

| Condición | Puntos |
|-----------|--------|
| No tiene website | +40 |
| No tiene Instagram | +15 |
| No tiene teléfono | +10 |
| Website genérico (wixsite, linktr.ee, etc.) | +10 |

**Interpretación**:
- **≥70**: Alta oportunidad
- **40-69**: Media oportunidad
- **1-39**: Baja oportunidad
- **0**: Sin oportunidad clara

## Plantillas de Mensaje

El sistema genera mensajes personalizados según el perfil:

1. **Sin website**: Enfocado en la importancia de tener presencia web
2. **Sin Instagram**: Enfocado en redes sociales como canal de descubrimiento
3. **Alta oportunidad**: Mensaje general sobre mejora digital
4. **Genérico**: Mensaje base para otros casos

## Estructura del Proyecto

```
lead-radar/
├── prisma/
│   ├── schema.prisma      # Modelo de datos
│   └── seed.ts            # Datos de ejemplo
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── leads/     # CRUD de leads
│   │   │   ├── scrape/    # Ejecutar scraping
│   │   │   ├── scrape-runs/  # Historial
│   │   │   └── export/    # Exportar CSV
│   │   ├── scrape-runs/   # Página de historial
│   │   ├── layout.tsx     # Layout principal
│   │   ├── page.tsx       # Dashboard
│   │   └── globals.css    # Estilos globales
│   ├── components/        # Componentes React
│   ├── lib/
│   │   ├── prisma.ts      # Cliente Prisma
│   │   ├── scraper.ts     # Lógica de scraping
│   │   ├── scoring.ts     # Cálculo de score
│   │   ├── messages.ts    # Generación de mensajes
│   │   └── validations.ts # Schemas Zod
│   └── types/             # TypeScript types
├── screenshots/           # Screenshots de errores (auto-generado)
├── .env                   # Variables de entorno
├── package.json
└── README.md
```

## Scripts Disponibles

```bash
npm run dev           # Servidor de desarrollo
npm run build         # Build de producción
npm run start         # Servidor de producción
npm run lint          # Linter

npm run prisma:generate  # Generar cliente Prisma
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:studio    # Abrir Prisma Studio (GUI para BD)

npm run seed          # Cargar datos de ejemplo
```

## Troubleshooting

### Error: "Cannot find module '@prisma/client'"

```bash
npm run prisma:generate
```

### Error: "Browser not found" o problemas con Playwright

```bash
npx playwright install chromium
```

### El scraping no encuentra resultados

- Google Maps puede bloquear requests frecuentes
- Intenta con diferentes ciudades/categorías
- El delay entre requests (1.5-3s) ayuda a evitar bloqueos
- Revisa la carpeta `screenshots/` para ver capturas de errores

### La base de datos está corrupta

```bash
# Eliminar y recrear
rm prisma/dev.db
npm run prisma:migrate
npm run seed  # opcional
```

### Error de timeout en scraping

- El scraping de Google Maps puede ser lento
- Reduce el límite de resultados (ej: 10-20)
- Verifica tu conexión a internet

## Notas Importantes

1. **Rate Limiting**: El scraper incluye delays aleatorios (1.5-3s) entre requests para evitar bloqueos
2. **Best Effort**: Si falla la extracción de un negocio, continúa con los demás
3. **Screenshots**: Los errores de scraping generan screenshots en `/screenshots` para debugging
4. **WhatsApp**: El link wa.me usa el código de país configurado en `.env` (default: 57 Colombia)

## Limitaciones del MVP

- El scraping de Google Maps puede fallar si Google cambia sus selectores
- No hay autenticación de usuarios
- La base de datos es local (SQLite)
- No hay cron jobs automáticos (solo scraping manual)

## Licencia

MIT
