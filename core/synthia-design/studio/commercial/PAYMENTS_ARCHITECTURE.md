# Payments Architecture — Cynthia Design Studio
# Version: 1.0.0
# Date: 2026-04-04

## Overview

Cynthia supports payment collection for design services through a multi-provider architecture. The system separates quoting, invoicing, checkout, fulfillment, and revenue tracking into distinct stages with explicit approval gates.

## Payment Flow

```
QUOTE/PROPOSAL
  ↓ (agent-generated, human-approved)
INVOICE / CHECKOUT LINK
  ↓ (generated via provider API)
PAYMENT CAPTURED
  ↓ (webhook confirmation)
FULFILLMENT RELEASED
  ↓ (automated after payment confirmation)
REVENUE RECORDED
  ↓ (append-only ledger)
DELIVERY COMPLETED
```

## Provider Stack

### Tier 1: Stripe (Primary)
- **Role**: Default payment processor for card payments
- **Integration**: Stripe Checkout Sessions + Payment Intents
- **Capabilities**: Cards, Apple Pay, Google Pay, Link
- **Tax handling**: Stripe Tax (optional, or handle via Creem)
- **Webhook**: `studio/commercial/webhooks/stripe.ts`
- **Status**: Production-ready

### Tier 2: Creem (Merchant of Record)
- **Role**: Software sales, global tax/compliance, subscription management
- **Integration**: Creem API (https://www.creem.io/)
- **Capabilities**: Merchant-of-record, tax compliance, revenue splits, global payments
- **Best for**: Recurring subscriptions, software license sales, international tax handling
- **Webhook**: `studio/commercial/webhooks/creem.ts`
- **Status**: Evaluate for subscription products and international sales
- **When to use over Stripe**: When tax/compliance burden is high, when selling software globally, when revenue splits are needed

### Tier 3: Cash App Pay
- **Role**: Alternative payment method for US customers
- **Integration**: Via Square/Cash App Pay SDK (official seller docs)
- **Capabilities**: Direct Cash App payments
- **Best for**: US-based customers who prefer Cash App
- **Status**: Supported where available via official integration paths only
- **Constraint**: Must use official Square/Cash App Pay API. No unofficial integrations.

### Not Supported (by policy)
- **PayPal**: Excluded by default
- **Crypto**: Only via clearly separated, policy-gated flows with explicit compliance review

## Data Model

```yaml
Payment:
  id: uuid
  job_id: uuid             # linked to studio job
  provider: stripe|creem|cashapp
  status: pending|captured|failed|refunded
  amount_cents: integer
  currency: USD|EUR|MXN
  description: string
  invoice_url: string
  checkout_url: string
  created_at: datetime
  captured_at: datetime
  metadata:
    client_id: string
    task_type: string
    deliverables: string[]
```

## Approval Gates

### Autonomous (no human needed):
- Generate quote/proposal document
- Create draft invoice
- Generate checkout link (but not send)
- Record payment webhook event
- Update payment status
- Trigger fulfillment after confirmed payment

### Human Approval Required:
- Send invoice/checkout link to client
- Issue refunds
- Create payout/withdrawal
- Modify pricing
- Accept payment for new service types
- Create subscription plans
- Configure new payment providers
- Handle disputed charges

## Revenue Tracking

Append-only ledger at `studio/commercial/ledger/`

```yaml
Entry:
  date: date
  job_id: uuid
  client: string
  amount_cents: integer
  currency: string
  provider: string
  type: payment|refund|payout
  status: confirmed|pending
  notes: string
```

## Security Rules

1. No payment credentials in code — use Infisical or environment variables
2. Webhook signatures must be verified before processing
3. No PII stored in plain text in the repo
4. Payment state changes are audit-logged
5. Refund authority requires human approval
6. Payout routing requires human approval
7. All amounts as integers (cents) to avoid float precision issues
