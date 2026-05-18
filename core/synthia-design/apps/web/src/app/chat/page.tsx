'use client'

import { useState } from 'react'
import Sidebar from '@/components/chat/Sidebar'
import ChatMain from '@/components/chat/ChatMain'
import ContextPanel from '@/components/chat/ContextPanel'
import { useChat } from '@/hooks/useChat'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function ChatPage() {
  const { messages, isStreaming, send, clearConversation, conversationId, loadConversation, generationHistory } = useChat()
  const [inputValue, setInputValue] = useState('')

  function handleSend(content: string) {
    setInputValue('')
    send(content)
  }

  return (
    <div style={{ display: 'flex', height: '100dvh', background: 'var(--color-dark)', overflow: 'hidden' }}>
      {/* Sidebar — hidden on mobile */}
      <div style={{ display: 'flex' }} className="chat-sidebar">
        <Sidebar
          conversationId={conversationId}
          onNewConversation={clearConversation}
          onSelectConversation={loadConversation}
        />
      </div>

      <ErrorBoundary>
        <ChatMain
          messages={messages}
          isStreaming={isStreaming}
          onSend={handleSend}
          onClear={clearConversation}
          inputValue={inputValue}
          onInputChange={setInputValue}
        />
      </ErrorBoundary>

      {/* Context panel — hidden on mobile */}
      <div style={{ display: 'flex' }} className="chat-context">
        <ContextPanel isGenerating={isStreaming} history={generationHistory} />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .chat-sidebar, .chat-context { display: none !important; }
        }
      `}</style>
    </div>
  )
}
