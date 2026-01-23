'use client';

import { useState, useEffect, useRef } from 'react';
import { Download, RefreshCw } from 'lucide-react';
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

  // Fetch when filters or page change (but not on initial load)
  useEffect(() => {
    if (initialLoadDone.current) {
      fetchLeads(page);
    }
  }, [filters, page]);

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

  // Handle scrape complete
  const handleScrapeComplete = () => {
    fetchLeads(page);
  };

  // Manual refresh
  const handleRefresh = () => {
    fetchLeads(page);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">
            Encuentra negocios sin presencia web y genera oportunidades
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
          <button
            onClick={handleExportCSV}
            disabled={leads.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Scrape form */}
      <ScrapeForm
        onScrapeComplete={handleScrapeComplete}
        onToast={addToast}
      />

      {/* Stats */}
      <Stats leads={leads} totalCount={totalCount} />

      {/* Filters */}
      <Filters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableCities={availableCities}
        availableCategories={availableCategories}
      />

      {/* Leads table */}
      <LeadTable
        leads={leads}
        isLoading={isLoading}
        onStatusChange={handleStatusChange}
        onNotesChange={handleNotesChange}
        onCopyMessage={handleCopyMessage}
        onOpenWhatsApp={handleOpenWhatsApp}
        onDelete={handleDelete}
        onBulkDelete={handleBulkDelete}
      />

      {/* Pagination */}
      {!isLoading && leads.length > 0 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalCount={totalCount}
          limit={limit}
          onPageChange={handlePageChange}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
