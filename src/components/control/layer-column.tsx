'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle } from 'lucide-react'
import { AgentActivityItem } from './agent-activity-item'
import { getLayerDef } from '@/lib/pipeline/constants'
import { addUserMessage, streamResponse } from '@/lib/chat/simulator'
import type { PipelineLayer, PipelineLayerId } from '@/lib/pipeline/types'

const LAYER_COLORS: Record<PipelineLayerId, { border: string; glow: string; badge: string }> = {
  L1_INPUT:        { border: '#3B82F6', glow: 'rgba(59,130,246,0.15)', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  L2_CREATIVE:     { border: '#A855F7', glow: 'rgba(168,85,247,0.15)', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  L3_PREPRODUCTION:{ border: '#06B6D4', glow: 'rgba(6,182,212,0.15)',  badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  L4_PRODUCTION:   { border: '#EAB308', glow: 'rgba(234,179,8,0.15)',  badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  L5_POSTPRODUCTION:{ border: '#EC4899', glow: 'rgba(236,72,153,0.15)', badge: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
}

const SHORT_NAMES: Record<PipelineLayerId, string> = {
  L1_INPUT: 'L1',
  L2_CREATIVE: 'L2',
  L3_PREPRODUCTION: 'L3',
  L4_PRODUCTION: 'L4',
  L5_POSTPRODUCTION: 'L5',
}

const TYPE_BADGE: Record<string, string> = {
  agent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  mcp: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  skill: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

interface Props {
  layerId: PipelineLayerId
  layer: PipelineLayer
}

export function LayerColumn({ layerId, layer }: Props) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const def = getLayerDef(layerId)
  const colors = LAYER_COLORS[layerId]
  const shortName = SHORT_NAMES[layerId]
  const isActive = layer.status === 'active'
  const isComplete = layer.status === 'complete'

  const allComponents = [
    ...def.agents.map((n) => ({ name: n, type: 'agent' })),
    ...def.mcps.map((n) => ({ name: n, type: 'mcp' })),
    ...def.skills.map((n) => ({ name: n, type: 'skill' })),
  ]

  const activeAgentNames = new Set(layer.activities.map((a) => a.agentName))

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [layer.activities])

  function handleSend() {
    const msg = input.trim()
    if (!msg) return
    setInput('')
    addUserMessage(`[${shortName}] ${msg}`)
    streamResponse({
      text: `Acknowledged. ${def.name} layer is ${layer.status}. Progress: ${layer.progress}%. ${layer.activities.length} activities logged.`,
      charDelay: 20,
    })
  }

  const borderColor = isComplete ? '#10B981' : isActive ? colors.border : 'var(--border)'
  const glowStyle = isActive ? { boxShadow: `0 0 20px ${colors.glow}` } : {}

  return (
    <div
      className="flex flex-col border-r border-border/30 last:border-r-0 min-h-0"
      style={{ borderTopWidth: 2, borderTopStyle: 'solid', borderTopColor: borderColor, ...glowStyle, transition: 'border-color 0.4s, box-shadow 0.4s' }}
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-border/30">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono font-bold ${colors.badge}`}>
            {shortName}
          </span>
          {isComplete && <CheckCircle className="w-3 h-3 text-emerald-400" />}
          {isActive && (
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-current"
              style={{ color: colors.border }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          )}
          <span
            className={`text-[10px] font-medium ml-auto ${isComplete ? 'text-emerald-400' : isActive ? 'text-foreground/70' : 'text-foreground/30'}`}
          >
            {layer.status}
          </span>
        </div>

        <p className="text-[11px] text-foreground/60 leading-snug truncate" title={def.name}>
          {def.name}
        </p>

        {/* Progress bar */}
        <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: isComplete ? '#10B981' : colors.border }}
            animate={{ width: `${layer.progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-[9px] text-foreground/30 font-mono mt-0.5 block">{layer.progress}%</span>
      </div>

      {/* Components list */}
      <div className="px-3 py-2 border-b border-border/30 space-y-1">
        {allComponents.map((comp) => {
          const isComponentActive = activeAgentNames.has(comp.name)
          return (
            <div
              key={comp.name}
              className={`flex items-center gap-1.5 transition-opacity ${isComponentActive ? 'opacity-100' : 'opacity-30'}`}
            >
              <span className={`text-[8px] px-1 py-0.5 rounded border uppercase tracking-wide ${TYPE_BADGE[comp.type] ?? ''}`}>
                {comp.type}
              </span>
              <span className="text-[10px] text-foreground/70 truncate">{comp.name}</span>
            </div>
          )
        })}
      </div>

      {/* Activity feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-1 min-h-0">
        <AnimatePresence initial={false}>
          {layer.activities.map((activity) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AgentActivityItem activity={activity} />
            </motion.div>
          ))}
        </AnimatePresence>
        {layer.activities.length === 0 && (
          <p className="text-[10px] text-foreground/20 font-mono mt-2">Waiting...</p>
        )}
      </div>

      {/* Artifacts thumbnails */}
      {layer.artifacts.length > 0 && (
        <div className="px-3 py-2 border-t border-border/30 flex gap-1.5 overflow-x-auto">
          {layer.artifacts.slice(0, 4).map((art) => (
            <div
              key={art.id}
              className="shrink-0 w-10 h-10 rounded overflow-hidden border border-border"
              title={art.name}
            >
              <img src={art.thumbnailUrl} alt={art.name} className="w-full h-full object-cover" />
            </div>
          ))}
          {layer.artifacts.length > 4 && (
            <div className="shrink-0 w-10 h-10 rounded border border-border flex items-center justify-center bg-muted/40">
              <span className="text-[9px] text-foreground/40">+{layer.artifacts.length - 4}</span>
            </div>
          )}
        </div>
      )}

      {/* Mini chat input */}
      <div className="px-2 py-2 border-t border-border/30 flex gap-1.5">
        <input
          className="flex-1 bg-muted/40 rounded text-[10px] px-2 py-1.5 text-foreground/70 placeholder:text-foreground/20 border border-border focus:outline-none focus:border-border/60 min-w-0"
          placeholder={`Message ${shortName}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded text-foreground/30 hover:text-foreground/70 disabled:opacity-30 transition-colors"
        >
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
