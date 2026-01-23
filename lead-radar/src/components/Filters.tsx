'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';

interface FiltersProps {
  filters: {
    status: string;
    minScore: string;
    hasWebsite: string;
    hasInstagram: string;
    city: string;
    category: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
  availableCities: string[];
  availableCategories: string[];
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Todos los estados' },
  { value: 'NEW', label: 'Nuevo' },
  { value: 'CONTACTED', label: 'Contactado' },
  { value: 'REPLIED', label: 'Respondió' },
  { value: 'WON', label: 'Ganado' },
  { value: 'LOST', label: 'Perdido' },
  { value: 'DISCARDED', label: 'Descartado' },
];

const WEBSITE_OPTIONS = [
  { value: 'ALL', label: 'Todas' },
  { value: 'false', label: 'Sin web' },
  { value: 'true', label: 'Con web' },
];

const INSTAGRAM_OPTIONS = [
  { value: 'ALL', label: 'Todas' },
  { value: 'false', label: 'Sin IG' },
  { value: 'true', label: 'Con IG' },
];

const SCORE_OPTIONS = [
  { value: '', label: 'Cualquier score' },
  { value: '70', label: 'Alta (≥70)' },
  { value: '40', label: 'Media+ (≥40)' },
  { value: '0', label: 'Cualquiera (≥0)' },
];

export function Filters({
  filters,
  onFiltersChange,
  availableCities,
  availableCategories,
}: FiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'ALL',
      minScore: '',
      hasWebsite: 'ALL',
      hasInstagram: 'ALL',
      city: '',
      category: '',
      search: '',
    });
  };

  const hasActiveFilters =
    filters.status !== 'ALL' ||
    filters.minScore !== '' ||
    filters.hasWebsite !== 'ALL' ||
    filters.hasInstagram !== 'ALL' ||
    filters.city !== '' ||
    filters.category !== '' ||
    filters.search !== '';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filtros</span>
          {hasActiveFilters && (
            <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
              Activos
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Search - always visible */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre, dirección o notas..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-sm"
        />
      </div>

      {/* Expandable filters */}
      <div
        className={clsx(
          'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 transition-all duration-300',
          isExpanded ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'
        )}
      >
        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Estado
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Min Score */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Score mínimo
          </label>
          <select
            value={filters.minScore}
            onChange={(e) => handleChange('minScore', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            {SCORE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Has Website */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Website
          </label>
          <select
            value={filters.hasWebsite}
            onChange={(e) => handleChange('hasWebsite', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            {WEBSITE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Has Instagram */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Instagram
          </label>
          <select
            value={filters.hasInstagram}
            onChange={(e) => handleChange('hasInstagram', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            {INSTAGRAM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Ciudad
          </label>
          <select
            value={filters.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="">Todas</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Categoría
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="">Todas</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
