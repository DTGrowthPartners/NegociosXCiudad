import { Lead, MessageTemplate, OutreachMessage } from '@/types';

const DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE || '57';

/**
 * Message templates for different scenarios
 */
const MESSAGE_TEMPLATES: Record<MessageTemplate, string> = {
  NO_WEBSITE: `Hola, vi tu negocio "{businessName}" en {city}. Noté que no tienes página web activa; hoy muchos clientes buscan y comparan online antes de comprar. Si quieres, te muestro en 5 min una propuesta simple para captar más clientes desde Google. ¿Te interesa?`,

  NO_INSTAGRAM: `Hola, encontré tu negocio "{businessName}" en {city}. Vi que tienes web pero no encontré tu Instagram. Hoy el 70% de los clientes descubren negocios por redes sociales. ¿Te gustaría saber cómo podrías aprovechar Instagram para atraer más clientes?`,

  HIGH_OPPORTUNITY: `Hola, vi "{businessName}" en {city}. Noté que hay oportunidad de mejorar tu presencia digital para atraer más clientes. Trabajo ayudando negocios locales a destacar en Google y redes. ¿Tienes 5 minutos para que te cuente cómo?`,

  GENERIC: `Hola, encontré tu negocio "{businessName}" en {city}. Trabajo ayudando negocios locales a mejorar su presencia online y atraer más clientes. ¿Te interesaría saber cómo podría ayudarte?`,
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
