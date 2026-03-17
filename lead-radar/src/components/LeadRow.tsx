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
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  NEW: { label: 'Nuevo', color: 'text-brand-400', bgColor: 'bg-brand-500/10', borderColor: 'border-brand-500/20' },
  CONTACTED: {
    label: 'Contactado',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  REPLIED: {
    label: 'Respondió',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
  },
  WON: { label: 'Ganado', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/20' },
  LOST: { label: 'Perdido', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
  DISCARDED: {
    label: 'Descartado',
    color: 'text-muted-400',
    bgColor: 'bg-muted-700',
    borderColor: 'border-muted-600',
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
    ? 'from-emerald-500 to-emerald-400'
    : lead.opportunityScore >= 40
    ? 'from-amber-500 to-amber-400'
    : 'from-muted-500 to-muted-400';

  return (
    <div className={clsx(
      "bg-surface-400 border rounded-2xl overflow-hidden transition-all duration-200",
      isSelected
        ? "border-brand-500/50 ring-2 ring-brand-500/20 shadow-glow"
        : "border-[#262626] shadow-card hover:shadow-card-hover hover:border-[#333]"
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
              <CheckSquare className="w-5 h-5 text-brand-400" />
            ) : (
              <Square className="w-5 h-5 text-muted-500 hover:text-muted-300" />
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
              <h3 className="font-bold text-white truncate">
                {lead.businessName}
              </h3>
              <span
                className={clsx(
                  'px-2.5 py-0.5 rounded-lg text-[11px] font-semibold tracking-wide border',
                  statusConfig.bgColor,
                  statusConfig.color,
                  statusConfig.borderColor
                )}
              >
                {statusConfig.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-200">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {lead.city}
              </span>
              <span className="text-muted-600">·</span>
              <span className="text-muted-300">{lead.category}</span>
            </div>

            {/* Quick indicators */}
            <div className="flex items-center gap-2 mt-2.5">
              <span
                className={clsx(
                  'flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border',
                  lead.hasWebsite
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                )}
              >
                <Globe className="w-3 h-3" />
                {lead.hasWebsite ? 'Con web' : 'Sin web'}
              </span>
              <span
                className={clsx(
                  'flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border',
                  lead.hasInstagram
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                )}
              >
                <Instagram className="w-3 h-3" />
                {lead.hasInstagram ? 'Con IG' : 'Sin IG'}
              </span>
              {lead.phone ? (
                <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Phone className="w-3 h-3" />
                  {lead.phone}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-surface-200 text-muted-400 border border-[#333]">
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
              className="p-2 text-muted-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-xl transition-all duration-200"
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
                  ? 'text-emerald-400 hover:bg-emerald-500/10 hover:scale-110'
                  : 'text-muted-600 cursor-not-allowed'
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
                className="p-2 text-muted-400 hover:text-brand-400 hover:bg-brand-500/10 rounded-xl transition-all duration-200"
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
                className="p-2 text-pink-400 hover:bg-pink-500/10 rounded-xl transition-all duration-200 hover:scale-110"
                title="Abrir Instagram"
              >
                <Instagram className="w-4.5 h-4.5" />
              </a>
            )}

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-muted-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
              title="Eliminar lead"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-muted-400 hover:text-white hover:bg-surface-50 rounded-xl transition-all duration-200"
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 modal-overlay"
          onClick={() => !isUpdating && setShowDeleteConfirm(false)}
        >
          <div className="bg-surface-400 rounded-2xl p-6 max-w-md mx-4 shadow-2xl modal-content border border-[#333]" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Eliminar lead
            </h3>
            <p className="text-muted-200 mb-6 text-sm">
              ¿Estás seguro de que quieres eliminar <strong className="text-white">{lead.businessName}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isUpdating}
                className="px-5 py-2.5 text-muted-100 bg-surface-200 hover:bg-surface-50 rounded-xl transition-all duration-200 font-medium text-sm"
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
        <div className="px-4 pb-4 pt-3 border-t border-[#262626] bg-gradient-to-b from-surface-300/50 to-surface-400 animate-fade-in-down">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Details */}
            <div className="space-y-4">
              {lead.address && (
                <div>
                  <span className="text-[11px] font-semibold text-muted-300 uppercase tracking-wider">
                    Dirección
                  </span>
                  <p className="text-sm text-muted-50 mt-0.5">{lead.address}</p>
                </div>
              )}

              {lead.websiteUrl && (
                <div>
                  <span className="text-[11px] font-semibold text-muted-300 uppercase tracking-wider">
                    Website
                  </span>
                  <a
                    href={lead.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-400 hover:text-brand-300 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    {lead.websiteUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {lead.instagramUrl && (
                <div>
                  <span className="text-[11px] font-semibold text-muted-300 uppercase tracking-wider">
                    Instagram
                  </span>
                  <a
                    href={lead.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-pink-400 hover:text-pink-300 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    {lead.instagramUrl}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div>
                <span className="text-[11px] font-semibold text-muted-300 uppercase tracking-wider">
                  Score de oportunidad
                </span>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex-grow bg-surface-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full bg-gradient-to-r transition-all duration-700',
                        scoreGradient
                      )}
                      style={{ width: `${lead.opportunityScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white min-w-[50px] text-right">
                    {lead.opportunityScore}/100
                  </span>
                </div>
                <p className="text-xs text-muted-300 mt-1">
                  {scoreInfo.description}
                </p>
              </div>
            </div>

            {/* Right column - Status & Notes */}
            <div className="space-y-4">
              {/* Status selector */}
              <div>
                <span className="text-[11px] font-semibold text-muted-300 uppercase tracking-wider mb-2 block">
                  Cambiar estado
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status as LeadStatus)}
                      disabled={isUpdating || lead.status === status}
                      className={clsx(
                        'px-3 py-1.5 text-xs rounded-xl transition-all duration-200 font-medium border',
                        lead.status === status
                          ? `${config.bgColor} ${config.color} ${config.borderColor}`
                          : 'bg-surface-200 text-muted-300 border-[#333] hover:bg-surface-50 hover:text-white hover:border-brand-500/30'
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
                  <span className="text-[11px] font-semibold text-muted-300 uppercase tracking-wider">
                    Notas
                  </span>
                  {!isEditingNotes && (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium px-2 py-1 rounded-lg hover:bg-brand-500/10 transition-all duration-200"
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
                      className="w-full px-3 py-2.5 text-sm border border-[#333] rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none transition-all duration-200 bg-surface-300 text-muted-50"
                      rows={3}
                      placeholder="Agregar notas sobre este lead..."
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setNotes(lead.notes || '');
                          setIsEditingNotes(false);
                        }}
                        className="px-3 py-1.5 text-sm text-muted-300 hover:bg-surface-50 rounded-xl transition-all duration-200 flex items-center gap-1 font-medium"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        disabled={isUpdating}
                        className="btn-press px-4 py-1.5 text-sm bg-gradient-to-r from-brand-500 to-brand-400 text-white hover:from-brand-600 hover:to-brand-500 rounded-xl transition-all duration-200 flex items-center gap-1 font-medium shadow-card hover:shadow-glow"
                      >
                        <Save className="w-4 h-4" />
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-100">
                    {lead.notes || (
                      <span className="text-muted-500 italic">Sin notas</span>
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
