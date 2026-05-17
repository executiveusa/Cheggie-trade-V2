'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AGENTS } from '@/lib/studio-config'
import { Suspense } from 'react'

const C = {
  border: 'rgba(255,255,255,0.07)',
  surface: 'rgba(255,255,255,0.025)',
  gold: '#c9a96e',
  goldDim: 'rgba(201,169,110,0.08)',
  text: '#f0ede6',
  muted: '#8a8780',
  dim: '#5a5855',
  success: '#6ea87e',
  error: '#e87070',
}

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  ts: Date
}

const STARTER_PROMPTS = [
  'Audit my landing page against all 14 design laws',
  'Build a 3D world from a product photo using Lyra',
  'What agents should handle a SaaS onboarding redesign?',
  'Score my site on the UDEC 14-axis framework',
  'Batch-apply cinematic motion standards to my repo',
  'Plan a brand refresh using the design standards',
]

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.75rem 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '4px', height: '4px', borderRadius: '50%', background: C.dim,
          animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: '1.25rem',
    }}>
      {!isUser && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, marginRight: '0.75rem',
          background: 'rgba(201,169,110,0.12)', border: `1px solid rgba(201,169,110,0.2)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px',
        }}>
          <span style={{ fontSize: '0.625rem', letterSpacing: '0.06em', color: C.gold }}>C</span>
        </div>
      )}
      <div style={{
        maxWidth: '72%',
        background: isUser ? 'rgba(201,169,110,0.1)' : C.surface,
        border: `1px solid ${isUser ? 'rgba(201,169,110,0.2)' : C.border}`,
        borderRadius: isUser ? '14px 14px 2px 14px' : '2px 14px 14px 14px',
        padding: '0.875rem 1.125rem',
      }}>
        <p style={{
          fontSize: '0.875rem',
          color: isUser ? C.text : C.muted,
          lineHeight: 1.65,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {msg.content}
        </p>
        <p style={{ fontSize: '0.5625rem', color: '#3a3835', marginTop: '0.375rem', textAlign: isUser ? 'right' : 'left' }}>
          {msg.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

function CommandPageInner() {
  const searchParams = useSearchParams()
  const targetAgent = searchParams.get('agent')
  const agent = AGENTS.find(a => a.id === targetAgent)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: agent
        ? `You're now connected to **${agent.name}** — ${agent.role}.\n\n${agent.scope}\n\nHow can I help you today?`
        : `Welcome to the Cynthia Studio Command Center.\n\nI have access to all 12 agents, the skills registry, design laws, and your connected repos. I can:\n\n• Plan and route tasks to the right agents\n• Audit work against UDEC 14-axis framework\n• Apply design standards across repos\n• Generate implementation plans using Lyra, OpenClaw, motion skills, and more\n\nWhat would you like to build or improve?`,
      ts: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function send(text?: string) {
    const content = (text ?? input).trim()
    if (!content || streaming) return

    setInput('')
    const userMsg: Message = { id: `u_${Date.now()}`, role: 'user', content, ts: new Date() }
    setMessages(prev => [...prev, userMsg])

    const assistantId = `a_${Date.now()}`
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', ts: new Date() }])
    setStreaming(true)

    const allMessages = [...messages, userMsg]
      .filter(m => m.id !== 'welcome')
      .map(m => ({ role: m.role, content: m.content }))

    if (allMessages.length === 0) {
      allMessages.push({ role: 'user', content })
    }

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          context: agent ? `User is working with agent: ${agent.name} (${agent.role})` : undefined,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json() as { error?: string }
        if (err.error?.includes('ANTHROPIC_API_KEY')) setApiKeyMissing(true)
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: err.error ?? 'Something went wrong.' } : m
        ))
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data) as { text?: string; error?: string }
            if (parsed.error) {
              accumulated = `Error: ${parsed.error}`
            } else if (parsed.text) {
              accumulated += parsed.text
            }
            setMessages(prev => prev.map(m =>
              m.id === assistantId ? { ...m, content: accumulated } : m
            ))
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: 'Connection error. Is the API key configured?' } : m
        ))
      }
    } finally {
      setStreaming(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
    if (e.key === 'Escape' && streaming) {
      abortRef.current?.abort()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>

      {/* Header */}
      <div style={{ padding: '1.5rem 0 1rem', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {agent ? (
            <>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.success, boxShadow: `0 0 6px ${C.success}88` }} />
              <span style={{ fontSize: '0.8125rem', color: C.text }}>{agent.name}</span>
              <span style={{ fontSize: '0.75rem', color: C.dim }}>— {agent.role}</span>
            </>
          ) : (
            <>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.gold, boxShadow: `0 0 6px ${C.gold}88` }} />
              <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.text }}>CYNTHIA</span>
              <span style={{ fontSize: '0.75rem', color: C.dim }}>Studio Command · All 12 agents</span>
            </>
          )}
        </div>
        {apiKeyMissing && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(232,112,112,0.08)', border: `1px solid rgba(232,112,112,0.2)`, borderRadius: '7px' }}>
            <p style={{ fontSize: '0.8125rem', color: C.error }}>
              <strong>ANTHROPIC_API_KEY not configured.</strong> Add it to <code style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.3rem', borderRadius: '3px' }}>apps/web/.env.local</code>:
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: C.muted, marginTop: '0.375rem' }}>ANTHROPIC_API_KEY=sk-ant-…</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 0' }}>
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {streaming && messages[messages.length - 1]?.content === '' && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Starter prompts (only when just welcome message) */}
      {messages.length === 1 && (
        <div style={{ padding: '0 0 1rem', flexShrink: 0 }}>
          <p style={{ fontSize: '0.5625rem', color: C.dim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.625rem' }}>Suggested</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {STARTER_PROMPTS.map(prompt => (
              <button
                key={prompt}
                onClick={() => send(prompt)}
                style={{
                  padding: '0.4375rem 0.875rem',
                  borderRadius: '100px',
                  background: 'transparent',
                  border: `1px solid ${C.border}`,
                  color: C.dim,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 150ms ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '0 0 1.5rem', flexShrink: 0 }}>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'flex-end',
          background: C.surface,
          border: `1px solid ${streaming ? 'rgba(201,169,110,0.3)' : C.border}`,
          borderRadius: '12px',
          padding: '0.75rem 0.875rem',
          transition: 'border-color 150ms ease',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={streaming ? 'Responding… (Esc to stop)' : 'Ask anything — design standards, agent routing, batch updates, 3D worlds…'}
            disabled={streaming}
            rows={1}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: C.text,
              fontSize: '0.875rem',
              lineHeight: 1.6,
              resize: 'none',
              fontFamily: 'inherit',
              maxHeight: '120px',
              overflowY: 'auto',
            }}
          />
          <button
            onClick={() => streaming ? abortRef.current?.abort() : send()}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: streaming ? 'rgba(232,112,112,0.15)' : input.trim() ? C.gold : 'rgba(255,255,255,0.04)',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 150ms ease',
            }}
            aria-label={streaming ? 'Stop generation' : 'Send'}
          >
            {streaming ? (
              <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: C.error }} />
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2 7h10M8 3l4 4-4 4" stroke={input.trim() ? '#0d0f0e' : C.dim} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
        <p style={{ fontSize: '0.5625rem', color: '#2a2825', marginTop: '0.375rem', textAlign: 'center' }}>
          ↵ send · Shift+↵ newline · Esc stop · Powered by Claude claude-opus-4-7
        </p>
      </div>

      {/* Typing animation */}
      <style>{`
        @keyframes typing-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default function CommandPage() {
  return (
    <Suspense>
      <CommandPageInner />
    </Suspense>
  )
}
