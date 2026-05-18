# Checkout Options — Cynthia Design Studio
# Version: 1.0.0

## Available Checkout Methods

| Method | Provider | Region | Best For | Status |
|--------|----------|--------|----------|--------|
| Credit/Debit Card | Stripe | Global | Default for all clients | Active |
| Apple Pay | Stripe | Global (Apple devices) | Low-friction mobile | Active |
| Google Pay | Stripe | Global (Android/Chrome) | Low-friction mobile | Active |
| Stripe Link | Stripe | Global | Returning customers | Active |
| Cash App Pay | Square/Cash App | US only | US casual payments | Planned |
| Creem Checkout | Creem | Global | Software/subscriptions | Planned |

## Service Tiers

| Tier | Price Range | Typical Deliverables | Payment Method |
|------|------------|---------------------|----------------|
| Starter | $500-$2,000 | Single landing page, basic audit | Stripe one-time |
| Standard | $2,000-$10,000 | Multi-page site, copy + design | Stripe milestone |
| Premium | $10,000-$50,000 | Full campaign, motion, 3D | Stripe milestone |
| Enterprise | $50,000+ | Ongoing design ops | Creem subscription |
| Audit Only | $0 (free) → $200 | Site analysis + report | Free or Stripe |

## Checkout Flow

```
1. Client reviews proposal
2. Client clicks "Approve & Pay" button
3. → Stripe Checkout Session opens
4. Client enters payment method
5. Payment captured
6. Webhook confirms → fulfillment triggered
7. Deliverables released
8. Receipt sent automatically
```

## Subscription Model (via Creem)

For ongoing design operations:
- Monthly retainer
- Creem handles tax, compliance, billing
- Studio receives net revenue after Creem fees
- Client gets portal for managing subscription

## Free Audit Funnel → Conversion

```
1. Free site audit (automated)
2. Report delivered with improvement opportunities
3. Report includes "Fix This" CTA → Starter package
4. Checkout link embedded in report
5. Payment → work begins automatically
```
