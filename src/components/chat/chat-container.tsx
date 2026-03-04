'use client'

import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/lib/chat/types'
import { MessageBubble } from './message-bubble'

interface ChatContainerProps {
  messages: ChatMessage[]
  onAction?: (action: string) => void
  className?: string
}

export function ChatContainer({ messages, onAction, className }: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

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
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} onAction={onAction} />
      ))}
    </div>
  )
}
