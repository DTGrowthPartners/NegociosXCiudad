'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw, Upload } from 'lucide-react';
import {
  ScrapeForm,
  Filters,
  LeadTable,
  Pagination,
  Stats,
  ToastContainer,
  useToast,
} from '@/components';
import { Lead, LeadStatus } from '@/types';
import { generateOutreachMessage } from '@/lib/messages';

interface LeadsResponse {
  leads: Lead[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  filters: {
    cities: string[];
    categories: string[];
  };
  stats: {
    total: number;
    highOpportunity: number;
    contacted: number;
    won: number;
  };
}

export default function DashboardPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 20;
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, highOpportunity: 0, contacted: 0, won: 0 });
  const [filters, setFilters] = useState({
    status: 'ALL',
    minScore: '',
    hasWebsite: 'ALL',
    hasInstagram: 'ALL',
    city: '',
    category: '',
    search: '',
  });

  // Use ref to track if initial load has happened
  const initialLoadDone = useRef(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch leads function
  const fetchLeads = async (currentPage: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', limit.toString());

      if (filters.status !== 'ALL') params.set('status', filters.status);
      if (filters.minScore) params.set('minScore', filters.minScore);
      if (filters.hasWebsite !== 'ALL')
        params.set('hasWebsite', filters.hasWebsite);
      if (filters.hasInstagram !== 'ALL')
        params.set('hasInstagram', filters.hasInstagram);
      if (filters.city) params.set('city', filters.city);
      if (filters.category) params.set('category', filters.category);
      if (filters.search) params.set('search', filters.search);

      const response = await fetch(`/api/leads?${params.toString()}`);
      const data: LeadsResponse = await response.json();

      setLeads(data.leads);
      setTotalCount(data.pagination.totalCount);
      setTotalPages(data.pagination.totalPages);
      setAvailableCities(data.filters.cities);
      setAvailableCategories(data.filters.categories);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching leads:', error);
      addToast('Error al cargar leads', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchLeads(1);
    }
  }, []);

  // Handle filter changes - reset to page 1
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Fetch when filters, page, or refreshKey change (but not on initial load)
  useEffect(() => {
    if (initialLoadDone.current) {
      fetchLeads(page);
    }
  }, [filters, page, refreshKey]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle status change
  const handleStatusChange = async (id: string, status: LeadStatus) => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setLeads((prev) =>
          prev.map((lead) => (lead.id === id ? { ...lead, status } : lead))
        );
        addToast('Estado actualizado', 'success');
      } else {
        addToast('Error al actualizar estado', 'error');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      addToast('Error al actualizar estado', 'error');
    }
  };

  // Handle notes change
  const handleNotesChange = async (id: string, notes: string) => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (response.ok) {
        setLeads((prev) =>
          prev.map((lead) => (lead.id === id ? { ...lead, notes } : lead))
        );
        addToast('Notas guardadas', 'success');
      } else {
        addToast('Error al guardar notas', 'error');
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      addToast('Error al guardar notas', 'error');
    }
  };

  // Copy message to clipboard
  const handleCopyMessage = (lead: Lead) => {
    const { message } = generateOutreachMessage(lead);
    navigator.clipboard.writeText(message).then(() => {
      addToast('Mensaje copiado al portapapeles', 'success');
    });
  };

  // Open WhatsApp
  const handleOpenWhatsApp = (lead: Lead) => {
    const { whatsappUrl } = generateOutreachMessage(lead);
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
    } else {
      addToast('Este lead no tiene teléfono', 'error');
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'ALL') params.set('status', filters.status);
      if (filters.minScore) params.set('minScore', filters.minScore);
      if (filters.hasWebsite !== 'ALL')
        params.set('hasWebsite', filters.hasWebsite);
      if (filters.hasInstagram !== 'ALL')
        params.set('hasInstagram', filters.hasInstagram);
      if (filters.city) params.set('city', filters.city);
      if (filters.category) params.set('category', filters.category);

      const response = await fetch(`/api/export?${params.toString()}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        addToast('CSV exportado correctamente', 'success');
      } else {
        addToast('Error al exportar CSV', 'error');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      addToast('Error al exportar CSV', 'error');
    }
  };

  // Import CSV
  const handleImportCSV = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        addToast(result.message, 'success');
        // Refresh leads
        fetchLeads(1);
      } else {
        addToast(result.error || 'Error al importar CSV', 'error');
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      addToast('Error al importar CSV', 'error');
    }
  };

  // Handle delete lead
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
        setTotalCount((prev) => prev - 1);
        addToast('Lead eliminado', 'success');
      } else {
        addToast('Error al eliminar lead', 'error');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      addToast('Error al eliminar lead', 'error');
    }
  };

  // Handle bulk delete leads
  const handleBulkDelete = async (ids: string[]) => {
    let deletedCount = 0;
    let errorCount = 0;

    for (const id of ids) {
      try {
        const response = await fetch(`/api/leads/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          deletedCount++;
        } else {
          errorCount++;
        }
      } catch {
        errorCount++;
      }
    }

    // Update local state
    setLeads((prev) => prev.filter((lead) => !ids.includes(lead.id)));
    setTotalCount((prev) => prev - deletedCount);

    if (errorCount === 0) {
      addToast(`${deletedCount} leads eliminados`, 'success');
    } else {
      addToast(`${deletedCount} eliminados, ${errorCount} errores`, 'error');
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = async (ids: string[], status: LeadStatus) => {
    let updatedCount = 0;
    let errorCount = 0;

    for (const id of ids) {
      try {
        const response = await fetch(`/api/leads/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });

        if (response.ok) {
          updatedCount++;
        } else {
          errorCount++;
        }
      } catch {
        errorCount++;
      }
    }

    // Update local state
    setLeads((prev) =>
      prev.map((lead) => (ids.includes(lead.id) ? { ...lead, status } : lead))
    );

    if (errorCount === 0) {
      addToast(`${updatedCount} leads actualizados a ${status}`, 'success');
    } else {
      addToast(`${updatedCount} actualizados, ${errorCount} errores`, 'error');
    }
  };

  // Handle scrape complete - use state setters (stable refs) to avoid stale closures
  const handleScrapeComplete = () => {
    setPage(1);
    setRefreshKey((prev) => prev + 1);
  };

  // Manual refresh
  const handleRefresh = () => {
    fetchLeads(page);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-down">
        <div>
          <h1 className="text-3xl font-bold gradient-text tracking-tight">Dashboard</h1>
          <p className="text-dark-400 mt-1">
            Encuentra negocios sin presencia web y genera oportunidades
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="btn-press inline-flex items-center gap-2 px-4 py-2.5 text-dark-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-card hover:shadow-card-hover"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
          <button
            onClick={handleExportCSV}
            disabled={totalCount === 0}
            className="btn-press inline-flex items-center gap-2 px-4 py-2.5 text-white bg-gradient-to-r from-green-600 to-green-500 rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-200 shadow-card hover:shadow-card-hover disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <label className="btn-press inline-flex items-center gap-2 px-4 py-2.5 text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all duration-200 cursor-pointer shadow-card hover:shadow-card-hover">
            <Upload className="w-4 h-4" />
            Importar CSV
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImportCSV(file);
                }
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Scrape form */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.05s', opacity: 0 }}>
        <ScrapeForm
          onScrapeComplete={handleScrapeComplete}
          onToast={addToast}
        />
      </div>

      {/* Stats */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
        <Stats stats={stats} />
      </div>

      {/* Filters */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.15s', opacity: 0 }}>
        <Filters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableCities={availableCities}
          availableCategories={availableCategories}
        />
      </div>

      {/* Leads table */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
        <LeadTable
          leads={leads}
          isLoading={isLoading}
          onStatusChange={handleStatusChange}
          onNotesChange={handleNotesChange}
          onCopyMessage={handleCopyMessage}
          onOpenWhatsApp={handleOpenWhatsApp}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onBulkStatusChange={handleBulkStatusChange}
        />
      </div>

      {/* Pagination */}
      {!isLoading && leads.length > 0 && (
        <div className="animate-fade-in">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            limit={limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
