'use client';

import { useState, useEffect } from 'react';
import { Lead, LeadStatus } from '@/types';
import { LeadRow } from './LeadRow';
import { Loader2, Database, Trash2, CheckSquare, Square } from 'lucide-react';

interface LeadTableProps {
  leads: Lead[];
  isLoading: boolean;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onNotesChange: (id: string, notes: string) => void;
  onCopyMessage: (lead: Lead) => void;
  onOpenWhatsApp: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
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
}: LeadTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-4" />
        <p className="text-gray-500">Cargando leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
        <Database className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No hay leads para mostrar
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          Ejecuta un scraping para encontrar negocios o ajusta los filtros si ya
          tienes datos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Selection toolbar */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {allSelected ? (
              <CheckSquare className="w-5 h-5 text-primary-600" />
            ) : someSelected ? (
              <div className="w-5 h-5 border-2 border-primary-600 rounded bg-primary-100 flex items-center justify-center">
                <div className="w-2 h-0.5 bg-primary-600" />
              </div>
            ) : (
              <Square className="w-5 h-5 text-gray-400" />
            )}
            {allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
          {selectedIds.size > 0 && (
            <span className="text-sm text-gray-500">
              {selectedIds.size} seleccionado{selectedIds.size !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {selectedIds.size > 0 && (
          <button
            onClick={() => setShowBulkDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar seleccionados ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Bulk delete confirmation modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Eliminar {selectedIds.size} lead{selectedIds.size !== 1 ? 's' : ''}
            </h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que quieres eliminar <strong>{selectedIds.size}</strong> lead{selectedIds.size !== 1 ? 's' : ''}? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              >
                {isDeleting ? (
                  'Eliminando...'
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
      {leads.map((lead) => (
        <LeadRow
          key={lead.id}
          lead={lead}
          isSelected={selectedIds.has(lead.id)}
          onSelect={handleSelectOne}
          onStatusChange={onStatusChange}
          onNotesChange={onNotesChange}
          onCopyMessage={onCopyMessage}
          onOpenWhatsApp={onOpenWhatsApp}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
