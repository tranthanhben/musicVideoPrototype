'use client'

import type { ReactNode } from 'react'

interface CollapsiblePhaseProps {
  title: string
  index: number
  isActive: boolean
  isComplete: boolean
  onActivate: () => void
  children: ReactNode
}

export function CollapsiblePhase({
  title,
  index,
  isActive,
  isComplete,
  onActivate,
  children,
}: CollapsiblePhaseProps) {
  return (
    <div className="border-b border-[var(--border)]">
      <button
        onClick={onActivate}
        className="w-full flex items-center justify-between py-4 text-left transition-opacity duration-200 hover:opacity-70 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-[14px] text-[var(--muted-foreground)] tabular-nums w-4">
            {index}
          </span>
          <span
            className="text-[18px] leading-[1.75]"
            style={{ color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)' }}
          >
            {title}
          </span>
        </div>
        {isComplete && !isActive && (
          <span className="text-[14px] text-[var(--muted-foreground)]">done</span>
        )}
        {isActive && (
          <span className="text-[14px] text-[var(--accent)]">active</span>
        )}
      </button>

      {isActive && (
        <div className="pb-8 transition-all duration-200">
          {children}
        </div>
      )}
    </div>
  )
}
