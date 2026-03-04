'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Bot, Cpu, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ForgeAnnotation {
  id: string
  agentName: string
  agentType: string
  message: string
}

interface ForgeAnnotationCardProps {
  annotations: ForgeAnnotation[]
}

function AgentIcon({ type }: { type: string }) {
  const cls = 'h-3.5 w-3.5'
  if (type === 'mcp') return <Cpu className={cls} />
  if (type === 'skill') return <Zap className={cls} />
  return <Bot className={cls} />
}

function typeColor(type: string) {
  if (type === 'mcp') return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
  if (type === 'skill') return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
  return 'text-violet-400 border-violet-500/30 bg-violet-500/10'
}

export function ForgeAnnotationCard({ annotations }: ForgeAnnotationCardProps) {
  const visible = annotations.slice(-3)

  return (
    <div className="absolute right-4 top-16 z-40 flex flex-col gap-2 w-64">
      <AnimatePresence mode="popLayout">
        {visible.map((ann) => (
          <motion.div
            key={ann.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className={cn(
              'rounded-lg border px-3 py-2 backdrop-blur-sm shadow-lg',
              typeColor(ann.agentType),
            )}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <AgentIcon type={ann.agentType} />
              <span className="text-[10px] font-semibold tracking-wide uppercase opacity-80">
                {ann.agentName}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-foreground/80 line-clamp-2">
              {ann.message}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
