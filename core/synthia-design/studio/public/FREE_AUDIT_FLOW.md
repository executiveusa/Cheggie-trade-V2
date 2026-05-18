# Free Audit Flow — Cynthia Design Studio
# Version: 1.0.0

## Overview

The free site audit is Cynthia's primary lead generation mechanism. It demonstrates the studio's capability by delivering real value before asking for payment.

## Input

Client submits via landing page form:
```yaml
required:
  - url: string (the site to audit)
optional:
  - name: string
  - email: string (for delivery)
  - brand_info: string (brand guidelines, if any)
  - goals: string (what they want to improve)
  - competitors: string[] (reference sites)
```

## Audit Pipeline

```
1. INTAKE
   Concierge creates audit job in studio/jobs/inbox/
   Job type: design.audit
   Priority: normal

2. CLASSIFICATION
   Route to Growth/Audit Agent
   Load doctrine: DESIGN_LAWS, udec-scorer

3. AUTOMATED ANALYSIS
   Growth Agent analyzes submitted URL:
   
   a. Visual Hierarchy Assessment
      - F/Z-pattern compliance
      - Heading hierarchy (H1→H6)
      - Visual weight distribution
   
   b. Typography Evaluation
      - Font count and quality
      - Type scale consistency
      - Readability at body sizes
   
   c. Color System Review
      - Accent count and consistency
      - WCAG contrast compliance
      - Brand coherence
   
   d. Mobile Responsiveness
      - 375px viewport test
      - Touch target sizes
      - Horizontal overflow check
   
   e. Performance Metrics
      - Core Web Vitals
      - Image optimization
      - Script loading strategy
   
   f. Accessibility Scan
      - Semantic HTML usage
      - ARIA compliance
      - Keyboard navigation
   
   g. Content Quality
      - Copy clarity
      - CTA specificity
      - Information architecture
   
   h. Motion & Interaction
      - Animation quality
      - Scroll behavior
      - Transition smoothness

4. SCORING
   Reviewer scores against UDEC 14-axis framework
   Produces: audit-{url-slug}.json

5. REPORT GENERATION
   Copy Agent writes human-readable summary:
   
   Structure:
   - Overall Score: X.X / 10.0
   - Top 5 Strengths (what's working)
   - Top 5 Pain Points (what needs fixing)
   - Quick Wins (easy improvements, high impact)
   - Strategic Opportunities (bigger changes, bigger results)
   - Competitive Gaps (vs. submitted competitors, if any)
   
   Tone: Honest, specific, actionable. Not flattering, not harsh.

6. PACKAGING
   Packaging Agent creates:
   - Branded PDF report
   - Summary email (if email provided)
   - "Fix This" CTAs linked to service packages:
     - Quick Fix package (Starter tier, $500-$2,000)
     - Full Redesign package (Standard tier, $2,000-$10,000)

7. HUMAN APPROVAL
   Report placed in studio/jobs/review/ with:
   requires_human_approval: true
   
   Bambu reviews report quality before delivery.

8. DELIVERY
   - Email with PDF attachment (if email provided)
   - Web-accessible report URL (shareable)
   - Follow-up SMS (if phone provided, with consent)
```

## Report Template

```markdown
# Site Audit Report
## {site_name} — {url}
### Audit Date: {date}

---

## Overall Score: {score} / 10.0

{score_interpretation}

---

## Strengths
1. {strength_1}
2. {strength_2}
...

## Pain Points
1. {pain_1} — Impact: {high|medium|low}
2. {pain_2} — Impact: {high|medium|low}
...

## Quick Wins
These improvements can be made quickly for immediate impact:
1. {quick_win_1} — Estimated impact: +{score_improvement}
...

## Strategic Opportunities
These changes require more investment but yield significant results:
1. {opportunity_1}
...

## 14-Axis Score Breakdown
| Axis | Score | Status |
|------|-------|--------|
| VHR — Visual Hierarchy | {score} | {pass/needs-work} |
| TYP — Typography | {score} | {pass/needs-work} |
...

---

## Ready to Improve?

**Quick Fix** — Starting at $500
Fix the quick wins and boost your score immediately.
[Start Quick Fix →]

**Full Redesign** — Starting at $2,000  
Comprehensive redesign with cinematic quality standards.
[Start Redesign →]

---

Audit by Cynthia Design Studio
The Pauli Effect™
```

## Conversion Metrics to Track
- Audit requests per day
- Audit completion rate
- Report open rate (email)
- CTA click-through rate
- Audit → paid conversion rate (target: 5-15%)
