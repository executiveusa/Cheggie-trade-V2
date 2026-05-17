import { NextRequest, NextResponse } from 'next/server'
import { addRepo, listRepos, deleteRepo, updateRepo, getRepo } from '@/lib/tasks-store'
import { ANTI_PATTERNS } from '@/lib/studio-config'

export async function GET() {
  return NextResponse.json({ repos: listRepos() })
}

export async function POST(req: NextRequest) {
  let body: { url: string; token?: string; branch?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { url, token, branch } = body
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 })

  // Parse GitHub URL → owner/name
  let owner = '', name = ''
  try {
    const parsed = new URL(url)
    const parts = parsed.pathname.replace(/^\//, '').replace(/\.git$/, '').split('/')
    owner = parts[0] ?? ''
    name = parts[1] ?? ''
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  if (!owner || !name) {
    return NextResponse.json({ error: 'Could not parse owner/name from URL' }, { status: 400 })
  }

  const repo = addRepo({
    url,
    owner,
    name,
    branch: branch ?? 'main',
    token,
  })

  return NextResponse.json({ repo }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  deleteRepo(id)
  return NextResponse.json({ ok: true })
}

// ─── Repo Scan ──────────────────────────────────────────────────────────────

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const repo = getRepo(id)
  if (!repo) return NextResponse.json({ error: 'Repo not found' }, { status: 404 })

  const token = repo.token ?? process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  try {
    // Fetch file tree from GitHub API
    const treeRes = await fetch(
      `https://api.github.com/repos/${repo.owner}/${repo.name}/git/trees/${repo.branch}?recursive=1`,
      { headers }
    )

    if (!treeRes.ok) {
      return NextResponse.json({ error: `GitHub API error: ${treeRes.status}` }, { status: 502 })
    }

    const treeData = await treeRes.json() as { tree: Array<{ path: string; type: string }> }
    const files = treeData.tree.filter(f => f.type === 'blob')

    // Scan file contents for known anti-patterns (sample up to 20 JS/TS/CSS/HTML files)
    const scanable = files
      .filter(f => /\.(js|ts|jsx|tsx|css|html)$/.test(f.path))
      .slice(0, 20)

    const violations: Array<{ file: string; pattern: string; severity: string }> = []

    for (const file of scanable) {
      const contentRes = await fetch(
        `https://api.github.com/repos/${repo.owner}/${repo.name}/contents/${file.path}`,
        { headers }
      )
      if (!contentRes.ok) continue

      const contentData = await contentRes.json() as { content?: string }
      if (!contentData.content) continue

      const decoded = Buffer.from(contentData.content, 'base64').toString('utf-8')

      // Check against anti-pattern signatures
      const patterns: Array<[RegExp, string]> = [
        [/font-family:\s*['"]?(Inter|Roboto|Arial|Helvetica|Open Sans|Montserrat|Poppins|Lato)/gi, 'banned-font'],
        [/#800080|#a020f0|\bpurple\b|\bviolet\b/gi, 'purple-color'],
        [/addEventListener\(['"]scroll['"]/g, 'scroll-listener'],
        [/\/\/\s*TODO|\/\/\s*FIXME|\/\/\s*STUB|\/\*\s*TODO/gi, 'todo-stub'],
        [/@keyframes|animation:|transition:[^;]+(?<!prefers-reduced-motion)/g, 'missing-reduced-motion'],
      ]

      for (const [regex, patternId] of patterns) {
        if (regex.test(decoded)) {
          const ap = ANTI_PATTERNS.find(p => p.id === patternId)
          violations.push({
            file: file.path,
            pattern: ap?.description ?? patternId,
            severity: ap?.severity ?? 'warning',
          })
        }
      }
    }

    const updated = updateRepo(id, {
      lastScanned: new Date().toISOString(),
      violations: violations.length,
    })

    return NextResponse.json({ repo: updated, violations, filesScanned: scanable.length })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
