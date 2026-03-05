'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Lightbulb, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpotlightTooltipProps {
  text: string
  visible: boolean
  onDismiss: () => void
}

export function SpotlightTooltip({ text, visible, onDismiss }: SpotlightTooltipProps) {
  const [show, setShow] = useState(visible)

  useEffect(() => {
    if (visible) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        onDismiss()
      }, 8000)
      return () => clearTimeout(timer)
    } else {
      setShow(false)
    }
  }, [visible, text, onDismiss])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={text}
          initial={{ opacity: 0, y: -12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'absolute top-4 left-1/2 -translate-x-1/2 z-50',
            'flex items-start gap-3 max-w-md w-full mx-auto px-4 py-3 rounded-xl',
            'bg-primary/10 backdrop-blur-md border border-primary/30 shadow-lg shadow-primary/10',
          )}
        >
          <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-foreground/90 flex-1 leading-relaxed">{text}</p>
          <button
            onClick={() => { setShow(false); onDismiss() }}
            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
