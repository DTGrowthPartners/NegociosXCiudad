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
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden card-hover">
      {/* Main row */}
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Status icon */}
            <div className={clsx('p-2.5 rounded-xl', config.bgColor)}>
              <Icon className={clsx('w-5 h-5', config.color, config.iconClass)} />
            </div>

            {/* Info */}
            <div>
              <h3 className="font-bold text-dark-700">
                {run.category} en {run.city}
              </h3>
              <div className="flex items-center gap-3 text-sm text-dark-300 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(run.startedAt)}
                </span>
                <span className="text-dark-200">·</span>
                <span>Duración: {formatDuration(run.startedAt, run.finishedAt)}</span>
              </div>
            </div>
          </div>

          {/* Stats & actions */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-lg font-bold text-dark-700">
                {run.totalSaved}
              </p>
              <p className="text-[11px] text-dark-300 font-medium">guardados</p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-dark-700">
                {run.totalFound}
              </p>
              <p className="text-[11px] text-dark-300 font-medium">encontrados</p>
            </div>

            {run.errorsCount > 0 && (
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">
                  {run.errorsCount}
                </p>
                <p className="text-[11px] text-dark-300 font-medium">errores</p>
              </div>
            )}

            <span
              className={clsx(
                'px-3 py-1.5 rounded-xl text-[11px] font-semibold',
                config.bgColor,
                config.color
              )}
            >
              {config.label}
            </span>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-dark-300 hover:text-dark-500 hover:bg-gray-50 rounded-xl transition-all duration-200"
            >
              <div className={clsx('transition-transform duration-300', isExpanded ? 'rotate-180' : 'rotate-0')}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-3 border-t border-gray-100 bg-gradient-to-b from-gray-50/80 to-white animate-fade-in-down">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Details */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold text-dark-300 uppercase tracking-wider">Detalles</h4>
              <div className="bg-white rounded-xl p-4 text-sm space-y-2 border border-gray-100">
                <p>
                  <span className="text-dark-300">ID:</span>{' '}
                  <code className="text-xs bg-gray-50 px-2 py-0.5 rounded-lg text-dark-500 font-mono">
                    {run.id}
                  </code>
                </p>
                <p>
                  <span className="text-dark-300">Inicio:</span>{' '}
                  <span className="text-dark-600">{formatDate(run.startedAt)}</span>
                </p>
                {run.finishedAt && (
                  <p>
                    <span className="text-dark-300">Fin:</span>{' '}
                    <span className="text-dark-600">{formatDate(run.finishedAt)}</span>
                  </p>
                )}
                <p>
                  <span className="text-dark-300">Leads vinculados:</span>{' '}
                  <span className="font-semibold text-dark-600">{run.leadsCount}</span>
                </p>
              </div>
            </div>

            {/* Errors */}
            {run.errors && run.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-semibold text-dark-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Errores ({run.errors.length})
                </h4>
                <div className="bg-white rounded-xl p-4 max-h-40 overflow-y-auto border border-gray-100">
                  <ul className="space-y-2 text-sm">
                    {run.errors.map((error, index) => (
                      <li
                        key={index}
                        className="border-l-2 border-red-300 pl-3 py-1"
                      >
                        {error.business && (
                          <span className="font-semibold text-dark-600">
                            {error.business}:{' '}
                          </span>
                        )}
                        <span className="text-dark-400">{error.error}</span>
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
      <div className="flex items-center justify-between animate-fade-in-down">
        <div>
          <h1 className="text-3xl font-bold gradient-text tracking-tight">
            Historial de Scraping
          </h1>
          <p className="text-dark-400 mt-1">
            Revisa las ejecuciones anteriores y sus resultados
          </p>
        </div>

        <button
          onClick={fetchScrapeRuns}
          className="btn-press inline-flex items-center gap-2 px-4 py-2.5 text-dark-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-card hover:shadow-card-hover"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 animate-pulse-soft">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
          <p className="text-dark-400 font-medium">Cargando historial...</p>
        </div>
      ) : scrapeRuns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100 shadow-card animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-dark-200" />
          </div>
          <h3 className="text-lg font-semibold text-dark-600 mb-1">
            No hay ejecuciones registradas
          </h3>
          <p className="text-dark-300 text-center max-w-md text-sm">
            Cuando ejecutes un scraping desde el dashboard, aparecerá aquí el
            historial.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {scrapeRuns.map((run, index) => (
            <div
              key={run.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s`, opacity: 0 }}
            >
              <ScrapeRunCard run={run} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-card border border-gray-100 animate-fade-in">
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            disabled={pagination.page === 1}
            className="px-4 py-2 text-sm font-medium text-dark-500 hover:bg-gray-50 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            Anterior
          </button>
          <span className="text-sm text-dark-400">
            Página <span className="font-semibold text-dark-600">{pagination.page}</span> de <span className="font-semibold text-dark-600">{pagination.totalPages}</span>
          </span>
          <button
            onClick={() =>
              setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 text-sm font-medium text-dark-500 hover:bg-gray-50 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
