'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, Loader2, XCircle } from 'lucide-react';
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
  const activeScrapeRunId = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Cleanup polling on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

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

  const handleCancel = async () => {
    const scrapeRunId = activeScrapeRunId.current;
    if (!scrapeRunId) return;

    try {
      await fetch(`/api/scrape-runs/${scrapeRunId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      stopPolling();
      setIsLoading(false);
      setProgress('');
      activeScrapeRunId.current = null;
      onToast('Scraping cancelado', 'info');
      onScrapeComplete();
    } catch {
      onToast('Error al cancelar el scraping', 'error');
    }
  };

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
        activeScrapeRunId.current = data.data.scrapeRunId;
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
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
      {/* Header with gradient accent */}
      <div className="relative px-6 pt-6 pb-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 via-primary-400 to-primary-600 opacity-80" />
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary-50">
            <Search className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-dark-700">
              Buscar Negocios
            </h2>
            <p className="text-xs text-dark-300">Scraping de Google Maps en tiempo real</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* City */}
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-dark-500 mb-1.5"
            >
              Ciudad
            </label>
            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white text-dark-600"
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
              className="block text-sm font-medium text-dark-500 mb-1.5"
            >
              Categoría
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white text-dark-600"
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
              className="block text-sm font-medium text-dark-500 mb-1.5"
            >
              Límite de resultados
            </label>
            <select
              id="limit"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white text-dark-600"
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
              'btn-press inline-flex items-center gap-2 px-7 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-card hover:shadow-card-hover',
              isLoading || !city || !category
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white'
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
        <div className="mx-6 mb-6 animate-fade-in-up">
          <div className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border border-primary-100">
            {/* Progress bar */}
            <div className="h-1.5 bg-primary-100 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full progress-shine" style={{ width: '60%' }} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                <p className="text-sm font-medium text-dark-600">
                  {progress || 'El scraping está en progreso...'}
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="btn-press inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-all duration-200"
              >
                <XCircle className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
