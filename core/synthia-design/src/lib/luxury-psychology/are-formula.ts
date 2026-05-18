/**
 * SYNTHIA™ A.R.E. Formula — Acknowledge-Relate-Elevate
 * Luxury conversation and copy engagement framework
 *
 * The A.R.E. Formula replaces generic sales copy with psychology-informed
 * engagement calibrated to wealth category. See luxury-psychology-SKILL.md
 * for the full framework rationale.
 */

import { WealthCategory } from './wealth-categories';

export interface AREContext {
  wealthCategory: WealthCategory;
  /** Specific achievement, role, or position to acknowledge */
  achievement?: string;
  /** The specific challenge they face in their context */
  challenge?: string;
  /** The insight or framework being introduced */
  elevation?: string;
  /** Industry or sector context */
  sector?: string;
}

export interface AREOutput {
  acknowledge: string;
  relate: string;
  elevate: string;
  combined: string;
}

/**
 * Acknowledge layer templates by wealth category.
 * Note: these are pattern templates — fill with specifics from the brief.
 * Generic flattery is explicitly banned.
 */
const ACKNOWLEDGE_PATTERNS: Record<WealthCategory, string[]> = {
  [WealthCategory.AFFLUENT]: [
    'As someone building toward {achievement}, the investment decisions you make now compound directly.',
    'At {achievement} stage, the quality of your creative infrastructure determines your ceiling.',
    'The work you\'ve done to reach {achievement} deserves a brand presence that matches.',
  ],
  [WealthCategory.HNW]: [
    'Managing {achievement} means every vendor decision has downstream cost on your principal\'s time.',
    'At {achievement} scale, the real question isn\'t capability — it\'s process reliability.',
    'As someone overseeing {achievement}, you already know that the best work comes from systems, not talent alone.',
  ],
  [WealthCategory.VHNW]: [
    'After working at {achievement} level, the default approaches stopped surprising you years ago.',
    'At {achievement}, the constraint isn\'t budget or access — it\'s finding genuine quality.',
    'Someone who has navigated {achievement} can identify the difference between premium craft and premium pricing.',
  ],
  [WealthCategory.UHNW]: [
    'The decisions made at {achievement} scale have consequences that extend well beyond the immediate transaction.',
    'What you\'ve built at {achievement} requires a communication architecture that protects what took decades to earn.',
    // NOTE: UHNW acknowledge is rarely explicit. The quality of the communication itself is the acknowledgment.
  ],
};

/**
 * Relate layer templates.
 * Must connect to specific friction, not general category stereotype.
 */
const RELATE_PATTERNS: Record<WealthCategory, string[]> = {
  [WealthCategory.AFFLUENT]: [
    'The challenge at growth stage is that creative work tends to absorb disproportionate time relative to output quality.',
    'Most design engagements optimize for the agency\'s process, not your outcome timeline.',
    'The revision cycle problem isn\'t about the work — it\'s that the brief wasn\'t precise enough to evaluate against.',
  ],
  [WealthCategory.HNW]: [
    'The real cost of the wrong creative partner isn\'t the project budget. It\'s the two quarters of stakeholder time absorbed by revisions that never resolve.',
    'When the brief isn\'t architecture-grade, every review cycle reopens the same conversations.',
    'The best creative work requires principals involved in decisions they shouldn\'t have to make.',
  ],
  [WealthCategory.VHNW]: [
    'When you\'ve worked with every major studio, the problem isn\'t quality — it\'s that the process itself has become predictable.',
    'Generic luxury output in your market signals that the brand hasn\'t been curated at the level your audience expects.',
    'The challenge isn\'t finding talented vendors. It\'s finding a methodology that produces non-derivative work.',
  ],
  [WealthCategory.UHNW]: [
    'At your level of visibility, the communication infrastructure you build becomes part of the institutional record.',
    'The default creative approaches create exposure — not just aesthetic risk, but positioning risk.',
  ],
};

/**
 * Elevate layer templates.
 * Introduces a specific mechanism or framework insight.
 */
const ELEVATE_PATTERNS: Record<WealthCategory, string[]> = {
  [WealthCategory.AFFLUENT]: [
    'What the {mechanism} delivers is clear output standards — so you always know exactly what you\'re getting before committing.',
    '{mechanism} replaces the subjective review process with an objective scoring framework. You evaluate finished work against defined criteria.',
    'The {mechanism} protocol means every deliverable passes a quality gate before it reaches you.',
  ],
  [WealthCategory.HNW]: [
    'The {mechanism} protocol produces three scored directions simultaneously — before a single stakeholder review hour is committed. You evaluate candidates, not concepts.',
    '{mechanism} encodes your identity constraints before execution begins. The result is first-pass output that requires selection, not course correction.',
    'With {mechanism}, you never manage the process. You approve the outcome.',
  ],
  [WealthCategory.VHNW]: [
    '{mechanism} operates on a brief architecture layer that encodes your identity before execution. The process cannot produce derivative output because it prevents derivative briefs.',
    'The {mechanism} protocol doesn\'t iterate from weak work — it rebuilds from precise briefs. That\'s a different relationship between methodology and output.',
    'What distinguishes {mechanism} is that the constraint model is intellectual, not aesthetic. The result is work that couldn\'t have been produced for anyone else.',
  ],
  [WealthCategory.UHNW]: [
    '{mechanism} is structured as a relationship architecture, not a service architecture. The distinction matters at this level.',
    'The {mechanism} model operates with full discretion protocols built in from the first conversation.',
  ],
};

/**
 * Build a complete A.R.E. engagement using context.
 * If specific content is not provided, uses category-appropriate templates.
 */
export class AREFormula {
  static build(context: AREContext): AREOutput {
    const { wealthCategory, achievement, challenge, elevation } = context;
    const mechanism = elevation ?? 'Karpathy Council';

    const acknowledgeTemplate =
      ACKNOWLEDGE_PATTERNS[wealthCategory][0] ?? '';
    const relateTemplate = RELATE_PATTERNS[wealthCategory][0] ?? '';
    const elevateTemplate = ELEVATE_PATTERNS[wealthCategory][0] ?? '';

    const fill = (template: string) =>
      template
        .replace(/{achievement}/g, achievement ?? 'this level')
        .replace(/{mechanism}/g, mechanism)
        .replace(/{challenge}/g, challenge ?? 'this challenge');

    const acknowledge = fill(acknowledgeTemplate);
    const relate = fill(relateTemplate);
    const elevate = fill(elevateTemplate);

    const combined = [acknowledge, relate, elevate].filter(Boolean).join('\n\n');

    return { acknowledge, relate, elevate, combined };
  }

  /**
   * Validate an A.R.E. output for quality.
   * Returns issues found (empty array = pass).
   */
  static validate(output: AREOutput): string[] {
    const issues: string[] = [];

    // Check acknowledge layer
    if (!output.acknowledge || output.acknowledge.length < 20) {
      issues.push('ACKNOWLEDGE layer missing or too brief');
    }
    const flattery = ['successful', 'amazing', 'incredible', 'wonderful', 'fantastic'];
    if (flattery.some((f) => output.acknowledge.toLowerCase().includes(f))) {
      issues.push('ACKNOWLEDGE layer contains generic flattery — replace with specific validation');
    }

    // Check relate layer
    if (!output.relate || output.relate.length < 30) {
      issues.push('RELATE layer missing or too brief');
    }

    // Check elevate layer
    if (!output.elevate || output.elevate.length < 30) {
      issues.push('ELEVATE layer missing or too brief');
    }
    if (!output.elevate.includes('protocol') &&
        !output.elevate.includes('framework') &&
        !output.elevate.includes('system') &&
        !output.elevate.includes('model') &&
        !output.elevate.includes('approach')) {
      issues.push('ELEVATE layer should introduce a named mechanism or framework');
    }

    return issues;
  }

  /**
   * Quick check: does this copy block follow A.R.E. structure?
   * Returns confidence score 0-1.
   */
  static detectAREStructure(copyBlock: string): number {
    let score = 0;
    const text = copyBlock.toLowerCase();

    // Acknowledge signals
    if (
      text.includes('as someone') ||
      text.includes('at this level') ||
      text.includes('managing') ||
      text.includes('after working')
    ) {
      score += 0.33;
    }

    // Relate signals
    if (
      text.includes('the real cost') ||
      text.includes('the challenge') ||
      text.includes('the problem') ||
      text.includes('the constraint')
    ) {
      score += 0.33;
    }

    // Elevate signals
    if (
      text.includes('what') && (
        text.includes('delivers') ||
        text.includes('protocol') ||
        text.includes('produces') ||
        text.includes('replaces')
      )
    ) {
      score += 0.34;
    }

    return score;
  }
}
