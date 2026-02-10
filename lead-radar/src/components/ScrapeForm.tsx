'use client';

import { useState, useRef, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

interface ScrapeFormProps {
  onScrapeComplete: () => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

// Ciudades de Colombia en orden alfabético
const COLOMBIAN_CITIES = [
  'Apartadó',
  'Armenia',
  'Barrancabermeja',
  'Barranquilla',
  'Bello',
  'Bogotá',
  'Bucaramanga',
  'Buenaventura',
  'Buga',
  'Cali',
  'Cartagena',
  'Cartago',
  'Chía',
  'Cúcuta',
  'Dosquebradas',
  'Duitama',
  'Envigado',
  'Facatativá',
  'Florencia',
  'Floridablanca',
  'Fusagasugá',
  'Girardot',
  'Girón',
  'Ibagué',
  'Ipiales',
  'Itagüí',
  'Leticia',
  'Lorica',
  'Maicao',
  'Magangué',
  'Malambo',
  'Manizales',
  'Medellín',
  'Mocoa',
  'Montería',
  'Neiva',
  'Ocaña',
  'Palmira',
  'Pasto',
  'Pereira',
  'Piedecuesta',
  'Pitalito',
  'Popayán',
  'Quibdó',
  'Riohacha',
  'Rionegro',
  'Sabaneta',
  'San Andrés',
  'Santa Marta',
  'Sincelejo',
  'Soacha',
  'Sogamoso',
  'Soledad',
  'Tuluá',
  'Tumaco',
  'Tunja',
  'Turbo',
  'Uribia',
  'Valledupar',
  'Villavicencio',
  'Yopal',
  'Zipaquirá',
];

// Categorías sugeridas en orden alfabético
const SUGGESTED_CATEGORIES = [
  'Abogados',
  'Academias de inglés',
  'Agencias de viajes',
  'Aseguradoras',
  'Barberías',
  'Cafeterías',
  'Centros de estética',
  'Clínicas dentales',
  'Clínicas veterinarias',
  'Colegios',
  'Constructoras',
  'Consultorios médicos',
  'Contadores',
  'Dentistas',
  'Droguerías',
  'Escuelas de conducción',
  'Ferreterías',
  'Florerías',
  'Fotografía',
  'Gimnasios',
  'Hoteles',
  'Imprentas',
  'Inmobiliarias',
  'Joyerías',
  'Lavanderías',
  'Librerías',
  'Notarías',
  'Ópticas',
  'Panaderías',
  'Papelerías',
  'Pastelerías',
  'Peluquerías',
  'Pizzerías',
  'Restaurantes',
  'Salones de belleza',
  'Servicios de catering',
  'Spas',
  'Supermercados',
  'Talleres de motos',
  'Talleres mecánicos',
  'Tiendas de mascotas',
  'Tiendas de ropa',
  'Veterinarias',
  'Zapaterías',
];

export function ScrapeForm({ onScrapeComplete, onToast }: ScrapeFormProps) {
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const pollStatus = useCallback((scrapeRunId: string) => {
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/scrape-runs/${scrapeRunId}`);
        if (!res.ok) return;

        const data = await res.json();

        if (data.status === 'RUNNING') {
          setProgress(
            `Procesando... ${data.totalSaved} negocios guardados`
          );
          return;
        }

        // Finished (SUCCESS or FAILED)
        stopPolling();
        setIsLoading(false);
        setProgress('');

        if (data.status === 'SUCCESS') {
          onToast(
            `Scraping completado: ${data.totalSaved} negocios encontrados`,
            'success'
          );
          onScrapeComplete();
        } else {
          onToast(
            `Scraping falló con ${data.errorsCount} error(es)`,
            'error'
          );
        }
      } catch {
        // Network error during polling - keep trying
      }
    }, 3000);
  }, [onToast, onScrapeComplete, stopPolling]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!city || !category) {
      onToast('Por favor selecciona ciudad y categoría', 'error');
      return;
    }

    setIsLoading(true);
    setProgress('Iniciando scraping...');

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, category, limit }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProgress('Scraping en progreso...');
        pollStatus(data.data.scrapeRunId);
      } else {
        onToast(data.error || 'Error al iniciar el scraping', 'error');
        setIsLoading(false);
        setProgress('');
      }
    } catch (error) {
      console.error('Scrape error:', error);
      onToast('Error de conexión. Verifica que el servidor esté corriendo.', 'error');
      setIsLoading(false);
      setProgress('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Buscar Negocios
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Ciudad
            </label>
            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors bg-white"
              disabled={isLoading}
            >
              <option value="">Selecciona una ciudad</option>
              {COLOMBIAN_CITIES.map((cityName) => (
                <option key={cityName} value={cityName}>
                  {cityName}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Categoría
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors bg-white"
              disabled={isLoading}
            >
              <option value="">Todas las categorías</option>
              {SUGGESTED_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Limit */}
          <div>
            <label
              htmlFor="limit"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Límite de resultados
            </label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors bg-white"
              disabled={isLoading}
            >
              <option value={10}>10 negocios</option>
              <option value={20}>20 negocios</option>
              <option value={30}>30 negocios</option>
              <option value={50}>50 negocios</option>
              <option value={100}>100 negocios</option>
            </select>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !city || !category}
            className={clsx(
              'inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors',
              isLoading || !city || !category
                ? 'bg-gray-400 cursor-not-allowed text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Ejecutar Scraping
              </>
            )}
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              {progress || 'El scraping está en progreso...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
