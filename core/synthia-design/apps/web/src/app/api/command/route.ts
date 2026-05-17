/**
 * AI Command Interface — Streaming response from Cynthia's agent network
 * Uses Server-Sent Events for real-time token streaming
 */

import { NextRequest } from 'next/server'
import { AGENTS, SKILLS, DESIGN_LAWS, UDEC_AXES } from '@/lib/studio-config'
import { listTasks, listRepos } from '@/lib/tasks-store'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-opus-4-7'

function buildCommandSystemPrompt(): string {
  const agentList = AGENTS.map(a =>
    `**${a.name}** (${a.id}) — ${a.role}: ${a.scope}`
  ).join('\n')

  const skillList = SKILLS.map(s =>
    `- **${s.name}** [${s.domain}]: ${s.description}`
  ).join('\n')

  const lawList = DESIGN_LAWS.map(l =>
    `${l.n}. **${l.title}**: ${l.rule}`
  ).join('\n')

  const udecList = UDEC_AXES.map(a =>
    `- ${a.id} (${a.name}, weight ${a.weight}${a.blocker ? ', BLOCKER' : ''})`
  ).join('\n')

  return `You are Cynthia — the autonomous AI design studio command interface.

You have direct access to 12 specialized agents, a skills registry, and strict quality enforcement.

## ACTIVE AGENTS
${agentList}

## SKILLS REGISTRY (OpenClaw-style)
${skillList}

## 14 DESIGN LAWS (Non-Negotiable)
${lawList}

## UDEC SCORING AXES
${udecList}
Floor: 8.5 composite. MOT + ACC are BLOCKERS (< 7.0 = full rebuild).

## REPO SCANNER CAPABILITIES
You can analyze connected GitHub repos for design violations. Violations detected:
- Banned fonts (Inter, Roboto, Arial, etc.)
- Purple/neon color usage
- scroll event listeners (should use IntersectionObserver)
- TODO/FIXME stubs in shipped code
- Missing prefers-reduced-motion guards

## BATCH UPDATE CAPABILITIES
You can propose batch design standard updates across all connected repos:
- Apply design laws to existing codebases
- Replace banned fonts with approved alternatives
- Fix scroll listeners → IntersectionObserver
- Add prefers-reduced-motion guards
- Apply UDEC scoring to existing work

## HOW TO HELP
- Answer questions about design standards, agents, skills
- Propose and plan tasks (create task, assign agent, outline deliverables)
- Audit and score design work against UDEC framework
- Plan batch updates across connected repos
- Explain any of the 14 design laws or UDEC axes
- Generate implementation plans using specific skills

Respond clearly and concisely. Use markdown formatting. Be specific about which agents and skills to use.`
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not set. Add it to .env.local' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let body: { messages: Array<{ role: 'user' | 'assistant'; content: string }>; context?: string }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const { messages, context } = body
  if (!messages?.length) return new Response('messages is required', { status: 400 })

  // Inject live context (tasks + repos) into system prompt
  const tasks = listTasks().slice(0, 5)
  const repos = listRepos()

  const liveContext = [
    tasks.length > 0 ? `\n## RECENT TASKS\n${tasks.map(t => `- [${t.status.toUpperCase()}] ${t.title} → ${t.agent}`).join('\n')}` : '',
    repos.length > 0 ? `\n## CONNECTED REPOS\n${repos.map(r => `- ${r.owner}/${r.name} (${r.violations} violations, last scanned: ${r.lastScanned ?? 'never'})`).join('\n')}` : '',
    context ? `\n## ADDITIONAL CONTEXT\n${context}` : '',
  ].filter(Boolean).join('\n')

  const systemPrompt = buildCommandSystemPrompt() + liveContext

  // Use streaming API
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const res = await fetch(ANTHROPIC_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-beta': 'messages-2023-12-15',
          },
          body: JSON.stringify({
            model: MODEL,
            max_tokens: 4096,
            stream: true,
            system: systemPrompt,
            messages: messages.map(m => ({ role: m.role, content: m.content })),
          }),
        })

        if (!res.ok || !res.body) {
          const errText = await res.text()
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errText })}\n\n`))
          controller.close()
          return
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data) as {
                type: string
                delta?: { type: string; text: string }
              }
              if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`)
                )
              }
            } catch {
              // skip malformed chunks
            }
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`)
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
