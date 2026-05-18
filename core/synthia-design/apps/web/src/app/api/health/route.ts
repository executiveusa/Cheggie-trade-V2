import { NextResponse } from 'next/server'
import { listTasks, listRepos } from '@/lib/tasks-store'

export async function GET() {
  const tasks = listTasks()
  const repos = listRepos()

  return NextResponse.json({
    status: 'ok',
    service: 'cynthia-studio-os',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    built_on: 'HERMES execution layer + Claude claude-opus-4-7',
    powered_by: 'Anthropic Claude',
    stats: {
      tasks_total: tasks.length,
      tasks_running: tasks.filter(t => t.status === 'running').length,
      tasks_complete: tasks.filter(t => t.status === 'complete').length,
      repos_connected: repos.length,
      agents_available: 12,
    },
    capabilities: [
      'multi-repo-scanning',
      'agent-routing',
      'udec-scoring',
      'batch-design-updates',
      '3d-world-generation',
      'ai-command-streaming',
      'agent-spawn',
      'mcp-compatible',
      'fastapi-endpoint',
    ],
  })
}
