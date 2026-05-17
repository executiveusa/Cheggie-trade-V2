/**
 * Cynthia Studio Gateway — OpenClaw-inspired routing layer
 *
 * All agent task requests flow through here. The gateway:
 * 1. Classifies the task type from natural language
 * 2. Routes to the correct agent based on TASK_ROUTING map
 * 3. Creates a task record and begins async execution
 * 4. Returns the task ID for status polling
 *
 * Reference architecture: https://github.com/openclaw/openclaw (gateway pattern)
 */

import { NextRequest, NextResponse } from 'next/server'
import { AGENTS, TASK_ROUTING, SKILLS, DESIGN_LAWS } from '@/lib/studio-config'
import { createTask, updateTask, appendTaskOutput } from '@/lib/tasks-store'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-opus-4-7'

function buildClassifierPrompt(userMessage: string): string {
  const taskTypes = Object.keys(TASK_ROUTING).join(', ')
  return `You are the Studio Concierge for Cynthia, an autonomous design studio.

Classify this request into one task type: ${taskTypes}

Respond with ONLY a JSON object: {"type": "<task-type>", "title": "<short title 5-8 words>", "agent": "<agent-id>"}

Request: "${userMessage}"`
}

function buildSystemPrompt(): string {
  const agentList = AGENTS.map(a => `- ${a.name} (${a.id}): ${a.role} — ${a.scope}`).join('\n')
  const skillList = SKILLS.map(s => `- ${s.name}: ${s.description}`).join('\n')
  const lawList = DESIGN_LAWS.map(l => `${l.n}. ${l.title}: ${l.rule}`).join('\n')

  return `You are Cynthia — an autonomous AI design studio with 12 specialized agents.

## AGENTS
${agentList}

## SKILLS REGISTRY
${skillList}

## DESIGN LAWS (Non-Negotiable)
${lawList}

## QUALITY GATE
UDEC 8.5 minimum. MOT (Motion) and ACC (Accessibility) below 7.0 = blocker.

## YOUR ROLE
Route requests to the right agent, apply relevant skills, enforce design laws.
When asked to execute a task, provide a detailed implementation plan with specific agents involved,
skills to apply, and deliverables to produce. Be specific about what violates design laws.`
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 503 })
  }

  let body: { message: string; mode?: 'classify' | 'execute' }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { message, mode = 'execute' } = body
  if (!message) return NextResponse.json({ error: 'message is required' }, { status: 400 })

  if (mode === 'classify') {
    // Quick classification only
    const res = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 256,
        messages: [{ role: 'user', content: buildClassifierPrompt(message) }],
      }),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Anthropic API error' }, { status: 502 })
    }

    const data = await res.json() as { content: Array<{ text: string }> }
    const text = data.content[0]?.text ?? '{}'

    try {
      const classified = JSON.parse(text) as { type: string; title: string; agent: string }
      const task = createTask({
        type: classified.type ?? 'site-audit',
        title: classified.title ?? message.slice(0, 60),
        description: message,
        agent: classified.agent ?? 'concierge',
        status: 'queued',
      })
      return NextResponse.json({ task, classified })
    } catch {
      return NextResponse.json({ error: 'Classification failed', raw: text }, { status: 500 })
    }
  }

  // Execute mode: create task + run agent
  const task = createTask({
    type: 'gateway',
    title: message.slice(0, 60),
    description: message,
    agent: 'concierge',
    status: 'running',
  })

  // Kick off async execution (don't await — return task ID immediately)
  executeTask(task.id, message, apiKey).catch(console.error)

  return NextResponse.json({ task }, { status: 202 })
}

async function executeTask(taskId: string, message: string, apiKey: string) {
  try {
    appendTaskOutput(taskId, `[CONCIERGE] Routing task to studio agents...`)

    const res = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        system: buildSystemPrompt(),
        messages: [{ role: 'user', content: message }],
      }),
    })

    if (!res.ok) {
      updateTask(taskId, { status: 'failed' })
      appendTaskOutput(taskId, `[ERROR] Anthropic API error: ${res.status}`)
      return
    }

    const data = await res.json() as { content: Array<{ text: string }> }
    const responseText = data.content[0]?.text ?? ''

    // Parse response into output lines
    const lines = responseText.split('\n').filter(l => l.trim())
    for (const line of lines) {
      appendTaskOutput(taskId, line)
    }

    updateTask(taskId, { status: 'complete' })
    appendTaskOutput(taskId, `[DONE] Task complete.`)
  } catch (err) {
    updateTask(taskId, { status: 'failed' })
    appendTaskOutput(taskId, `[ERROR] ${String(err)}`)
  }
}
