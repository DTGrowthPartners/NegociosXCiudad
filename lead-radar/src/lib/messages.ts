import { Lead, MessageTemplate, OutreachMessage } from '@/types';

const DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE || '57';

/**
 * Message templates for different scenarios
 */
const MESSAGE_TEMPLATES: Record<MessageTemplate, string> = {
  NO_WEBSITE: `Hola, vi tu negocio "{businessName}" en {city} y me llamó la atención. Somos el equipo de Dt Growth Partners y noté que aún no tienes página web, eso hace que muchos clientes que buscan en Google no te encuentren. Ayudamos a negocios como el tuyo con páginas web profesionales, publicidad en Google y redes sociales (Facebook e Instagram Ads) y manejo de redes para que lleguen más clientes todos los días. ¿Tienes 5 minutos para que te cuente cómo podemos ayudarte a crecer?`,

  NO_INSTAGRAM: `Hola, encontré tu negocio "{businessName}" en {city}. Somos el equipo de Dt Growth Partners. Vi que tienes web pero no encontré tus redes sociales activas. Hoy el 70% de los clientes descubren negocios por Instagram y Facebook. Nos encargamos del manejo de redes sociales, creación de contenido y campañas de publicidad (Facebook Ads, Instagram Ads y Google Ads) para que tu negocio llegue a más personas. ¿Te gustaría saber cómo podemos ayudarte?`,

  HIGH_OPPORTUNITY: `Hola, vi "{businessName}" en {city} y noté que hay una gran oportunidad para hacer crecer tu negocio con presencia digital. Somos Dt Growth Partners y ofrecemos páginas web, manejo de redes sociales (Instagram y Facebook) y campañas de publicidad en Google Ads y Meta Ads para atraer clientes nuevos todos los días. ¿Tienes 5 minutos para que te cuente cómo lo hacemos?`,

  LOW_OPPORTUNITY: `Hola, vi que "{businessName}" en {city} ya tiene web y redes sociales, eso es genial. Somos el equipo de Dt Growth Partners y trabajamos con negocios que ya tienen presencia digital ayudándolos a sacarle más provecho: optimización de campañas en Google Ads y Meta Ads, mantenimiento web, y gestión continua de redes sociales para que siempre estén generando clientes. ¿Te gustaría que revisemos cómo están rindiendo tus canales digitales?`,

  GENERIC: `Hola, encontré tu negocio "{businessName}" en {city}. Somos el equipo de Dt Growth Partners y ayudamos a negocios locales a conseguir más clientes con páginas web profesionales, manejo de redes sociales y campañas de publicidad en Google y Meta (Facebook e Instagram Ads). ¿Te interesaría saber cómo podemos ayudarte a crecer?`,
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
