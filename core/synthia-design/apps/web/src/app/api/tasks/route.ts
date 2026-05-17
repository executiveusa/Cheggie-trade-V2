import { NextRequest, NextResponse } from 'next/server'
import { createTask, listTasks, updateTask, deleteTask, getTask } from '@/lib/tasks-store'
import { AGENTS, TASK_ROUTING } from '@/lib/studio-config'

export async function GET() {
  return NextResponse.json({ tasks: listTasks() })
}

export async function POST(req: NextRequest) {
  let body: { type: string; title: string; description: string; repoUrl?: string }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { type, title, description, repoUrl } = body
  if (!type || !title) {
    return NextResponse.json({ error: 'type and title are required' }, { status: 400 })
  }

  const agentId = TASK_ROUTING[type] ?? 'concierge'
  const agent = AGENTS.find(a => a.id === agentId) ?? AGENTS[0]

  const task = createTask({
    type,
    title: title.slice(0, 200),
    description: (description ?? '').slice(0, 2000),
    agent: agent.name,
    status: 'queued',
    repoUrl,
  })

  return NextResponse.json({ task }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  let body: Partial<{ status: string; output: string[]; udecScore: number }>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const task = updateTask(id, body as Parameters<typeof updateTask>[1])
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

  return NextResponse.json({ task })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  if (!getTask(id)) return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  deleteTask(id)
  return NextResponse.json({ ok: true })
}
