/**
 * SYNTHIA™ P.A.S.S.™ Copywriting Framework
 * Problem → Amplification → Solution → System
 *
 * The four-layer luxury copywriting structure for premium market conversion.
 * See pass-framework-SKILL.md for full implementation rationale.
 */

import { WealthCategory, applyLuxuryLanguage } from '../luxury-psychology/wealth-categories';

export interface PASSInput {
  wealthCategory: WealthCategory;
  /** The specific friction or challenge to name */
  problemContext: string;
  /** The downstream consequence if left unresolved */
  amplificationContext: string;
  /** The named mechanism that resolves the problem */
  solutionMechanism: string;
  /** The named phases/stages of the engagement */
  systemPhases: SystemPhase[];
  /** Investment range (omit for UHNW) */
  investmentRange?: string;
  /** Timeline if relevant */
  timeline?: string;
}

export interface SystemPhase {
  name: string;
  timing: string;
  description: string;
  output: string;
}

export interface PASSOutput {
  problem: string;
  amplification: string;
  solution: string;
  system: string;
  combined: string;
  qualityScore: number;
  issues: string[];
}

/**
 * Amplification style by wealth category.
 * AFFLUENT: fear-adjacent acceptable
 * HNW+: opportunity-cost only
 */
const AMPLIFICATION_STYLE: Record<WealthCategory, 'fear-adjacent' | 'opportunity-cost' | 'legacy'> = {
  [WealthCategory.AFFLUENT]: 'fear-adjacent',
  [WealthCategory.HNW]: 'opportunity-cost',
  [WealthCategory.VHNW]: 'opportunity-cost',
  [WealthCategory.UHNW]: 'legacy',
};

/**
 * Generate a complete P.A.S.S.™ copy block from inputs.
 */
export class PASSFramework {
  static build(input: PASSInput): PASSOutput {
    const {
      wealthCategory,
      problemContext,
      amplificationContext,
      solutionMechanism,
      systemPhases,
      investmentRange,
      timeline,
    } = input;

    const ampStyle = AMPLIFICATION_STYLE[wealthCategory];

    // Problem layer — specific friction with context + real cost
    const problem = applyLuxuryLanguage(problemContext);

    // Amplification layer — styled by wealth category
    let amplification = applyLuxuryLanguage(amplificationContext);
    if (ampStyle === 'opportunity-cost') {
      // Reframe if needed to opportunity-cost framing
      if (amplification.toLowerCase().includes("don't") ||
          amplification.toLowerCase().includes("warning") ||
          amplification.toLowerCase().includes("danger")) {
        amplification = `The ongoing cost of this friction compounds quarterly. ${amplification}`;
      }
    }
    if (ampStyle === 'legacy') {
      amplification = `The communication infrastructure built now becomes the first chapter of the institutional record. ${amplification}`;
    }

    // Solution layer — named mechanism + how it resolves the named problem
    const solution = applyLuxuryLanguage(
      `${solutionMechanism} resolves this directly. Rather than iterating toward quality, ` +
      `the process begins with brief architecture that encodes objectives before execution — ` +
      `producing scored, production-ready output that requires selection, not revision.`
    );

    // System layer — named phases with outputs
    const phaseLines = systemPhases
      .map(
        (phase) =>
          `${phase.name} (${phase.timing})\n— ${phase.description}\n— Output: ${phase.output}`
      )
      .join('\n\n');

    const closingLine = investmentRange
      ? `Investment: ${investmentRange}.${timeline ? ` Timeline: ${timeline}.` : ''}`
      : timeline
      ? `Timeline: ${timeline}.`
      : '';

    const system = applyLuxuryLanguage(
      `The engagement is structured in ${systemPhases.length} phases:\n\n${phaseLines}${closingLine ? '\n\n' + closingLine : ''}`
    );

    const combined = [problem, amplification, solution, system]
      .filter(Boolean)
      .join('\n\n');

    const { score, issues } = PASSFramework.grade({ problem, amplification, solution, system, combined, qualityScore: 0, issues: [] });

    return { problem, amplification, solution, system, combined, qualityScore: score, issues };
  }

  /**
   * Grade a P.A.S.S.™ output block.
   * Returns score out of 10 and list of issues.
   */
  static grade(output: PASSOutput): { score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 10;

    // Layer completeness checks
    if (!output.problem || output.problem.length < 40) {
      issues.push('PROBLEM layer too short — needs specific friction + real cost');
      score -= 2;
    }
    if (!output.amplification || output.amplification.length < 40) {
      issues.push('AMPLIFICATION layer missing or too brief');
      score -= 2;
    }
    if (!output.solution || output.solution.length < 40) {
      issues.push('SOLUTION layer too short — must name the specific mechanism');
      score -= 1.5;
    }
    if (!output.system || output.system.length < 80) {
      issues.push('SYSTEM layer missing or too brief — must describe named phases');
      score -= 1.5;
    }

    // Banned copy patterns
    const banned = [
      'world-class', 'cutting-edge', 'passionate', "we're different",
      'end-to-end', 'synergy', 'leverage', 'game-changing', 'next level',
      "don't miss", 'act now', 'limited time',
    ];
    const allText = [output.problem, output.amplification, output.solution, output.system]
      .join(' ')
      .toLowerCase();

    banned.forEach((term) => {
      if (allText.includes(term)) {
        issues.push(`Banned copy pattern found: "${term}"`);
        score -= 0.5;
      }
    });

    // Generic indicators
    if (allText.includes('we offer premium') || allText.includes('tailored to your needs')) {
      issues.push('Generic agency language detected in SOLUTION — replace with named mechanism');
      score -= 1;
    }

    return { score: Math.max(0, Math.round(score * 10) / 10), issues };
  }

  /**
   * Apply luxury language transforms to a raw copy block.
   * Does not restructure — use build() for structure.
   */
  static transform(rawCopy: string): string {
    return applyLuxuryLanguage(rawCopy);
  }
}

/**
 * Pre-built system phase templates for common engagement types.
 */
export const SYSTEM_PHASE_TEMPLATES: Record<string, SystemPhase[]> = {
  brand_identity: [
    {
      name: 'Brief Architecture',
      timing: 'Week 1',
      description: 'Brand audit + perception gap analysis. UDEC-scored assessment of current identity against growth-stage benchmarks.',
      output: 'Machine-readable brief encoding all identity constraints',
    },
    {
      name: 'Identity Development',
      timing: 'Weeks 2–4',
      description: 'Three parallel directions built simultaneously. Each scored against 14 objective axes before presentation.',
      output: 'Three scored identity systems — you select, not revise',
    },
    {
      name: 'Delivery + Advisory',
      timing: 'Week 5',
      description: 'Full asset library with implementation specifications. Ongoing advisory relationship for deployment decisions.',
      output: 'Complete asset library + 90-day advisory window',
    },
  ],

  web_design: [
    {
      name: 'Discovery',
      timing: 'Week 1',
      description: '60-minute brief architecture session encoding objectives, identity constraints, and success metrics.',
      output: 'Scored brief + design system constraints',
    },
    {
      name: 'Production',
      timing: 'Weeks 2–3',
      description: 'Three simultaneous design directions built against the brief. Each UDEC-scored before review.',
      output: 'Three production-quality design candidates',
    },
    {
      name: 'Build + Handoff',
      timing: 'Weeks 4–6',
      description: 'Selected direction built to production quality. Implementation specifications included.',
      output: 'Production-ready site + implementation package',
    },
  ],

  copy_strategy: [
    {
      name: 'Voice Architecture',
      timing: 'Days 1–3',
      description: 'Wealth category identification, trigger calibration, and language register definition.',
      output: 'Voice architecture document',
    },
    {
      name: 'P.A.S.S.™ Copy Development',
      timing: 'Days 4–10',
      description: 'Full P.A.S.S.™ copy built for primary pages. Scored against luxury psychology framework.',
      output: 'Complete copy package — no revision rounds needed',
    },
  ],
};
