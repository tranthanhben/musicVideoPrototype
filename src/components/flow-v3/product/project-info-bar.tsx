'use client'

import { useState, useRef } from 'react'
import { Cloud, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectInfoBarProps {
  name: string
  onNameChange: (name: string) => void
  onSettingsClick?: () => void
}

export function ProjectInfoBar({ name, onNameChange, onSettingsClick }: ProjectInfoBarProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit() {
    setDraft(name)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  function commitEdit() {
    const trimmed = draft.trim()
    if (trimmed) onNameChange(trimmed)
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <div className="flex items-center gap-2 px-4 py-1 border-b border-border bg-card/30 shrink-0">
      {/* Project name */}
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          className="text-[11px] font-semibold text-foreground bg-primary/10 border border-primary/30 rounded-md px-2 py-0.5 focus:outline-none min-w-0 flex-1 max-w-[200px]"
          autoFocus
        />
      ) : (
        <button
          onClick={startEdit}
          className="text-[11px] font-semibold text-foreground hover:text-primary transition-colors cursor-pointer truncate max-w-[200px]"
          title="Click to rename"
        >
          {name}
        </button>
      )}

      {/* Auto-save indicator */}
      <div className="flex items-center gap-1 text-[10px] text-emerald-500">
        <Cloud className="h-3 w-3" />
        <span>Saved</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings button */}
      <button
        onClick={onSettingsClick}
        className="flex items-center justify-center rounded-md p-1 text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
        title="Project settings"
        aria-label="Project settings"
      >
        <Settings className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
