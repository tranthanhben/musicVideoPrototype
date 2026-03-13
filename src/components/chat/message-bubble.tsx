'use client'

import { cn } from '@/lib/utils'
import { Bot, User, ChevronRight } from 'lucide-react'
import type { ChatMessage } from '@/lib/chat/types'
import { ArtifactCardRenderer } from './artifact-cards'

interface MessageBubbleProps {
  message: ChatMessage
  onAction?: (action: string) => void
}

export function MessageBubble({ message, onAction }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-3 max-w-[85%]', isUser ? 'ml-auto flex-row-reverse' : '')}>
      {/* Avatar */}
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={cn('flex flex-col gap-2', isUser ? 'items-end' : 'items-start')}>
        {/* Text content */}
        <div className={cn(
          'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-card text-card-foreground border border-border rounded-tl-sm'
        )}>
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse rounded-sm" />
          )}
        </div>

        {/* Artifacts */}
        {message.artifacts?.map((artifact) => (
          <ArtifactCardRenderer key={artifact.id} artifact={artifact} onAction={onAction} />
        ))}

        {/* Action buttons — with attention-drawing animations */}
        {message.actions && !message.isStreaming && (
          <div className="flex gap-2 flex-wrap animate-[fadeSlideUp_0.4s_ease-out]">
            {message.actions.map((action) => (
              <button
                key={action.action}
                onClick={() => onAction?.(action.action)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  action.variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25 animate-[ctaPulse_2s_ease-in-out_infinite] flex items-center gap-1',
                  action.variant === 'secondary' && 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border',
                  action.variant === 'destructive' && 'bg-destructive text-white hover:bg-destructive/90',
                )}
              >
                {action.label}
                {action.variant === 'primary' && <ChevronRight className="h-3 w-3" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
