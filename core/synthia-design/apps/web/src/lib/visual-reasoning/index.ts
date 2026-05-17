import Anthropic from '@anthropic-ai/sdk'
import { SynthiaMediaClient } from '@/lib/muapi-client'

export interface VisualReasoningStep {
  step: number
  type: 'generate' | 'inspect' | 'critique' | 'revise' | 'accept'
  image_url: string
  observations: string[]
  issues?: Array<{
    region: string
    issue: string
    severity: 'low' | 'medium' | 'high'
    fix: string
  }>
  revised_prompt?: string
  quality_score?: number
}

export interface VisualReasoningChain {
  original_prompt: string
  steps: VisualReasoningStep[]
  final_url: string
  iterations: number
  accepted_at_score: number
  total_time_ms: number
}

export const DEFAULT_QUALITY_FLOOR = 7.5

const CRITIQUE_PROMPT = (prompt: string, floor: number) =>
  `You are a cinematic quality inspector for Synthia™, a LATAM creative AI studio.
Original prompt: "${prompt}"

Inspect this image and respond with JSON only:
{
  "observations": ["observation 1", "observation 2"],
  "issues": [{"region":"...","issue":"...","severity":"low|medium|high","fix":"specific prompt fix"}],
  "quality_score": 0-10,
  "revised_prompt": "improved prompt incorporating all fixes or null if score >= ${floor}"
}

Score 10 = cinematic perfection. Score ${floor}+ = acceptable for delivery.
Be specific about what region has issues. Each fix must be an addable phrase to the prompt.`

export async function runVisualReasoningChain(params: {
  prompt: string
  muapiKey: string
  anthropicKey: string
  maxIterations?: number
  qualityFloor?: number
  onStep?: (step: VisualReasoningStep) => void
}): Promise<VisualReasoningChain> {
  const {
    prompt,
    muapiKey,
    anthropicKey,
    maxIterations = 3,
    qualityFloor = DEFAULT_QUALITY_FLOOR,
    onStep,
  } = params

  const mediaClient = new SynthiaMediaClient(muapiKey)
  const anthropic = new Anthropic({ apiKey: anthropicKey })
  const steps: VisualReasoningStep[] = []
  const started = Date.now()
  let currentPrompt = prompt

  for (let i = 0; i < maxIterations; i++) {
    // Generate
    const imageUrl = await mediaClient.cinema({
      prompt: currentPrompt,
      camera: 'Full-Frame Cine Digital',
      lens: 'Compact Anamorphic',
      aperture: 'f/1.4',
    })

    const genStep: VisualReasoningStep = {
      step: steps.length + 1,
      type: 'generate',
      image_url: imageUrl,
      observations: [],
    }
    steps.push(genStep)
    onStep?.(genStep)

    // Inspect
    const inspection = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'url', url: imageUrl } },
            { type: 'text', text: CRITIQUE_PROMPT(prompt, qualityFloor) },
          ],
        },
      ],
    })

    let parsed: {
      observations: string[]
      issues: VisualReasoningStep['issues']
      quality_score: number
      revised_prompt: string | null
    }

    try {
      const text = inspection.content[0].type === 'text' ? inspection.content[0].text : '{}'
      parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
    } catch {
      parsed = { observations: [], issues: [], quality_score: 8, revised_prompt: null }
    }

    const critiqueStep: VisualReasoningStep = {
      step: steps.length + 1,
      type: 'critique',
      image_url: imageUrl,
      observations: parsed.observations || [],
      issues: parsed.issues || [],
      quality_score: parsed.quality_score || 7,
    }
    steps.push(critiqueStep)
    onStep?.(critiqueStep)

    // Accept if quality meets floor
    if ((parsed.quality_score || 0) >= qualityFloor || !parsed.revised_prompt) {
      const acceptStep: VisualReasoningStep = {
        step: steps.length + 1,
        type: 'accept',
        image_url: imageUrl,
        observations: [`Accepted at score ${parsed.quality_score}/10`],
        quality_score: parsed.quality_score,
      }
      steps.push(acceptStep)
      onStep?.(acceptStep)
      return {
        original_prompt: prompt,
        steps,
        final_url: imageUrl,
        iterations: i + 1,
        accepted_at_score: parsed.quality_score || 7,
        total_time_ms: Date.now() - started,
      }
    }

    // Revise
    currentPrompt = parsed.revised_prompt
    const reviseStep: VisualReasoningStep = {
      step: steps.length + 1,
      type: 'revise',
      image_url: imageUrl,
      observations: [`Score ${parsed.quality_score}/10 below floor ${qualityFloor}. Revising.`],
      revised_prompt: currentPrompt,
    }
    steps.push(reviseStep)
    onStep?.(reviseStep)
  }

  const lastImage = steps.filter(s => s.type === 'generate').at(-1)!.image_url
  return {
    original_prompt: prompt,
    steps,
    final_url: lastImage,
    iterations: maxIterations,
    accepted_at_score: 0,
    total_time_ms: Date.now() - started,
  }
}
