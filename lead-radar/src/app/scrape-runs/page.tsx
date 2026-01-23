'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { clsx } from 'clsx';

interface ScrapeRunError {
  business?: string;
  error: string;
  timestamp?: string;
}

interface ScrapeRun {
  id: string;
  city: string;
  category: string;
  startedAt: string;
  finishedAt: string | null;
  status: 'RUNNING' | 'SUCCESS' | 'FAILED';
  totalFound: number;
  totalSaved: number;
  errorsCount: number;
  errors: ScrapeRunError[];
  leadsCount: number;
}

interface ScrapeRunsResponse {
  scrapeRuns: ScrapeRun[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(startedAt: string, finishedAt: string | null): string {
  if (!finishedAt) return 'En progreso...';

  const start = new Date(startedAt).getTime();
  const end = new Date(finishedAt).getTime();
  const diffMs = end - start;

  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function ScrapeRunCard({ run }: { run: ScrapeRun }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = {
    RUNNING: {
      icon: Loader2,
      label: 'En progreso',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      iconClass: 'animate-spin',
    },
    SUCCESS: {
      icon: CheckCircle,
      label: 'Completado',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      iconClass: '',
    },
    FAILED: {
      icon: XCircle,
      label: 'Fallido',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      iconClass: '',
    },
  };

  const config = statusConfig[run.status];
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Main row */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Status icon */}
            <div className={clsx('p-2 rounded-lg', config.bgColor)}>
              <Icon className={clsx('w-5 h-5', config.color, config.iconClass)} />
            </div>

            {/* Info */}
            <div>
              <h3 className="font-medium text-gray-900">
                {run.category} en {run.city}
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(run.startedAt)}
                </span>
                <span className="text-gray-300">|</span>
                <span>Duración: {formatDuration(run.startedAt, run.finishedAt)}</span>
              </div>
            </div>
          </div>

          {/* Stats & actions */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                {run.totalSaved}
              </p>
              <p className="text-xs text-gray-500">guardados</p>
            </div>

            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                {run.totalFound}
              </p>
              <p className="text-xs text-gray-500">encontrados</p>
            </div>

            {run.errorsCount > 0 && (
              <div className="text-right">
                <p className="text-lg font-semibold text-red-600">
                  {run.errorsCount}
                </p>
                <p className="text-xs text-gray-500">errores</p>
              </div>
            )}

            <span
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-medium',
                config.bgColor,
                config.color
              )}
            >
              {config.label}
            </span>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Details */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Detalles</h4>
              <div className="bg-white rounded-lg p-3 text-sm space-y-1">
                <p>
                  <span className="text-gray-500">ID:</span>{' '}
                  <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                    {run.id}
                  </code>
                </p>
                <p>
                  <span className="text-gray-500">Inicio:</span>{' '}
                  {formatDate(run.startedAt)}
                </p>
                {run.finishedAt && (
                  <p>
                    <span className="text-gray-500">Fin:</span>{' '}
                    {formatDate(run.finishedAt)}
                  </p>
                )}
                <p>
                  <span className="text-gray-500">Leads vinculados:</span>{' '}
                  {run.leadsCount}
                </p>
              </div>
            </div>

            {/* Errors */}
            {run.errors && run.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Errores ({run.errors.length})
                </h4>
                <div className="bg-white rounded-lg p-3 max-h-40 overflow-y-auto">
                  <ul className="space-y-2 text-sm">
                    {run.errors.map((error, index) => (
                      <li
                        key={index}
                        className="border-l-2 border-red-300 pl-2 py-1"
                      >
                        {error.business && (
                          <span className="font-medium text-gray-700">
                            {error.business}:{' '}
                          </span>
                        )}
                        <span className="text-gray-600">{error.error}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScrapeRunsPage() {
  const [scrapeRuns, setScrapeRuns] = useState<ScrapeRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
  });

  const fetchScrapeRuns = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pagination.page.toString());
      params.set('limit', pagination.limit.toString());

      const response = await fetch(`/api/scrape-runs?${params.toString()}`);
      const data: ScrapeRunsResponse = await response.json();

      setScrapeRuns(data.scrapeRuns);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching scrape runs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScrapeRuns();
  }, [pagination.page]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Historial de Scraping
          </h1>
          <p className="text-gray-500">
            Revisa las ejecuciones anteriores y sus resultados
          </p>
        </div>

        <button
          onClick={fetchScrapeRuns}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-500">Cargando historial...</p>
        </div>
      ) : scrapeRuns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
          <Clock className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            No hay ejecuciones registradas
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            Cuando ejecutes un scraping desde el dashboard, aparecerá aquí el
            historial.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {scrapeRuns.map((run) => (
            <ScrapeRunCard key={run.id} run={run} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            disabled={pagination.page === 1}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-500">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
