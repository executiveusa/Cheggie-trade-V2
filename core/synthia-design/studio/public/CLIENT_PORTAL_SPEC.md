# Client Portal Specification — Cynthia Design Studio
# Version: 1.0.0

## Overview

The client portal is where clients can:
- Track their active projects
- View the design room (live agent work)
- Review and approve deliverables
- Access delivered assets
- View audit reports
- Manage billing

## Views

### 1. Project Dashboard
- Active projects with status (intake → building → review → delivered)
- Timeline of events for each project
- Agent assignment visibility
- Current UDEC score (if in review)
- Budget/cost tracking
- Delivery ETA

### 2. Design Room (Live View)
- Per-project workspace showing:
  - Active agent cards (who is working, what they're doing)
  - Artifact preview panel (HTML preview, copy draft, etc.)
  - Review score panel (14-axis radar chart)
  - Event feed (timestamped actions)
- Read-only for clients (operator controls separate)
- Mobile-responsive

### 3. Deliverables Library
- All delivered assets organized by project
- Download links for each deliverable
- Audit score card
- Version history

### 4. Audit Reports
- All completed audits
- Full 14-axis score breakdown
- Improvement recommendations
- Progress tracking (if iterating)

### 5. Billing
- Invoice history
- Payment status
- Subscription management (if applicable)
- Receipt downloads

## Technical Implementation
- Part of the Next.js web app (web/)
- Protected routes (authentication required)
- Real-time updates via SSE (Server-Sent Events)
- Mobile-first responsive design
- Follows Cynthia design standards (UDEC 8.5+ for our own UI)

## Authentication
- Email magic link (primary)
- Password (secondary)
- OAuth (future: Google, GitHub)
- MFA encouraged for enterprise clients

## Data Access Rules
- Clients see only their own projects
- Clients cannot see internal agent memory
- Clients cannot modify doctrine or standards
- Clients can approve/reject deliverables
- Clients can request revisions (creates new job)
