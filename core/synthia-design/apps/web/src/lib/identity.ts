export const BRAND = {
  name: 'Synthia™',
  tagline_es: 'Tu IA. Tu datos. Tu negocio.',
  tagline_en: 'Your AI. Your data. Your business.',
  tagline_pt: 'Sua IA. Seus dados. Seu negocio.',
  mission: 'Sovereign Personal AI for Latin America',
  operator: 'Kupuri Media™',
  parent: 'The Pauli Effect™',
  pledge: '2% of all revenue funds eco + AI literacy in LATAM',
  primary_color: '#c4963c',
  accent_color: '#5a7a52',
  dark_color: '#0a1108',
  surface_color: '#1a2a1a',
  text_color: '#f5f0e8',
  version: '1.0.0',
} as const;

export const WHITELABEL = {
  name: process.env.WL_BRAND_NAME || BRAND.name,
  tagline: process.env.WL_TAGLINE || BRAND.tagline_es,
  logo_url: process.env.WL_LOGO_URL || '/logo.svg',
  primary_color: process.env.WL_PRIMARY_COLOR || BRAND.primary_color,
  operator_id: process.env.WL_OPERATOR_ID || 'kupuri',
  language: (process.env.WL_LANGUAGE || 'es') as 'es' | 'en' | 'pt',
  country: process.env.WL_COUNTRY || 'MX',
  niche: process.env.WL_NICHE || 'general',
} as const;
