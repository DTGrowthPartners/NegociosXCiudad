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
  X,
  Edit2,
  Save,
  Trash2,
  CheckSquare,
  Square,
  Loader2,
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
  NEW: { label: 'Nuevo', color: 'text-primary-700', bgColor: 'bg-primary-50' },
  CONTACTED: {
    label: 'Contactado',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
  },
  REPLIED: {
    label: 'Respondió',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
  },
  WON: { label: 'Ganado', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  LOST: { label: 'Perdido', color: 'text-red-700', bgColor: 'bg-red-50' },
  DISCARDED: {
    label: 'Descartado',
    color: 'text-dark-400',
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

  const scoreGradient = lead.opportunityScore >= 70
    ? 'from-emerald-500 to-green-400'
    : lead.opportunityScore >= 40
    ? 'from-amber-500 to-yellow-400'
    : 'from-gray-400 to-gray-300';

  return (
    <div className={clsx(
      "bg-white border rounded-2xl overflow-hidden transition-all duration-200",
      isSelected
        ? "border-primary-400 ring-2 ring-primary-100 shadow-glow-blue"
        : "border-gray-100 shadow-card hover:shadow-card-hover hover:border-gray-200"
    )}>
      {/* Main row */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={() => onSelect(lead.id, !isSelected)}
            className="flex-shrink-0 mt-1 transition-transform duration-200 hover:scale-110"
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-primary-600" />
            ) : (
              <Square className="w-5 h-5 text-dark-200 hover:text-dark-400" />
            )}
          </button>

          {/* Score badge */}
          <div className="flex-shrink-0">
            <div
              className={clsx(
                'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg bg-gradient-to-br text-white shadow-sm',
                scoreGradient
              )}
            >
              {lead.opportunityScore}
            </div>
          </div>

          {/* Main info */}
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-dark-700 truncate">
                {lead.businessName}
              </h3>
              <span
                className={clsx(
                  'px-2.5 py-0.5 rounded-lg text-[11px] font-semibold tracking-wide',
                  statusConfig.bgColor,
                  statusConfig.color
                )}
              >
                {statusConfig.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-dark-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {lead.city}
              </span>
              <span className="text-dark-200">·</span>
              <span className="text-dark-300">{lead.category}</span>
            </div>

            {/* Quick indicators */}
            <div className="flex items-center gap-2 mt-2.5">
              <span
                className={clsx(
                  'flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg',
                  lead.hasWebsite
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600'
                )}
              >
                <Globe className="w-3 h-3" />
                {lead.hasWebsite ? 'Con web' : 'Sin web'}
              </span>
              <span
                className={clsx(
                  'flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg',
                  lead.hasInstagram
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600'
                )}
              >
                <Instagram className="w-3 h-3" />
                {lead.hasInstagram ? 'Con IG' : 'Sin IG'}
              </span>
              {lead.phone ? (
                <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700">
                  <Phone className="w-3 h-3" />
                  {lead.phone}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-gray-50 text-dark-300">
                  <Phone className="w-3 h-3" />
                  Sin teléfono
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-1">
            <button
              onClick={() => onCopyMessage(lead)}
              className="p-2 text-dark-300 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
              title="Copiar mensaje"
            >
              <Copy className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={() => onOpenWhatsApp(lead)}
              disabled={!lead.phone}
              className={clsx(
                'p-2 rounded-xl transition-all duration-200',
                lead.phone
                  ? 'text-green-600 hover:bg-green-50 hover:scale-110'
                  : 'text-dark-200 cursor-not-allowed'
              )}
              title={lead.phone ? 'Abrir WhatsApp' : 'Sin teléfono'}
            >
              <MessageCircle className="w-4.5 h-4.5" />
            </button>

            {lead.websiteUrl && (
              <a
                href={lead.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-dark-300 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all duration-200"
                title="Abrir website"
              >
                <Globe className="w-4.5 h-4.5" />
              </a>
            )}

            {lead.instagramUrl && (
              <a
                href={lead.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-pink-500 hover:bg-pink-50 rounded-xl transition-all duration-200 hover:scale-110"
                title="Abrir Instagram"
              >
                <Instagram className="w-4.5 h-4.5" />
              </a>
            )}

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-dark-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
              title="Eliminar lead"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>

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

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 modal-overlay"
          onClick={() => !isUpdating && setShowDeleteConfirm(false)}
        >
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 shadow-2xl modal-content border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-dark-700 mb-2">
              Eliminar lead
            </h3>
            <p className="text-dark-400 mb-6 text-sm">
              ¿Estás seguro de que quieres eliminar <strong className="text-dark-600">{lead.businessName}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isUpdating}
                className="px-5 py-2.5 text-dark-500 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isUpdating}
                className="btn-press px-5 py-2.5 text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium text-sm shadow-card"
              >
                {isUpdating ? (
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

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-100 bg-gradient-to-b from-gray-50/80 to-white animate-fade-in-down">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Details */}
            <div className="space-y-4">
              {lead.address && (
                <div>
                  <span className="text-[11px] font-semibold text-dark-300 uppercase tracking-wider">
                    Dirección
                  </span>
                  <p className="text-sm text-dark-600 mt-0.5">{lead.address}</p>
                </div>
              )}

              {lead.websiteUrl && (
                <div>
                  <span className="text-[11px] font-semibold text-dark-300 uppercase tracking-wider">
                    Website
                  </span>
                  <a
                    href={lead.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    {lead.websiteUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {lead.instagramUrl && (
                <div>
                  <span className="text-[11px] font-semibold text-dark-300 uppercase tracking-wider">
                    Instagram
                  </span>
                  <a
                    href={lead.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-pink-600 hover:text-pink-700 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    {lead.instagramUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div>
                <span className="text-[11px] font-semibold text-dark-300 uppercase tracking-wider">
                  Score de oportunidad
                </span>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex-grow bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full bg-gradient-to-r transition-all duration-700',
                        scoreGradient
                      )}
                      style={{ width: `${lead.opportunityScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-dark-600 min-w-[50px] text-right">
                    {lead.opportunityScore}/100
                  </span>
                </div>
                <p className="text-xs text-dark-300 mt-1">
                  {scoreInfo.description}
                </p>
              </div>
            </div>

            {/* Right column - Status & Notes */}
            <div className="space-y-4">
              {/* Status selector */}
              <div>
                <span className="text-[11px] font-semibold text-dark-300 uppercase tracking-wider mb-2 block">
                  Cambiar estado
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status as LeadStatus)}
                      disabled={isUpdating || lead.status === status}
                      className={clsx(
                        'px-3 py-1.5 text-xs rounded-xl transition-all duration-200 font-medium',
                        lead.status === status
                          ? `${config.bgColor} ${config.color} ring-1 ring-current/20`
                          : 'bg-gray-50 text-dark-400 hover:bg-gray-100 hover:text-dark-600'
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
                  <span className="text-[11px] font-semibold text-dark-300 uppercase tracking-wider">
                    Notas
                  </span>
                  {!isEditingNotes && (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium px-2 py-1 rounded-lg hover:bg-primary-50 transition-all duration-200"
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
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none transition-all duration-200 bg-white"
                      rows={3}
                      placeholder="Agregar notas sobre este lead..."
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setNotes(lead.notes || '');
                          setIsEditingNotes(false);
                        }}
                        className="px-3 py-1.5 text-sm text-dark-400 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center gap-1 font-medium"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        disabled={isUpdating}
                        className="btn-press px-4 py-1.5 text-sm bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 rounded-xl transition-all duration-200 flex items-center gap-1 font-medium shadow-card"
                      >
                        <Save className="w-4 h-4" />
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-dark-500">
                    {lead.notes || (
                      <span className="text-dark-200 italic">Sin notas</span>
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
