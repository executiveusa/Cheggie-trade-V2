export interface SynthiaProduct {
  id: string
  creem_product_id: string
  name: string
  name_es: string
  price_usd: number
  description_es: string
  description_en: string
  features_es: string[]
  features_en: string[]
  type: 'one_time'
  highlighted: boolean
}

export const PRODUCTS: SynthiaProduct[] = [
  {
    id: 'starter',
    creem_product_id: process.env.CREEM_STARTER_ID || '',
    name: 'Synthia™ Inicial',
    name_es: 'Synthia™ Inicial',
    price_usd: 97,
    description_es: 'Tu IA personal instalada. Trae tus datos, dueño de tu stack.',
    description_en: 'Your personal AI installed. Bring your data, own your stack.',
    features_es: [
      'Studio completo (imagen, video, cine, marketing)',
      'Segunda mente — importa desde ChatGPT y Claude',
      'Trae tus propias llaves API',
      'Dashboard móvil',
      'Acceso de por vida',
      '2% apoya LATAM',
    ],
    features_en: [
      'Full studio (image, video, cinema, marketing)',
      'Second brain — import from ChatGPT and Claude',
      'Bring your own API keys',
      'Mobile dashboard',
      'Lifetime access',
      '2% supports LATAM',
    ],
    type: 'one_time',
    highlighted: false,
  },
  {
    id: 'pro',
    creem_product_id: process.env.CREEM_PRO_ID || '',
    name: 'Synthia™ Profesional',
    name_es: 'Synthia™ Profesional',
    price_usd: 297,
    description_es: 'Todo en Inicial + marca propia + portafolio + pack de flujos 30 días.',
    description_en: 'Everything in Starter + white-label + portfolio + 30-day workflow pack.',
    features_es: [
      'Todo en Inicial',
      'Marca propia: tu logo, colores, dominio',
      'Portafolio público',
      'Pack flujos 30 días',
      'Soporte prioritario',
      'Duplica y vende a tu audiencia',
    ],
    features_en: [
      'Everything in Starter',
      'White-label: your brand, colors, domain',
      'Public portfolio',
      '30-day workflow pack',
      'Priority support',
      'Duplicate and sell to your audience',
    ],
    type: 'one_time',
    highlighted: true,
  },
  {
    id: 'operator',
    creem_product_id: process.env.CREEM_OPERATOR_ID || '',
    name: 'Synthia™ Operador',
    name_es: 'Synthia™ Operador',
    price_usd: 497,
    description_es: 'Multi-tenant. Despliega en cualquier niche o país. Vende instalaciones.',
    description_en: 'Multi-tenant. Deploy to any niche or country. Sell installs.',
    features_es: [
      'Todo en Profesional',
      'Multi-tenant: clientes ilimitados',
      'Dashboard de operador',
      'Vende instalaciones y queda con el 100%',
      'Guía de infraestructura dedicada',
    ],
    features_en: [
      'Everything in Professional',
      'Multi-tenant: unlimited clients',
      'Operator dashboard',
      'Sell installs, keep 100%',
      'Dedicated infrastructure guide',
    ],
    type: 'one_time',
    highlighted: false,
  },
]

export function creemCheckoutUrl(productId: string, email?: string): string {
  const url = new URL(`https://www.creem.io/payment/${productId}`)
  if (email) url.searchParams.set('prefill_email', email)
  return url.toString()
}
