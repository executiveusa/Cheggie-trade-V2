/**
 * SYNTHIA™ Luxury Psychology — Wealth Category Framework
 * Based on Paul Russell Luxury Academy behavioral research
 *
 * Use this module when:
 * - Generating copy that targets a specific wealth segment
 * - Selecting psychology triggers for a design brief
 * - Scoring conversion potential of output copy
 * - Detecting wealth category from brief context signals
 */

export enum WealthCategory {
  AFFLUENT = 'affluent',  // $100K–$1M — Proving status, aspirational
  HNW = 'hnw',            // $1M–$30M — Established, time-precious
  VHNW = 'vhnw',          // $30M–$100M — Sophistication, rare access
  UHNW = 'uhnw',          // $100M+ — Discretion, legacy, privacy
}

export enum PsychologyTrigger {
  SCARCITY = 'scarcity',
  SOCIAL_PROOF = 'social-proof',
  AUTHORITY = 'authority',
  EXCLUSIVITY = 'exclusivity',
  PRICE_QUALITY = 'price-quality',
  BRAND_HEURISTIC = 'brand-heuristic',
}

export enum LanguageRegister {
  ACCESSIBLE_LUXURY = 'accessible-luxury',    // AFFLUENT
  REFINED_EXCELLENCE = 'refined-excellence',  // HNW
  BESPOKE_SINGULAR = 'bespoke-singular',      // VHNW
  PRIVATE_EXCELLENCE = 'private-excellence',  // UHNW
}

export interface WealthCategoryProfile {
  category: WealthCategory;
  netWorthRange: string;
  mindset: string;
  primaryFears: string[];
  primaryDesires: string[];
  triggers: PsychologyTrigger[];
  languageRegister: LanguageRegister;
  designSignals: string[];
  ctaPatterns: string[];
  socialProofType: string;
  pricingDisplay: 'visible' | 'range' | 'inquiry-only' | 'never';
  scarcityMechanism: string | null;
}

export const WEALTH_PROFILES: Record<WealthCategory, WealthCategoryProfile> = {
  [WealthCategory.AFFLUENT]: {
    category: WealthCategory.AFFLUENT,
    netWorthRange: '$100K–$1M',
    mindset: 'Proving status. Arrived but not yet secure.',
    primaryFears: [
      'Being seen as extravagant',
      'Making the wrong investment',
      'Not maximizing value received',
    ],
    primaryDesires: [
      'Aspiring to the next wealth tier',
      'Social signals that communicate success',
      'Justifiable premium decisions',
    ],
    triggers: [
      PsychologyTrigger.SOCIAL_PROOF,
      PsychologyTrigger.SCARCITY,
      PsychologyTrigger.AUTHORITY,
    ],
    languageRegister: LanguageRegister.ACCESSIBLE_LUXURY,
    designSignals: [
      'Quality photography showing lifestyle transformation',
      'Testimonials from relatable-but-aspirational figures',
      'Clear pricing with value demonstration',
      'Trust badges and recognizable associations',
    ],
    ctaPatterns: [
      'Start Your Journey',
      'Join the Community',
      'Get Started Today',
      'See the Results',
    ],
    socialProofType: 'Named brands, Fortune 500 associations, volume of clients',
    pricingDisplay: 'visible',
    scarcityMechanism: 'Quantity scarcity: limited openings per quarter',
  },

  [WealthCategory.HNW]: {
    category: WealthCategory.HNW,
    netWorthRange: '$1M–$30M',
    mindset: 'Established success. Time is the scarcest resource.',
    primaryFears: [
      'Wasting senior team time on vendor management',
      'Inferior quality creating downstream problems',
      'Process that requires active management',
    ],
    primaryDesires: [
      'Outcomes delivered without process involvement',
      'Expert systems they can trust and delegate to',
      'Time returned to higher-value activities',
    ],
    triggers: [
      PsychologyTrigger.AUTHORITY,
      PsychologyTrigger.EXCLUSIVITY,
      PsychologyTrigger.PRICE_QUALITY,
    ],
    languageRegister: LanguageRegister.REFINED_EXCELLENCE,
    designSignals: [
      'Minimal navigation — every click must justify itself',
      'Concierge / advisor CTA framing',
      'Process transparency that protects their time',
      'Quality signals over quantity of features',
    ],
    ctaPatterns: [
      'Speak With Your Advisor',
      'Schedule a Discovery Call',
      'Request a Project Assessment',
      'Begin the Engagement',
    ],
    socialProofType: 'Peer executives, sector-specific leaders, named company types',
    pricingDisplay: 'range',
    scarcityMechanism: 'Time scarcity: project calendar fills 6 weeks ahead',
  },

  [WealthCategory.VHNW]: {
    category: WealthCategory.VHNW,
    netWorthRange: '$30M–$100M',
    mindset: 'Sophisticated taste. Experiences, not possessions.',
    primaryFears: [
      'Generic output that signals mass-market thinking',
      'Process that becomes predictable over time',
      'Vendors who do not understand their world',
    ],
    primaryDesires: [
      'Singular access unavailable to others',
      'Curator relationships with real depth',
      'Intellectual partnership, not vendor service',
    ],
    triggers: [
      PsychologyTrigger.EXCLUSIVITY,
      PsychologyTrigger.BRAND_HEURISTIC,
      PsychologyTrigger.AUTHORITY,
    ],
    languageRegister: LanguageRegister.BESPOKE_SINGULAR,
    designSignals: [
      'Extreme white space — density implies urgency',
      'Editorial photography over product photography',
      'Named individuals, not companies',
      'No pricing on primary pages — inquiry-only',
    ],
    ctaPatterns: [
      'Request an Introduction',
      'Begin a Conversation',
      'Explore a Collaboration',
      'Commission a Brief',
    ],
    socialProofType: 'Singular named relationships, named specific clients (with permission)',
    pricingDisplay: 'inquiry-only',
    scarcityMechanism: 'Access scarcity: available by introduction through existing clients',
  },

  [WealthCategory.UHNW]: {
    category: WealthCategory.UHNW,
    netWorthRange: '$100M+',
    mindset: 'Ultimate discretion. Legacy and privacy above all.',
    primaryFears: [
      'Privacy breach or public exposure',
      'Being treated as a transaction rather than a relationship',
      'Inauthenticity or any form of manipulation',
    ],
    primaryDesires: [
      'Absolute discretion and privacy protection',
      'Legacy-building and multi-generational impact',
      'Relationships built on earned trust, not sales',
    ],
    triggers: [
      PsychologyTrigger.BRAND_HEURISTIC,
      PsychologyTrigger.AUTHORITY,
      // NOTE: SCARCITY, SOCIAL_PROOF, EXCLUSIVITY are all inappropriate at UHNW
    ],
    languageRegister: LanguageRegister.PRIVATE_EXCELLENCE,
    designSignals: [
      'Virtually no visible marketing elements',
      'Contact-only pages — no products, no pricing',
      'The design communicates: we do not need your business',
      'Credential document aesthetic, not sales tool',
    ],
    ctaPatterns: [
      'Speak Privately',
      'A Confidential Conversation',
      // NOTE: CTAs should barely exist. The relationship is the conversion.
    ],
    socialProofType: 'Private network references only. Nothing public.',
    pricingDisplay: 'never',
    scarcityMechanism: null, // Scarcity language is perceived as manipulation at UHNW
  },
};

/**
 * Detect likely wealth category from brief context signals.
 * Returns best guess with confidence score.
 */
export function detectWealthCategory(briefText: string): {
  category: WealthCategory;
  confidence: number;
  signals: string[];
} {
  const text = briefText.toLowerCase();
  const signals: string[] = [];
  const scores: Record<WealthCategory, number> = {
    [WealthCategory.AFFLUENT]: 0,
    [WealthCategory.HNW]: 0,
    [WealthCategory.VHNW]: 0,
    [WealthCategory.UHNW]: 0,
  };

  // AFFLUENT signals
  if (text.includes('price') || text.includes('cost') || text.includes('budget')) {
    scores[WealthCategory.AFFLUENT] += 2;
    signals.push('Mentions price/cost → AFFLUENT signal');
  }
  if (text.includes('compare') || text.includes('competitor') || text.includes('alternative')) {
    scores[WealthCategory.AFFLUENT] += 1;
    signals.push('Competitor comparison → AFFLUENT signal');
  }
  if (text.includes('package') || text.includes('tier') || text.includes('plan')) {
    scores[WealthCategory.AFFLUENT] += 1;
    signals.push('Package/tier inquiry → AFFLUENT signal');
  }

  // HNW signals
  if (text.includes('team') || text.includes('delegate') || text.includes('handle')) {
    scores[WealthCategory.HNW] += 2;
    signals.push('Team/delegation language → HNW signal');
  }
  if (text.includes('timeline') || text.includes('deadline') || text.includes('schedule')) {
    scores[WealthCategory.HNW] += 1;
    signals.push('Timeline emphasis → HNW signal');
  }
  if (text.includes('brand standards') || text.includes('guidelines') || text.includes('existing')) {
    scores[WealthCategory.HNW] += 1;
    signals.push('Existing brand standards → HNW signal');
  }

  // VHNW signals
  if (text.includes('process') || text.includes('methodology') || text.includes('approach')) {
    scores[WealthCategory.VHNW] += 2;
    signals.push('Process/methodology inquiry → VHNW signal');
  }
  if (text.includes('bespoke') || text.includes('custom') || text.includes('singular')) {
    scores[WealthCategory.VHNW] += 2;
    signals.push('Bespoke/custom language → VHNW signal');
  }
  if (!text.includes('price') && !text.includes('cost') && !text.includes('budget')) {
    scores[WealthCategory.VHNW] += 1;
    scores[WealthCategory.UHNW] += 1;
    signals.push('No price mention → VHNW/UHNW signal');
  }

  // UHNW signals
  if (text.includes('assistant') || text.includes('office') || text.includes('advisor')) {
    scores[WealthCategory.UHNW] += 2;
    signals.push('Third-party intermediary → UHNW signal');
  }
  if (text.includes('confidential') || text.includes('private') || text.includes('discrete')) {
    scores[WealthCategory.UHNW] += 3;
    signals.push('Privacy/discretion emphasis → UHNW signal');
  }
  if (text.includes('legacy') || text.includes('family') || text.includes('generation')) {
    scores[WealthCategory.UHNW] += 2;
    signals.push('Legacy/family language → UHNW signal');
  }

  const maxScore = Math.max(...Object.values(scores));
  const category = Object.entries(scores).find(
    ([, score]) => score === maxScore
  )?.[0] as WealthCategory ?? WealthCategory.HNW;

  const totalSignals = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalSignals > 0 ? maxScore / totalSignals : 0.5;

  return { category, confidence: Math.min(confidence, 0.95), signals };
}

/**
 * Get the appropriate psychology triggers for a wealth category.
 * Includes triggers to avoid (prevents misalignment).
 */
export function getTriggersForCategory(category: WealthCategory): {
  use: PsychologyTrigger[];
  avoid: PsychologyTrigger[];
} {
  const profile = WEALTH_PROFILES[category];
  const allTriggers = Object.values(PsychologyTrigger);
  const avoid = allTriggers.filter((t) => !profile.triggers.includes(t));

  return { use: profile.triggers, avoid };
}

/**
 * Apply luxury language transforms to raw copy text.
 * Replaces generic marketing language with wealth-appropriate register.
 */
export const LUXURY_LANGUAGE_TRANSFORMS: Record<string, string> = {
  price: 'investment',
  contract: 'agreement',
  objections: 'areas of concern',
  cheap: 'accessible',
  affordable: 'accessible',
  buy: 'acquire',
  purchase: 'commission',
  customers: 'clients',
  users: 'members',
  product: 'solution',
  discount: 'scope adjustment',
  'sales call': 'discovery conversation',
  package: 'engagement',
  service: 'expertise',
  'we offer': 'we deliver',
  problems: 'challenges',
  complaints: 'feedback',
};

export function applyLuxuryLanguage(text: string): string {
  let result = text;
  for (const [generic, luxury] of Object.entries(LUXURY_LANGUAGE_TRANSFORMS)) {
    const regex = new RegExp(`\\b${generic}\\b`, 'gi');
    result = result.replace(regex, luxury);
  }
  return result;
}
