'use client';

import { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '@/types';
import { LeadRow } from './LeadRow';
import { Loader2, Database, Trash2, CheckSquare, Square, RefreshCw } from 'lucide-react';

interface LeadTableProps {
  leads: Lead[];
  isLoading: boolean;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onNotesChange: (id: string, notes: string) => void;
  onCopyMessage: (lead: Lead) => void;
  onOpenWhatsApp: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkStatusChange: (ids: string[], status: LeadStatus) => void;
}

export function LeadTable({
  leads,
  isLoading,
  onStatusChange,
  onNotesChange,
  onCopyMessage,
  onOpenWhatsApp,
  onDelete,
  onBulkDelete,
  onBulkStatusChange,
}: LeadTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Clear selection when leads change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [leads]);

  const allSelected = leads.length > 0 && selectedIds.size === leads.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < leads.length;

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((lead) => lead.id)));
    }
  };

  const handleSelectOne = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedIds);
    if (selected) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    await onBulkDelete(Array.from(selectedIds));
    setSelectedIds(new Set());
    setShowBulkDeleteConfirm(false);
    setIsDeleting(false);
  };

  const handleBulkStatusChange = async (status: LeadStatus) => {
    setIsUpdatingStatus(true);
    await onBulkStatusChange(Array.from(selectedIds), status);
    setSelectedIds(new Set());
    setIsUpdatingStatus(false);
  };
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-pulse-soft">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          </div>
        </div>
        <p className="text-muted-200 font-medium">Cargando leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-surface-400 rounded-2xl border border-[#262626] shadow-card animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-surface-50 flex items-center justify-center mb-4">
          <Database className="w-8 h-8 text-muted-400" />
        </div>
        <h3 className="text-lg font-semibold text-muted-50 mb-1">
          No hay leads para mostrar
        </h3>
        <p className="text-muted-300 text-center max-w-md text-sm">
          Ejecuta un scraping para encontrar negocios o ajusta los filtros si ya
          tienes datos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Selection toolbar */}
      <div className="bg-surface-400 border border-[#262626] rounded-2xl p-3 flex items-center justify-between shadow-card">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-100 hover:bg-surface-50 rounded-xl transition-all duration-200"
          >
            {allSelected ? (
              <CheckSquare className="w-5 h-5 text-brand-400" />
            ) : someSelected ? (
              <div className="w-5 h-5 border-2 border-brand-400 rounded bg-brand-500/20 flex items-center justify-center">
                <div className="w-2 h-0.5 bg-brand-400" />
              </div>
            ) : (
              <Square className="w-5 h-5 text-muted-400" />
            )}
            <span className="font-medium">{allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}</span>
          </button>
          {selectedIds.size > 0 && (
            <span className="text-sm text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full font-medium animate-scale-in border border-brand-500/20">
              {selectedIds.size} seleccionado{selectedIds.size !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 animate-fade-in">
            <select
              onChange={(e) => {
                if (e.target.value) handleBulkStatusChange(e.target.value as LeadStatus);
                e.target.value = '';
              }}
              disabled={isUpdatingStatus}
              className="px-3 py-2 text-sm border border-[#333] rounded-xl bg-surface-300 hover:bg-surface-200 transition-all duration-200 text-muted-100"
              defaultValue=""
            >
              <option value="" disabled>
                {isUpdatingStatus ? 'Actualizando...' : 'Cambiar estado'}
              </option>
              <option value="NEW">Nuevo</option>
              <option value="CONTACTED">Contactado</option>
              <option value="REPLIED">Respondió</option>
              <option value="WON">Ganado</option>
              <option value="LOST">Perdido</option>
              <option value="DISCARDED">Descartado</option>
            </select>
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="btn-press flex items-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl transition-all duration-200 shadow-card font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar ({selectedIds.size})
            </button>
          </div>
        )}
      </div>

      {/* Bulk delete confirmation modal */}
      {showBulkDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 modal-overlay"
          onClick={() => !isDeleting && setShowBulkDeleteConfirm(false)}
        >
          <div className="bg-surface-400 rounded-2xl p-6 max-w-md mx-4 shadow-2xl modal-content border border-[#333]" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Eliminar {selectedIds.size} lead{selectedIds.size !== 1 ? 's' : ''}
            </h3>
            <p className="text-muted-200 mb-6 text-sm">
              ¿Estás seguro de que quieres eliminar <strong className="text-white">{selectedIds.size}</strong> lead{selectedIds.size !== 1 ? 's' : ''}? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 text-muted-100 bg-surface-200 hover:bg-surface-50 rounded-xl transition-all duration-200 font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="btn-press px-5 py-2.5 text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium text-sm shadow-card"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead rows */}
      {leads.map((lead, index) => (
        <div
          key={lead.id}
          className="animate-fade-in-up"
          style={{ animationDelay: `${Math.min(index * 0.03, 0.3)}s`, opacity: 0 }}
        >
          <LeadRow
            lead={lead}
            isSelected={selectedIds.has(lead.id)}
            onSelect={handleSelectOne}
            onStatusChange={onStatusChange}
            onNotesChange={onNotesChange}
            onCopyMessage={onCopyMessage}
            onOpenWhatsApp={onOpenWhatsApp}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}
