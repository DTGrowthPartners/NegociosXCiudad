'use client';

import { useState } from 'react';
import {
  Globe,
  Instagram,
  Phone,
  MapPin,
  Copy,
  MessageCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Edit2,
  Save,
  Trash2,
  CheckSquare,
  Square,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Lead, LeadStatus } from '@/types';
import { getScoreLabel } from '@/lib/scoring';

interface LeadRowProps {
  lead: Lead;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onNotesChange: (id: string, notes: string) => void;
  onCopyMessage: (lead: Lead) => void;
  onOpenWhatsApp: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; color: string; bgColor: string }
> = {
  NEW: { label: 'Nuevo', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  CONTACTED: {
    label: 'Contactado',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  REPLIED: {
    label: 'Respondió',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
  },
  WON: { label: 'Ganado', color: 'text-green-700', bgColor: 'bg-green-100' },
  LOST: { label: 'Perdido', color: 'text-red-700', bgColor: 'bg-red-100' },
  DISCARDED: {
    label: 'Descartado',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
};

export function LeadRow({
  lead,
  isSelected,
  onSelect,
  onStatusChange,
  onNotesChange,
  onCopyMessage,
  onOpenWhatsApp,
  onDelete,
}: LeadRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(lead.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const scoreInfo = getScoreLabel(lead.opportunityScore);
  const statusConfig = STATUS_CONFIG[lead.status as LeadStatus];

  const handleStatusChange = async (newStatus: LeadStatus) => {
    setIsUpdating(true);
    await onStatusChange(lead.id, newStatus);
    setIsUpdating(false);
  };

  const handleSaveNotes = async () => {
    setIsUpdating(true);
    await onNotesChange(lead.id, notes);
    setIsEditingNotes(false);
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    setIsUpdating(true);
    await onDelete(lead.id);
    setIsUpdating(false);
    setShowDeleteConfirm(false);
  };

  return (
    <div className={clsx(
      "bg-white border rounded-lg mb-2 overflow-hidden hover:shadow-md transition-shadow",
      isSelected ? "border-primary-500 bg-primary-50" : "border-gray-200"
    )}>
      {/* Main row */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={() => onSelect(lead.id, !isSelected)}
            className="flex-shrink-0 mt-1"
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-primary-600" />
            ) : (
              <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>

          {/* Score badge */}
          <div className="flex-shrink-0">
            <div
              className={clsx(
                'w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg',
                scoreInfo.color.replace('text-', 'bg-').replace('600', '100'),
                scoreInfo.color
              )}
            >
              {lead.opportunityScore}
            </div>
          </div>

          {/* Main info */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {lead.businessName}
              </h3>
              <span
                className={clsx(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  statusConfig.bgColor,
                  statusConfig.color
                )}
              >
                {statusConfig.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {lead.city}
              </span>
              <span className="text-gray-400">•</span>
              <span>{lead.category}</span>
            </div>

            {/* Quick indicators */}
            <div className="flex items-center gap-3 mt-2">
              <span
                className={clsx(
                  'flex items-center gap-1 text-xs px-2 py-1 rounded',
                  lead.hasWebsite
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                )}
              >
                <Globe className="w-3 h-3" />
                {lead.hasWebsite ? 'Con web' : 'Sin web'}
              </span>
              <span
                className={clsx(
                  'flex items-center gap-1 text-xs px-2 py-1 rounded',
                  lead.hasInstagram
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                )}
              >
                <Instagram className="w-3 h-3" />
                {lead.hasInstagram ? 'Con IG' : 'Sin IG'}
              </span>
              {lead.phone ? (
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-green-50 text-green-700">
                  <Phone className="w-3 h-3" />
                  {lead.phone}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-gray-50 text-gray-500">
                  <Phone className="w-3 h-3" />
                  Sin teléfono
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={() => onCopyMessage(lead)}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Copiar mensaje"
            >
              <Copy className="w-5 h-5" />
            </button>

            <button
              onClick={() => onOpenWhatsApp(lead)}
              disabled={!lead.phone}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                lead.phone
                  ? 'text-green-600 hover:bg-green-50'
                  : 'text-gray-300 cursor-not-allowed'
              )}
              title={lead.phone ? 'Abrir WhatsApp' : 'Sin teléfono'}
            >
              <MessageCircle className="w-5 h-5" />
            </button>

            {lead.websiteUrl && (
              <a
                href={lead.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Abrir website"
              >
                <Globe className="w-5 h-5" />
              </a>
            )}

            {lead.instagramUrl && (
              <a
                href={lead.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                title="Abrir Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar lead"
            >
              <Trash2 className="w-5 h-5" />
            </button>

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

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Eliminar lead
            </h3>
            <p className="text-gray-600 mb-4">
              ¿Estás seguro de que quieres eliminar <strong>{lead.businessName}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isUpdating}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isUpdating}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
              >
                {isUpdating ? (
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

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left column - Details */}
            <div className="space-y-3">
              {lead.address && (
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Dirección
                  </span>
                  <p className="text-sm text-gray-700">{lead.address}</p>
                </div>
              )}

              {lead.websiteUrl && (
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Website
                  </span>
                  <a
                    href={lead.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                  >
                    {lead.websiteUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {lead.instagramUrl && (
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Instagram
                  </span>
                  <a
                    href={lead.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-pink-600 hover:underline flex items-center gap-1"
                  >
                    {lead.instagramUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div>
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Score de oportunidad
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-grow bg-gray-200 rounded-full h-2">
                    <div
                      className={clsx(
                        'h-2 rounded-full',
                        lead.opportunityScore >= 70
                          ? 'bg-green-500'
                          : lead.opportunityScore >= 40
                          ? 'bg-yellow-500'
                          : 'bg-gray-400'
                      )}
                      style={{ width: `${lead.opportunityScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {lead.opportunityScore}/100
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {scoreInfo.description}
                </p>
              </div>
            </div>

            {/* Right column - Status & Notes */}
            <div className="space-y-3">
              {/* Status selector */}
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase mb-2 block">
                  Cambiar estado
                </span>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status as LeadStatus)}
                      disabled={isUpdating || lead.status === status}
                      className={clsx(
                        'px-2 py-1 text-xs rounded-lg transition-colors',
                        lead.status === status
                          ? `${config.bgColor} ${config.color} font-medium`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Notas
                  </span>
                  {!isEditingNotes && (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Editar
                    </button>
                  )}
                </div>

                {isEditingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                      rows={3}
                      placeholder="Agregar notas sobre este lead..."
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setNotes(lead.notes || '');
                          setIsEditingNotes(false);
                        }}
                        className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        disabled={isUpdating}
                        className="px-3 py-1 text-sm bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Save className="w-4 h-4" />
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    {lead.notes || (
                      <span className="text-gray-400 italic">Sin notas</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
