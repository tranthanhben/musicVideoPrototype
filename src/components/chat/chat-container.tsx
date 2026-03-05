'use client'

import { useRef, useEffect } from 'react'
import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/lib/chat/types'
import { MessageBubble } from './message-bubble'
import { useChatStore } from '@/lib/chat/store'

interface ChatContainerProps {
  messages: ChatMessage[]
  onAction?: (action: string) => void
  className?: string
}

export function ChatContainer({ messages, onAction, className }: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isStreaming = useChatStore((s) => s.isStreaming)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, messages[messages.length - 1]?.content])

  return (
    <div
      ref={scrollRef}
      className={cn(
        'flex-1 overflow-y-auto px-4 py-6 space-y-4 scroll-smooth',
        className
      )}
    >
      {messages.length === 0 && !isStreaming && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <Bot className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">AI Producer is ready</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Send a message or click a suggestion to begin</p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onAction={onAction} />
      ))}

      {isStreaming && (
        <div className="flex gap-3 max-w-[85%]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <Bot className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="rounded-2xl px-4 py-3 bg-card border border-border rounded-tl-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{animationDelay:'0ms'}} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{animationDelay:'150ms'}} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{animationDelay:'300ms'}} />
            </div>
          </div>
        </div>
      )}

      <div ref={undefined} />
    </div>
  )
}
