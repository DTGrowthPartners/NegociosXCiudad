# Lead Radar - API Documentation

Base URL: `http://localhost:3000`

Todos los endpoints aceptan y devuelven JSON (excepto `/api/export` que devuelve CSV y `/api/import` que recibe FormData).

---

## Tabla de contenidos

| # | Endpoint | Metodo | Descripcion |
|---|----------|--------|-------------|
| 1 | `/api/scrape` | POST | Iniciar scraping en segundo plano |
| 2 | `/api/scrape-runs` | GET | Listar historial de scrapes |
| 3 | `/api/scrape-runs/:id` | GET | Estado de un scrape (para polling) |
| 4 | `/api/leads` | GET | Listar leads con filtros y paginacion |
| 5 | `/api/leads/:id` | GET | Detalle de un lead |
| 6 | `/api/leads/:id` | PATCH | Actualizar estado o notas de un lead |
| 7 | `/api/leads/:id` | DELETE | Eliminar un lead |
| 8 | `/api/export` | GET | Exportar leads a CSV |
| 9 | `/api/import` | POST | Importar leads desde CSV |

---

## 1. Iniciar Scraping

Inicia un proceso de scraping en segundo plano. Devuelve inmediatamente un `scrapeRunId` para consultar el progreso via polling.

```
POST /api/scrape
Content-Type: application/json
```

### Request Body

| Campo | Tipo | Requerido | Validacion | Descripcion |
|-------|------|-----------|------------|-------------|
| `city` | string | Si | 2-100 caracteres | Ciudad a buscar (ej: "Cali", "Medellin") |
| `category` | string | Si | 2-100 caracteres | Categoria del negocio (ej: "Restaurantes") |
| `limit` | number | Si | 1-100 | Cantidad maxima de negocios a buscar |

### Ejemplo Request

```json
{
  "city": "Cali",
  "category": "Restaurantes",
  "limit": 30
}
```

### Response 200

```json
{
  "success": true,
  "data": {
    "scrapeRunId": "cm3abc123def456"
  },
  "message": "Scraping iniciado en segundo plano"
}
```

### Response 400

```json
{
  "error": "Invalid input parameters",
  "details": { ... }
}
```

### Response 500

```json
{
  "error": "Failed to start scrape job",
  "details": "Error message"
}
```

### Flujo recomendado para bots

1. Hacer `POST /api/scrape` para iniciar
2. Guardar el `scrapeRunId` de la respuesta
3. Hacer polling con `GET /api/scrape-runs/:id` cada 3-5 segundos
4. Cuando `status` sea `"SUCCESS"` o `"FAILED"`, el scraping termino
5. Consultar los nuevos leads con `GET /api/leads`

---

## 2. Listar Historial de Scrapes

```
GET /api/scrape-runs
```

### Query Parameters

| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| `page` | number | 1 | Numero de pagina |
| `limit` | number | 20 | Resultados por pagina |

### Ejemplo Request

```
GET /api/scrape-runs?page=1&limit=10
```

### Response 200

```json
{
  "scrapeRuns": [
    {
      "id": "cm3abc123def456",
      "status": "SUCCESS",
      "city": "Cali",
      "category": "Restaurantes",
      "totalFound": 30,
      "totalSaved": 23,
      "errorsCount": 2,
      "leadsCount": 23,
      "startedAt": "2026-02-10T15:30:00.000Z",
      "finishedAt": "2026-02-10T15:35:00.000Z",
      "errors": [
        {
          "business": "Nombre Negocio",
          "error": "Failed to extract details",
          "timestamp": "2026-02-10T15:32:00.000Z"
        }
      ],
      "createdAt": "2026-02-10T15:30:00.000Z",
      "updatedAt": "2026-02-10T15:35:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 5,
    "totalPages": 1
  }
}
```

---

## 3. Estado de un Scrape (Polling)

Consulta el estado actual de un proceso de scraping. Usar para polling hasta que `status` cambie de `"RUNNING"`.

```
GET /api/scrape-runs/:id
```

### URL Parameters

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | string | ID del scrape run |

### Ejemplo Request

```
GET /api/scrape-runs/cm3abc123def456
```

### Response 200 (en progreso)

```json
{
  "id": "cm3abc123def456",
  "status": "RUNNING",
  "city": "Cali",
  "category": "Restaurantes",
  "totalFound": 15,
  "totalSaved": 10,
  "errorsCount": 1,
  "leadsCount": 10,
  "startedAt": "2026-02-10T15:30:00.000Z",
  "finishedAt": null
}
```

### Response 200 (completado)

```json
{
  "id": "cm3abc123def456",
  "status": "SUCCESS",
  "city": "Cali",
  "category": "Restaurantes",
  "totalFound": 30,
  "totalSaved": 23,
  "errorsCount": 2,
  "leadsCount": 23,
  "startedAt": "2026-02-10T15:30:00.000Z",
  "finishedAt": "2026-02-10T15:35:00.000Z"
}
```

### Response 200 (fallido)

```json
{
  "id": "cm3abc123def456",
  "status": "FAILED",
  "city": "Cali",
  "category": "Restaurantes",
  "totalFound": 0,
  "totalSaved": 0,
  "errorsCount": 1,
  "leadsCount": 0,
  "startedAt": "2026-02-10T15:30:00.000Z",
  "finishedAt": "2026-02-10T15:31:00.000Z"
}
```

### Response 404

```json
{
  "error": "Scrape run not found"
}
```

### Valores posibles de `status`

| Status | Descripcion |
|--------|-------------|
| `RUNNING` | Scraping en progreso. Seguir haciendo polling. |
| `SUCCESS` | Scraping completado exitosamente. |
| `FAILED` | Scraping fallo. Revisar errores. |

---

## 4. Listar Leads

Obtiene leads con filtros, busqueda y paginacion.

```
GET /api/leads
```

### Query Parameters

| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| `page` | number | 1 | Numero de pagina (min: 1) |
| `limit` | number | 20 | Resultados por pagina (1-100) |
| `status` | string | - | Filtrar por estado. Valores: `NEW`, `CONTACTED`, `REPLIED`, `WON`, `LOST`, `DISCARDED` |
| `minScore` | number | - | Score minimo de oportunidad (0-100) |
| `maxScore` | number | - | Score maximo de oportunidad (0-100) |
| `hasWebsite` | string | - | Filtrar por presencia web: `true` o `false` |
| `hasInstagram` | string | - | Filtrar por Instagram: `true` o `false` |
| `city` | string | - | Filtrar por ciudad (busqueda parcial) |
| `category` | string | - | Filtrar por categoria (busqueda parcial) |
| `search` | string | - | Busqueda en nombre, direccion y notas |

### Ejemplo Request

```
GET /api/leads?page=1&limit=10&city=Cali&status=NEW&minScore=50&hasWebsite=false
```

### Response 200

```json
{
  "leads": [
    {
      "id": "cm3xyz789ghi012",
      "businessName": "Restaurante El Buen Sabor",
      "city": "Cali",
      "category": "Restaurantes",
      "address": "Calle 15 #23-45, Cali",
      "phone": "573001234567",
      "websiteUrl": null,
      "instagramUrl": "https://www.instagram.com/elbuensabor",
      "hasWebsite": false,
      "hasInstagram": true,
      "opportunityScore": 75,
      "status": "NEW",
      "notes": null,
      "createdAt": "2026-02-10T15:35:00.000Z",
      "updatedAt": "2026-02-10T15:35:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 45,
    "totalPages": 5
  },
  "filters": {
    "cities": ["Cali", "Medellin", "Bogota"],
    "categories": ["Restaurantes", "Cafeterias", "Dentistas"]
  }
}
```

### Notas sobre el campo `phone`

- Solo contiene digitos (sin espacios, guiones ni parentesis)
- Para Colombia, el formato es `57XXXXXXXXXX` (codigo de pais + numero)
- Puede ser `null` si no se encontro telefono

### Notas sobre `opportunityScore`

Score de 0 a 100 que indica la oportunidad de negocio:
- **80-100**: Sin web ni Instagram (maxima oportunidad)
- **60-79**: Solo tiene Instagram pero no web
- **40-59**: Tiene web basica pero sin Instagram
- **0-39**: Ya tiene presencia digital fuerte

---

## 5. Detalle de un Lead

```
GET /api/leads/:id
```

### URL Parameters

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | string | ID del lead |

### Ejemplo Request

```
GET /api/leads/cm3xyz789ghi012
```

### Response 200

```json
{
  "id": "cm3xyz789ghi012",
  "businessName": "Restaurante El Buen Sabor",
  "city": "Cali",
  "category": "Restaurantes",
  "address": "Calle 15 #23-45, Cali",
  "phone": "573001234567",
  "websiteUrl": null,
  "instagramUrl": "https://www.instagram.com/elbuensabor",
  "hasWebsite": false,
  "hasInstagram": true,
  "opportunityScore": 75,
  "status": "NEW",
  "notes": null,
  "createdAt": "2026-02-10T15:35:00.000Z",
  "updatedAt": "2026-02-10T15:35:00.000Z"
}
```

### Response 404

```json
{
  "error": "Lead not found"
}
```

---

## 6. Actualizar Lead

Actualiza el estado y/o notas de un lead.

```
PATCH /api/leads/:id
Content-Type: application/json
```

### URL Parameters

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | string | ID del lead |

### Request Body

| Campo | Tipo | Requerido | Validacion | Descripcion |
|-------|------|-----------|------------|-------------|
| `status` | string | No | Ver valores validos | Nuevo estado del lead |
| `notes` | string | No | Max 1000 caracteres | Notas sobre el lead |

### Valores validos de `status`

| Status | Descripcion |
|--------|-------------|
| `NEW` | Lead nuevo, sin contactar |
| `CONTACTED` | Se envio mensaje al negocio |
| `REPLIED` | El negocio respondio |
| `WON` | Se cerro la venta |
| `LOST` | No se logro la venta |
| `DISCARDED` | Lead descartado |

### Ejemplo Request - Actualizar estado

```json
{
  "status": "CONTACTED"
}
```

### Ejemplo Request - Actualizar notas

```json
{
  "notes": "Hablé con el dueño, interesado en página web"
}
```

### Ejemplo Request - Actualizar ambos

```json
{
  "status": "REPLIED",
  "notes": "Respondió por WhatsApp, quiere cotización"
}
```

### Response 200

```json
{
  "id": "cm3xyz789ghi012",
  "businessName": "Restaurante El Buen Sabor",
  "city": "Cali",
  "category": "Restaurantes",
  "address": "Calle 15 #23-45, Cali",
  "phone": "573001234567",
  "websiteUrl": null,
  "instagramUrl": "https://www.instagram.com/elbuensabor",
  "hasWebsite": false,
  "hasInstagram": true,
  "opportunityScore": 75,
  "status": "CONTACTED",
  "notes": "Hablé con el dueño, interesado en página web",
  "createdAt": "2026-02-10T15:35:00.000Z",
  "updatedAt": "2026-02-10T16:00:00.000Z"
}
```

### Response 404

```json
{
  "error": "Lead not found"
}
```

---

## 7. Eliminar Lead

```
DELETE /api/leads/:id
```

### URL Parameters

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | string | ID del lead |

### Ejemplo Request

```
DELETE /api/leads/cm3xyz789ghi012
```

### Response 200

```json
{
  "success": true
}
```

### Response 500

```json
{
  "error": "Failed to delete lead"
}
```

---

## 8. Exportar Leads a CSV

Genera y descarga un archivo CSV con los leads filtrados.

```
GET /api/export
```

### Query Parameters

Mismos filtros que `GET /api/leads` (sin paginacion):

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| `status` | string | Filtrar por estado |
| `minScore` | number | Score minimo |
| `hasWebsite` | string | `true` o `false` |
| `hasInstagram` | string | `true` o `false` |
| `city` | string | Filtrar por ciudad |
| `category` | string | Filtrar por categoria |

### Ejemplo Request

```
GET /api/export?city=Cali&status=NEW&minScore=50
```

### Response 200

```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename=leads-export-2026-02-10.csv
```

Columnas del CSV:

| Columna | Descripcion |
|---------|-------------|
| Nombre del Negocio | Nombre del negocio |
| Ciudad | Ciudad |
| Categoria | Categoria del negocio |
| Direccion | Direccion fisica |
| Telefono | Numero de telefono (solo digitos) |
| Sitio Web | URL del sitio web |
| Instagram | URL de Instagram |
| Tiene Web | "Si" o "No" |
| Tiene Instagram | "Si" o "No" |
| Score de Oportunidad | Numero 0-100 |
| Estado | "Nuevo", "Contactado", "Respondio", "Ganado", "Perdido", "Descartado" |
| Notas | Notas del lead |
| Fecha de Creacion | Fecha ISO 8601 |

---

## 9. Importar Leads desde CSV

Importa leads desde un archivo CSV. Los duplicados (mismo nombre de negocio + ciudad) se omiten.

```
POST /api/import
Content-Type: multipart/form-data
```

### Request Body (FormData)

| Campo | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `file` | File | Si | Archivo CSV |

### Columnas requeridas del CSV

| Columna | Requerida | Descripcion |
|---------|-----------|-------------|
| `businessName` | Si | Nombre del negocio |
| `city` | Si | Ciudad |
| `category` | Si | Categoria |

### Columnas opcionales del CSV

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| `address` | string | Direccion |
| `phone` | string | Telefono |
| `websiteUrl` | string | URL sitio web |
| `instagramUrl` | string | URL Instagram |
| `opportunityScore` | number | Score 0-100 (se calcula automaticamente si no se provee) |
| `status` | string | Estado del lead |
| `notes` | string | Notas |

### Ejemplo con curl

```bash
curl -X POST http://localhost:3000/api/import \
  -F "file=@leads.csv"
```

### Response 200

```json
{
  "success": true,
  "message": "Importado 45 leads, omitidos 3",
  "imported": 45,
  "skipped": 3,
  "errors": []
}
```

### Response 200 (con errores parciales)

```json
{
  "success": true,
  "message": "Importado 40 leads, omitidos 8",
  "imported": 40,
  "skipped": 8,
  "errors": [
    "Fila 5: Falta campo requerido 'businessName'",
    "Fila 12: Falta campo requerido 'city'"
  ]
}
```

### Response 400

```json
{
  "error": "No file provided"
}
```

---

## Ejemplo completo: Flujo de un bot

### Paso 1 - Iniciar scraping

```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"city": "Cali", "category": "Restaurantes", "limit": 30}'
```

Respuesta:
```json
{
  "success": true,
  "data": { "scrapeRunId": "cm3abc123" },
  "message": "Scraping iniciado en segundo plano"
}
```

### Paso 2 - Polling del estado (cada 3-5 segundos)

```bash
curl http://localhost:3000/api/scrape-runs/cm3abc123
```

Respuesta mientras esta en progreso:
```json
{
  "status": "RUNNING",
  "totalSaved": 12,
  ...
}
```

Respuesta cuando termina:
```json
{
  "status": "SUCCESS",
  "totalSaved": 23,
  ...
}
```

### Paso 3 - Obtener leads con alto score

```bash
curl "http://localhost:3000/api/leads?city=Cali&minScore=60&hasWebsite=false&limit=50"
```

### Paso 4 - Marcar lead como contactado

```bash
curl -X PATCH http://localhost:3000/api/leads/cm3xyz789 \
  -H "Content-Type: application/json" \
  -d '{"status": "CONTACTED", "notes": "Mensaje enviado por WhatsApp"}'
```

### Paso 5 - Exportar resultados

```bash
curl -o leads.csv "http://localhost:3000/api/export?city=Cali&status=CONTACTED"
```

---

## Categorias disponibles para scraping

Estas son las categorias sugeridas que funcionan con Google Maps en Colombia:

| Categoria |
|-----------|
| Abogados |
| Academias de ingles |
| Agencias de viajes |
| Aseguradoras |
| Barberias |
| Cafeterias |
| Centros de estetica |
| Clinicas dentales |
| Clinicas veterinarias |
| Colegios |
| Constructoras |
| Consultorios medicos |
| Contadores |
| Dentistas |
| Droguerias |
| Escuelas de conduccion |
| Ferreterias |
| Florerias |
| Fotografia |
| Gimnasios |
| Hoteles |
| Imprentas |
| Inmobiliarias |
| Joyerias |
| Lavanderias |
| Librerias |
| Notarias |
| Opticas |
| Panaderias |
| Papelerias |
| Pastelerias |
| Peluquerias |
| Pizzerias |
| Restaurantes |
| Salones de belleza |
| Servicios de catering |
| Spas |
| Supermercados |
| Talleres de motos |
| Talleres mecanicos |
| Tiendas de mascotas |
| Tiendas de ropa |
| Veterinarias |
| Zapaterias |

## Ciudades disponibles

Apartado, Armenia, Barrancabermeja, Barranquilla, Bello, Bogota, Bucaramanga, Buenaventura, Buga, Cali, Cartagena, Cartago, Chia, Cucuta, Dosquebradas, Duitama, Envigado, Facatativa, Florencia, Floridablanca, Fusagasuga, Girardot, Giron, Ibague, Ipiales, Itagui, Leticia, Lorica, Maicao, Magangue, Malambo, Manizales, Medellin, Mocoa, Monteria, Neiva, Ocana, Palmira, Pasto, Pereira, Piedecuesta, Pitalito, Popayan, Quibdo, Riohacha, Rionegro, Sabaneta, San Andres, Santa Marta, Sincelejo, Soacha, Sogamoso, Soledad, Tulua, Tumaco, Tunja, Turbo, Uribia, Valledupar, Villavicencio, Yopal, Zipaquira.

---

## Codigos de error HTTP

| Codigo | Descripcion |
|--------|-------------|
| 200 | Operacion exitosa |
| 400 | Parametros invalidos (validacion Zod) |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |
