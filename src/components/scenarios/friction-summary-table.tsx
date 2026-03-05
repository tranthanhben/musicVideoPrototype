'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { frictionSummary } from '@/lib/mock/scenarios'

export function FrictionSummaryTable() {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-7">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full py-3.5 px-5 rounded-xl text-[13px] font-semibold cursor-pointer',
          'bg-muted/50 border border-border text-foreground/70',
          'flex items-center justify-between transition-colors hover:bg-muted'
        )}
      >
        <span className="flex items-center gap-2">
          <Search className="h-3.5 w-3.5" />
          Friction summary: what the agentic system solves
        </span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 border border-border rounded-xl overflow-hidden">
              {frictionSummary.map((row, i) => (
                <div
                  key={i}
                  className={cn(
                    'grid grid-cols-[140px_1fr_1fr]',
                    i < frictionSummary.length - 1 && 'border-b border-border/50'
                  )}
                >
                  <div className="p-3.5 bg-muted/40 border-r border-border/50 text-[11px] font-bold text-muted-foreground flex items-center">
                    {row.category}
                  </div>
                  <div className="p-3.5 border-r border-border/50 text-xs leading-relaxed" style={{ color: 'rgba(255,107,107,0.8)' }}>
                    {row.before}
                  </div>
                  <div className="p-3.5 text-xs leading-relaxed" style={{ color: 'rgba(139,92,246,0.9)' }}>
                    {row.after}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
