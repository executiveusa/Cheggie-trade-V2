export interface ConversationEntry {
  id: string
  source: 'chatgpt' | 'claude' | 'notion' | 'custom'
  title: string
  messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp?: string }>
  imported_at: string
  tags: string[]
}

export interface SecondBrainEntry {
  id: string
  type: 'conversation' | 'document' | 'note' | 'project'
  title: string
  content: string
  source: string
  created_at: string
  updated_at: string
  tags: string[]
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function parseChatGPTExport(jsonData: string): ConversationEntry[] {
  const data = JSON.parse(jsonData) as Array<{
    title?: string
    mapping?: Record<string, { message?: { content?: { parts?: unknown[]; }; author?: { role?: string } }; id?: string }>
    create_time?: number
  }>
  if (!Array.isArray(data)) return []

  return data.map(conv => {
    const messages: ConversationEntry['messages'] = []
    if (conv.mapping) {
      Object.values(conv.mapping).forEach(node => {
        const msg = node.message
        if (!msg?.content?.parts?.length) return
        const content = msg.content.parts
          .filter((p): p is string => typeof p === 'string')
          .join(' ')
          .trim()
        if (!content) return
        const role = msg.author?.role === 'assistant' ? 'assistant' : 'user'
        messages.push({ role, content })
      })
    }
    return {
      id: generateId(),
      source: 'chatgpt' as const,
      title: conv.title || 'Sin título',
      messages,
      imported_at: new Date().toISOString(),
      tags: ['chatgpt'],
    }
  }).filter(c => c.messages.length > 0)
}

export function parseClaudeExport(jsonData: string): ConversationEntry[] {
  const data = JSON.parse(jsonData) as {
    conversations: Array<{
      uuid: string
      name: string
      chat_messages: Array<{
        sender: 'human' | 'assistant'
        content: string | Array<{ type: string; text?: string }>
        created_at: string
      }>
    }>
  }
  if (!data.conversations) return []

  return data.conversations.map(conv => {
    const messages: ConversationEntry['messages'] = conv.chat_messages.map(m => {
      let content = ''
      if (typeof m.content === 'string') {
        content = m.content
      } else if (Array.isArray(m.content)) {
        content = m.content.filter(c => c.type === 'text').map(c => c.text || '').join(' ')
      }
      return {
        role: (m.sender === 'human' ? 'user' : 'assistant') as 'user' | 'assistant',
        content,
        timestamp: m.created_at,
      }
    }).filter(m => m.content.trim())

    return {
      id: conv.uuid || generateId(),
      source: 'claude' as const,
      title: conv.name || 'Conversación sin título',
      messages,
      imported_at: new Date().toISOString(),
      tags: ['claude'],
    }
  }).filter(c => c.messages.length > 0)
}

export function parseNotionExport(files: { name: string; content: string }[]): SecondBrainEntry[] {
  return files.map(f => {
    const title = f.name
      .replace(/\s[a-f0-9]{32}\.md$/, '')
      .replace(/\.md$/, '')
    return {
      id: generateId(),
      type: 'document' as const,
      title,
      content: f.content,
      source: 'notion',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: ['notion'],
    }
  })
}

export function autoParseExport(content: string, filename: string): ConversationEntry[] | SecondBrainEntry[] {
  if (!filename.endsWith('.json')) {
    return parseNotionExport([{ name: filename, content }])
  }
  try {
    const data = JSON.parse(content)
    if (Array.isArray(data) && data[0]?.mapping !== undefined) {
      return parseChatGPTExport(content)
    }
    if (data.conversations) {
      return parseClaudeExport(content)
    }
  } catch { /* not json */ }
  return parseNotionExport([{ name: filename, content }])
}

export function conversationToEntry(conv: ConversationEntry): SecondBrainEntry {
  return {
    id: conv.id,
    type: 'conversation',
    title: conv.title,
    content: conv.messages.map(m => `[${m.role}]: ${m.content}`).join('\n\n'),
    source: conv.source,
    created_at: conv.imported_at,
    updated_at: conv.imported_at,
    tags: conv.tags,
  }
}
