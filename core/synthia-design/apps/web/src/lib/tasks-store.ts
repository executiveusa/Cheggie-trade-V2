export interface Task {
  id: string
  type: string
  title: string
  description: string
  agent: string
  status: 'queued' | 'running' | 'complete' | 'failed'
  repoUrl?: string
  output: string[]
  createdAt: string
  updatedAt: string
  udecScore?: number
}

export interface ConnectedRepo {
  id: string
  url: string
  owner: string
  name: string
  branch: string
  addedAt: string
  lastScanned?: string
  violations: number
  udecScore?: number
  token?: string
}

// In-memory stores (persist across requests in same process)
const tasks = new Map<string, Task>()
const repos = new Map<string, ConnectedRepo>()

let taskCounter = 0

export function createTask(data: Omit<Task, 'id' | 'output' | 'createdAt' | 'updatedAt'>): Task {
  const id = `task_${++taskCounter}_${Date.now()}`
  const task: Task = {
    ...data,
    id,
    output: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  tasks.set(id, task)
  return task
}

export function getTask(id: string): Task | undefined {
  return tasks.get(id)
}

export function updateTask(id: string, updates: Partial<Task>): Task | undefined {
  const task = tasks.get(id)
  if (!task) return undefined
  const updated = { ...task, ...updates, updatedAt: new Date().toISOString() }
  tasks.set(id, updated)
  return updated
}

export function listTasks(): Task[] {
  return Array.from(tasks.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function deleteTask(id: string): boolean {
  return tasks.delete(id)
}

export function appendTaskOutput(id: string, line: string): void {
  const task = tasks.get(id)
  if (!task) return
  task.output.push(line)
  task.updatedAt = new Date().toISOString()
}

export function addRepo(data: Omit<ConnectedRepo, 'id' | 'addedAt' | 'violations'>): ConnectedRepo {
  const id = `repo_${Date.now()}`
  const repo: ConnectedRepo = {
    ...data,
    id,
    violations: 0,
    addedAt: new Date().toISOString(),
  }
  repos.set(id, repo)
  return repo
}

export function getRepo(id: string): ConnectedRepo | undefined {
  return repos.get(id)
}

export function updateRepo(id: string, updates: Partial<ConnectedRepo>): ConnectedRepo | undefined {
  const repo = repos.get(id)
  if (!repo) return undefined
  const updated = { ...repo, ...updates }
  repos.set(id, updated)
  return updated
}

export function listRepos(): ConnectedRepo[] {
  return Array.from(repos.values()).sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  )
}

export function deleteRepo(id: string): boolean {
  return repos.delete(id)
}
