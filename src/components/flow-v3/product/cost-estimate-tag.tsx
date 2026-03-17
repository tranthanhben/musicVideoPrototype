'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CostEstimateTagProps {
  credits: number
  label?: string
  size?: 'sm' | 'md'
}

export function CostEstimateTag({ credits, label, size = 'md' }: CostEstimateTagProps) {
  const isSm = size === 'sm'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-medium tabular-nums',
        isSm
          ? 'text-[9px] border-amber-500/20 bg-amber-500/10 text-amber-400/70'
          : 'text-[11px] border-amber-500/25 bg-amber-500/10 text-amber-400',
      )}
    >
      <Sparkles className={cn('shrink-0', isSm ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
      <span>{credits.toLocaleString()} credits</span>
      {label && <span className="opacity-70">{label}</span>}
    </span>
  )
}
