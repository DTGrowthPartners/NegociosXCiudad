import { Lead, MessageTemplate, OutreachMessage } from '@/types';

const DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE || '57';

/**
 * Message templates for different scenarios
 */
const UNIFIED_MESSAGE = `Hola, soy Dairo 👋 vi *{businessName}* en Google y me llamó la atención. Una pregunta rápida: ¿ya están usando publicidad en redes para atraer clientes o todo les llega por recomendación?`;

const MESSAGE_TEMPLATES: Record<MessageTemplate, string> = {
  NO_WEBSITE: UNIFIED_MESSAGE,
  NO_INSTAGRAM: UNIFIED_MESSAGE,
  HIGH_OPPORTUNITY: UNIFIED_MESSAGE,
  LOW_OPPORTUNITY: UNIFIED_MESSAGE,
  GENERIC: UNIFIED_MESSAGE,
};

/**
 * Determine the best message template based on lead data
 */
export function determineMessageTemplate(lead: Lead): MessageTemplate {
  // Case A: No website at all - highest priority
  if (!lead.hasWebsite) {
    return 'NO_WEBSITE';
  }

  // Case B: Has website but no Instagram
  if (lead.hasWebsite && !lead.hasInstagram) {
    return 'NO_INSTAGRAM';
  }

  // Case C: Has both but high opportunity score (> 70)
  if (lead.opportunityScore > 70) {
    return 'HIGH_OPPORTUNITY';
  }

  // Case D: Low score - already has web + Instagram (score <= 15)
  if (lead.opportunityScore <= 15) {
    return 'LOW_OPPORTUNITY';
  }

  // Default case
  return 'GENERIC';
}

/**
 * Generate personalized outreach message for a lead
 */
export function generateOutreachMessage(lead: Lead): OutreachMessage {
  const template = determineMessageTemplate(lead);
  const templateText = MESSAGE_TEMPLATES[template];

  // Replace placeholders
  const message = templateText
    .replace('{businessName}', lead.businessName)
    .replace('{city}', lead.city);

  // Generate WhatsApp URL if phone is available
  const whatsappUrl = lead.phone ? generateWhatsAppUrl(lead.phone, message) : null;

  return {
    template,
    message,
    whatsappUrl,
  };
}

/**
 * Clean phone number and generate wa.me URL
 */
export function generateWhatsAppUrl(phone: string, message: string): string {
  // Remove all non-digit characters
  let cleanPhone = phone.replace(/\D/g, '');

  // If phone doesn't start with country code, add default
  if (cleanPhone.length <= 10) {
    cleanPhone = DEFAULT_COUNTRY_CODE + cleanPhone;
  }

  // URL encode the message
  const encodedMessage = encodeURIComponent(message);

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Get all available message templates (for UI dropdown)
 */
export function getMessageTemplates(): { key: MessageTemplate; label: string; template: string }[] {
  return [
    {
      key: 'NO_WEBSITE',
      label: 'Sin página web',
      template: MESSAGE_TEMPLATES.NO_WEBSITE,
    },
    {
      key: 'NO_INSTAGRAM',
      label: 'Sin Instagram',
      template: MESSAGE_TEMPLATES.NO_INSTAGRAM,
    },
    {
      key: 'HIGH_OPPORTUNITY',
      label: 'Alta oportunidad',
      template: MESSAGE_TEMPLATES.HIGH_OPPORTUNITY,
    },
    {
      key: 'LOW_OPPORTUNITY',
      label: 'Ya tiene presencia (mantenimiento)',
      template: MESSAGE_TEMPLATES.LOW_OPPORTUNITY,
    },
    {
      key: 'GENERIC',
      label: 'Mensaje genérico',
      template: MESSAGE_TEMPLATES.GENERIC,
    },
  ];
}

/**
 * Generate a preview message with sample data
 */
export function getMessagePreview(template: MessageTemplate): string {
  return MESSAGE_TEMPLATES[template]
    .replace('{businessName}', 'Nombre del Negocio')
    .replace('{city}', 'Ciudad');
}
