'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import type { QualityGateId } from '@/lib/pipeline/types'

interface ReelGateNotificationProps {
  gate: { gateId: QualityGateId; message: string } | null
  onResolve: (result: 'pass' | 'revise') => void
}

export function ReelGateNotification({ gate, onResolve }: ReelGateNotificationProps) {
  const [approved, setApproved] = useState(false)
  const scoreRef = useRef(85 + Math.floor(Math.random() * 15))

  useEffect(() => {
    if (gate) {
      scoreRef.current = 85 + Math.floor(Math.random() * 15)
      setApproved(false)
    }
  }, [gate?.gateId])

  function handleApprove() {
    setApproved(true)
    setTimeout(() => onResolve('pass'), 1500)
  }

  function handleRevise() {
    onResolve('revise')
  }

  const visible = !!gate

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={gate!.gateId}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`shrink-0 flex items-center justify-between gap-4 px-4 py-2.5 border-b border-border text-sm ${
            approved ? 'bg-green-500/20 border-green-500/30' : 'bg-amber-500/15 border-amber-500/20'
          }`}
        >
          {approved ? (
            <div className="flex items-center gap-2 text-green-400 font-medium">
              <Check className="h-4 w-4" />
              <span>Approved — advancing to next layer</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-amber-300">
                <span className="font-semibold">{gate!.gateId}:</span>
                <span className="text-amber-200/80 truncate max-w-md">{gate!.message}</span>
                <span className="ml-2 font-bold text-amber-300">Score {scoreRef.current}/100</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleApprove}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-500 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                  Approve
                </button>
                <button
                  onClick={handleRevise}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Revise
                </button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
