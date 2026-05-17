# Lead Funnel Architecture — Cynthia Design Studio
# Version: 1.0.0

## Overview

Cynthia acquires clients through a combination of automated funnels, content marketing, and compliant outreach. All lead acquisition respects platform terms of service and legal boundaries.

## Funnel 1: Free Site Audit (Primary)

**Flow**:
```
Landing Page → "Get Your Free Site Audit" CTA
  ↓
Client submits URL + optional info (brand, goals, competitors)
  ↓
Concierge creates audit job
  ↓
Growth Agent analyzes submitted URL:
  - Visual hierarchy assessment
  - Typography evaluation
  - Mobile responsiveness check
  - Performance metrics
  - Accessibility scan
  - Content quality assessment
  - Motion/interaction review
  ↓
Reviewer scores against UDEC framework
  ↓
Copy Agent writes human-readable summary:
  - Top 5 pain points
  - Quick wins (easy fixes)
  - Strategic opportunities
  - Competitive positioning gaps
  ↓
Packaging creates branded PDF report
  ↓
Human approval → Report delivered to client email
  ↓
Report includes:
  - Free value (the audit itself)
  - "Fix This" CTAs linked to service packages
  - Checkout link for Starter package
```

**Conversion target**: 5-15% of free audits → paid work

## Funnel 2: Content Marketing / Portfolio

**Flow**:
```
Blog posts showing design transformations
  + Case studies from approved work
  + Newsletter showcasing studio capabilities
  + Social media clips (motion, design, 3D)
  ↓
Organic traffic → Landing page → Free audit funnel
```

**Content sources**:
- Every approved project becomes a case study
- Weekly newsletter from studio research
- Monthly design insight articles
- Motion clips from Aurora productions

## Funnel 3: Inbound Referrals

**Flow**:
```
Satisfied client refers new client
  ↓
Referral landing page with pre-filled context
  ↓
Free audit funnel (expedited)
```

## Funnel 4: Compliant Job Platform Presence

**IMPORTANT**: Direct automated browsing/applying on platforms like Upwork is prohibited by their ToS. Instead:

**Compliant approach**:
```
1. Maintain polished Upwork/freelancer profiles (human-managed)
2. Studio generates draft proposals based on job descriptions
3. Human reviews and submits proposals
4. Use platform APIs where available
5. Track opportunities in studio/jobs/inbox/
```

**What agents CAN do**:
- Draft proposal text based on job descriptions
- Generate relevant portfolio links
- Suggest pricing based on job complexity
- Prepare response templates

**What agents CANNOT do**:
- Log into platforms autonomously
- Submit applications without human review
- Scrape platform listings (check ToS first)
- Automate messaging on restricted platforms

## Funnel 5: Twilio Voice/SMS

**Capabilities**:
- Automated appointment scheduling
- SMS follow-ups after audit delivery
- Voice-based intake for clients who prefer calling
- Notification system for operators

**Architecture**:
```yaml
Twilio Integration:
  voice:
    inbound: Receive client calls → transcribe → create intake job
    outbound: Follow-up calls (human-approved script only)
  sms:
    inbound: Receive text inquiries → create intake job
    outbound: Audit delivery notification, appointment reminders
  constraints:
    - All outbound communication requires human approval
    - No unsolicited marketing calls/texts (TCPA compliance)
    - Call recordings stored with consent only
    - Scripts reviewed before use
```

## Lead Data Model

```yaml
Lead:
  id: uuid
  source: organic|referral|audit_funnel|platform|inbound_call|sms
  url: string
  name: string
  email: string
  phone: string (optional)
  goals: string
  competitors: string[]
  audit_score: float (if completed)
  status: new|audited|proposal_sent|converted|declined|dormant
  created_at: datetime
  last_contact: datetime
  conversion_value: integer (cents)
  notes: string
```

## Privacy & Compliance

1. Collect minimum necessary data
2. Clear opt-in for marketing communications
3. TCPA compliance for voice/SMS
4. CAN-SPAM compliance for emails
5. GDPR awareness for EU leads
6. No data resale
7. Delete dormant leads after 12 months
8. All personal data encrypted at rest
