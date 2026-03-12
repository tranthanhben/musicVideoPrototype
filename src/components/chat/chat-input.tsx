'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatSuggestion } from '@/lib/chat/types'

interface ChatInputProps {
  onSend: (message: string) => void
  placeholder?: string
  disabled?: boolean
  suggestions?: ChatSuggestion[]
  className?: string
}

export function ChatInput({
  onSend, placeholder = 'Type a message...', disabled, suggestions, className,
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const [dismissing, setDismissing] = useState(false)
  const [clickedIdx, setClickedIdx] = useState<number | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    inputRef.current?.focus()
  }

  function handleChipClick(text: string, idx: number) {
    if (disabled || dismissing) return
    setClickedIdx(idx)
    setDismissing(true)
    setTimeout(() => {
      onSend(text)
      setDismissing(false)
      setClickedIdx(null)
    }, 350)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={cn('border-t border-border bg-background p-4', className)}>
      {/* Suggestion chips */}
      <AnimatePresence mode="popLayout">
        {suggestions && suggestions.length > 0 && !dismissing && (
          <motion.div
            className="flex gap-2 mb-3 flex-wrap"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.2 } }}
          >
            {suggestions.map((s, idx) => (
              <motion.button
                key={s.text}
                onClick={() => handleChipClick(s.text, idx)}
                disabled={disabled}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{
                  opacity: clickedIdx === idx ? 0.6 : 1,
                  scale: clickedIdx === idx ? 0.92 : 1,
                }}
                whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.06)' }}
                whileTap={{ scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="px-3 py-1.5 text-xs rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
              >
                {s.icon && <span className="mr-1">{s.icon}</span>}
                {s.text}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 min-h-[40px] max-h-[120px]"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
