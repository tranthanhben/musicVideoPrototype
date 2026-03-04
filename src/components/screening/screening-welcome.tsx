'use client'

import { Bot } from 'lucide-react'

const SUGGESTIONS = [
  { text: 'Create a music video', icon: '🎬' },
  { text: 'Show me what you can do', icon: '✨' },
  { text: 'I have a song to visualize', icon: '🎵' },
  { text: 'Start with a demo track', icon: '🚀' },
]

interface ScreeningWelcomeProps {
  onSuggestion: (text: string) => void
}

export function ScreeningWelcome({ onSuggestion }: ScreeningWelcomeProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
        <Bot className="h-8 w-8" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-2">
        Welcome to Screening Room
      </h1>
      <p className="text-muted-foreground text-sm max-w-sm mb-8 leading-relaxed">
        Your AI music video producer. Describe your song or vision — I&apos;ll
        direct the entire production and narrate every step along the way.
      </p>

      <div className="flex flex-wrap gap-2 justify-center max-w-md">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.text}
            onClick={() => onSuggestion(s.text)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:bg-muted hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <span>{s.icon}</span>
            <span>{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
