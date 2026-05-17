'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '@/components/ui/Toast'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  generation?: { resultUrl: string; tool: string; prompt?: string }
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

interface GenerationHistoryItem {
  url: string
  tool: string
  timestamp: number
}

export function useChat() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversationId, setConversationId] = useState<string>('')
  const [generationHistory, setGenerationHistory] = useState<GenerationHistoryItem[]>([])
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const storedId = localStorage.getItem('synthia_active_conversation')
    const id = storedId || generateId()
    setConversationId(id)
    if (!storedId) localStorage.setItem('synthia_active_conversation', id)

    const stored = localStorage.getItem(`synthia_messages_${id}`)
    if (stored) {
      try { setMessages(JSON.parse(stored)) } catch { /* empty */ }
    }
  }, [])

  const saveMessages = useCallback((msgs: Message[], id: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem(`synthia_messages_${id}`, JSON.stringify(msgs))
      // Update conversations index
      const convs = JSON.parse(localStorage.getItem('synthia_conversations') || '[]')
      const idx = convs.findIndex((c: { id: string }) => c.id === id)
      const firstMsg = msgs.find(m => m.role === 'user')
      const title = firstMsg ? firstMsg.content.slice(0, 36) : 'Nueva conversación'
      if (idx >= 0) convs[idx] = { id, title, updatedAt: new Date().toISOString() }
      else convs.unshift({ id, title, updatedAt: new Date().toISOString() })
      localStorage.setItem('synthia_conversations', JSON.stringify(convs.slice(0, 50)))
    }, 500)
  }, [])

  const send = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return

    const userMsg: Message = { id: generateId(), role: 'user', content, timestamp: Date.now() }
    const assistantMsg: Message = { id: generateId(), role: 'assistant', content: '', timestamp: Date.now() }

    const newMessages = [...messages, userMsg, assistantMsg]
    setMessages(newMessages)
    setIsStreaming(true)

    try {
      const apiMessages = newMessages
        .filter(m => m.role !== 'assistant' || m.content !== '')
        .slice(0, -1)
        .map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })

      if (!res.ok || !res.body) throw new Error('Failed to stream')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullContent += decoder.decode(value, { stream: true })
        setMessages(prev => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last.role === 'assistant') last.content = fullContent
          return updated
        })
      }

      // Check if tool call
      let finalMessages = newMessages
      try {
        const trimmed = fullContent.trim()
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          const toolCall = JSON.parse(trimmed) as { tool: string; params: Record<string, unknown>; query?: string }
          if (toolCall.tool) {
            const muapiKey = typeof window !== 'undefined'
              ? (await import('@/lib/key-manager').then(m => m.getKey('muapi'))) || ''
              : ''

            const genRes = await fetch('/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tool: toolCall.tool, params: toolCall.params, muapiKey }),
            })

            if (genRes.ok) {
              const genData = await genRes.json() as { result_url: string; tool: string }
              const genMsg: Message = {
                id: generateId(),
                role: 'assistant',
                content: '',
                timestamp: Date.now(),
                generation: { resultUrl: genData.result_url, tool: genData.tool, prompt: (toolCall.params?.prompt as string) || '' },
              }
              finalMessages = [...newMessages.slice(0, -1), { ...assistantMsg, content: '✓ Generación completada' }, genMsg]
              setMessages(finalMessages)
              setGenerationHistory(prev => [{ url: genData.result_url, tool: genData.tool, timestamp: Date.now() }, ...prev].slice(0, 20))
              toast({ message: '✓ Generación completada', type: 'success' })
            } else {
              const errData = await genRes.json() as { message?: string }
              toast({ message: errData.message || 'Error al generar. Intenta de nuevo.', type: 'error', duration: 6000 })
            }
          }
        }
      } catch { /* not a tool call */ }

      saveMessages(finalMessages, conversationId)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Error desconocido'
      setMessages(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last.role === 'assistant') last.content = `Error: ${errMsg}`
        return updated
      })
      toast({ message: `Error de conexión: ${errMsg}`, type: 'error', duration: 6000 })
    } finally {
      setIsStreaming(false)
    }
  }, [messages, isStreaming, conversationId, saveMessages])

  const clearConversation = useCallback(() => {
    const newId = generateId()
    setMessages([])
    setConversationId(newId)
    localStorage.setItem('synthia_active_conversation', newId)
  }, [])

  const loadConversation = useCallback((id: string) => {
    setConversationId(id)
    localStorage.setItem('synthia_active_conversation', id)
    const stored = localStorage.getItem(`synthia_messages_${id}`)
    if (stored) {
      try { setMessages(JSON.parse(stored)) } catch { setMessages([]) }
    } else {
      setMessages([])
    }
  }, [])

  return { messages, isStreaming, send, clearConversation, conversationId, loadConversation, generationHistory }
}
