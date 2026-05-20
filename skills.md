# CheggieTrade Skills

## Philosophy
Skills are internal capabilities used by Hermes/Cheggie Agent. End users only receive clear Serbian-first outcomes with optional English/Spanish locale outputs.

## Skill Registry
- analyze-asset (implemented, tradingagents)
- comparable-company-analysis (available_as_reference, anthropic_financial_services)
- discounted-cash-flow (available_as_reference, approval required)
- earnings-analysis (available_as_reference)
- earnings-preview (available_as_reference)
- sector-overview (available_as_reference)
- thesis-tracking (not_implemented)
- catalyst-tracking (not_implemented)
- idea-generation (available_as_reference)
- portfolio-rebalance (not_implemented, approval required)
- tax-loss-harvesting (not_implemented, approval required)

## Financial-Services Command Mapping
- /comps -> comparable-company-analysis
- /dcf -> discounted-cash-flow
- /earnings -> earnings-analysis
- /earnings-preview -> earnings-preview
- /sector -> sector-overview
- /thesis -> thesis-tracking
- /catalysts -> catalyst-tracking
- /screen -> idea-generation
- /rebalance -> portfolio-rebalance
- /tlh -> tax-loss-harvesting

## Forbidden Actions
- trade execution
- money transfer
- broker login without approval
- profit guarantee
- regulated advice claims
- exposing internal skill/tool/provider/model names in consumer-facing UI

## Approval Policy
- High-risk skills (DCF, rebalance, TLH) require explicit approval before execution.
- If execution runtime is unavailable, Hermes returns structured `available_as_reference` or `not_implemented` status without crashing.
- Financial research disclaimer must be attached to all user-visible outputs.
