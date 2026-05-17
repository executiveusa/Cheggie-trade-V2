'use client'

import { useEffect, useRef } from 'react'
import GenerationCard from './GenerationCard'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  generation?: { resultUrl: string; tool: string; prompt?: string }
}

interface ChatMainProps {
  messages: Message[]
  isStreaming: boolean
  onSend: (content: string) => void
  onClear: () => void
  inputValue: string
  onInputChange: (v: string) => void
}

export default function ChatMain({ messages, isStreaming, onSend, onClear, inputValue, onInputChange }: ChatMainProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function autoResize() {
    if (!textareaRef.current) return
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 144) + 'px'
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inputValue.trim() && !isStreaming) {
        onSend(inputValue)
      }
    }
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* Header */}
      <div style={{
        height: '56px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.25rem',
        flexShrink: 0,
        background: 'var(--color-dark)',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.625rem',
          color: 'var(--color-primary)',
          background: 'rgba(196,150,60,0.1)',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          letterSpacing: '0.08em',
        }}>
          claude-sonnet-4 · Synthia™
        </span>
        <button
          onClick={onClear}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          Limpiar
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Synthia™</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--color-muted)', maxWidth: '360px', margin: '0 auto', lineHeight: 1.6 }}>
              ¿Qué quieres crear hoy? Puedo generar imágenes, videos, contenido, o simplemente conversar.
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '0.375rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--color-muted)', letterSpacing: '0.08em' }}>
              {msg.role === 'assistant' ? 'Synthia™' : 'Tú'} · {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
            {msg.generation ? (
              <GenerationCard resultUrl={msg.generation.resultUrl} tool={msg.generation.tool} prompt={msg.generation.prompt} />
            ) : (
              <div style={{
                maxWidth: '520px',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: msg.role === 'user' ? 'rgba(196,150,60,0.12)' : 'var(--color-surface)',
                border: `1px solid ${msg.role === 'user' ? 'rgba(196,150,60,0.2)' : 'var(--color-border)'}`,
                fontSize: '0.9375rem',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {msg.content}
                {isStreaming && msg.role === 'assistant' && msg === messages[messages.length - 1] && (
                  <span style={{ display: 'inline-block', width: '2px', height: '1em', background: 'var(--color-primary)', marginLeft: '2px', animation: 'blink 1s step-end infinite', verticalAlign: 'text-bottom' }} />
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        flexShrink: 0,
        background: 'var(--color-surface-2)',
        borderTop: '1px solid var(--color-border)',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '0.75rem',
        minHeight: '72px',
      }}>
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={e => { onInputChange(e.target.value); autoResize() }}
          onKeyDown={handleKeyDown}
          placeholder="¿Qué quieres crear hoy?"
          rows={1}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '0.9375rem',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.5,
            maxHeight: '144px',
            overflowY: 'auto',
          }}
        />
        <button
          onClick={() => inputValue.trim() && !isStreaming && onSend(inputValue)}
          disabled={!inputValue.trim() || isStreaming}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: inputValue.trim() && !isStreaming ? 'var(--color-primary)' : 'var(--color-border)',
            color: 'var(--color-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '1rem',
            transition: 'background 0.15s',
          }}
        >
          ↑
        </button>
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  )
}
