'use client';

import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Search as SearchIcon } from 'lucide-react';
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

const selectClasses = 'w-full px-2.5 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 bg-gray-50/50 hover:bg-white text-dark-600';

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

  const activeFilterCount = [
    filters.status !== 'ALL',
    filters.minScore !== '',
    filters.hasWebsite !== 'ALL',
    filters.hasInstagram !== 'ALL',
    filters.city !== '',
    filters.category !== '',
    filters.search !== '',
  ].filter(Boolean).length;

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2.5 text-dark-500 hover:text-dark-700 transition-colors duration-200"
        >
          <div className="p-1.5 rounded-lg bg-gray-100">
            <Filter className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm">Filtros</span>
          {hasActiveFilters && (
            <span className="bg-primary-600 text-white text-[10px] w-5 h-5 rounded-full font-bold flex items-center justify-center animate-scale-in">
              {activeFilterCount}
            </span>
          )}
          <div className={clsx(
            'transition-transform duration-300',
            isExpanded ? 'rotate-180' : 'rotate-0'
          )}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs font-medium text-dark-300 hover:text-red-500 transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <X className="w-3.5 h-3.5" />
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Search - always visible */}
      <div className="mb-4 relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
        <input
          type="text"
          placeholder="Buscar por nombre, dirección o notas..."
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all duration-200 text-sm bg-gray-50/50 hover:bg-white placeholder:text-dark-200"
        />
      </div>

      {/* Expandable filters */}
      <div
        className={clsx(
          'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 transition-all duration-400 ease-in-out',
          isExpanded ? 'opacity-100 max-h-96 mt-1' : 'opacity-0 max-h-0 overflow-hidden'
        )}
      >
        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-dark-400 mb-1.5">
            Estado
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className={selectClasses}
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
          <label className="block text-xs font-semibold text-dark-400 mb-1.5">
            Score mínimo
          </label>
          <select
            value={filters.minScore}
            onChange={(e) => handleChange('minScore', e.target.value)}
            className={selectClasses}
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
          <label className="block text-xs font-semibold text-dark-400 mb-1.5">
            Website
          </label>
          <select
            value={filters.hasWebsite}
            onChange={(e) => handleChange('hasWebsite', e.target.value)}
            className={selectClasses}
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
          <label className="block text-xs font-semibold text-dark-400 mb-1.5">
            Instagram
          </label>
          <select
            value={filters.hasInstagram}
            onChange={(e) => handleChange('hasInstagram', e.target.value)}
            className={selectClasses}
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
          <label className="block text-xs font-semibold text-dark-400 mb-1.5">
            Ciudad
          </label>
          <select
            value={filters.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={selectClasses}
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
          <label className="block text-xs font-semibold text-dark-400 mb-1.5">
            Categoría
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className={selectClasses}
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
