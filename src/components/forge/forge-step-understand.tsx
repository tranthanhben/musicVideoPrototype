'use client'

import { motion } from 'framer-motion'
import { Music, Zap, Clock, BarChart3, Layers } from 'lucide-react'
import { mockProjects } from '@/lib/mock/projects'

const audio = mockProjects[0].audio

const ANALYSIS_ITEMS = [
  { icon: Zap, label: 'BPM', value: String(audio.bpm), color: 'text-violet-400' },
  { icon: Music, label: 'Key', value: 'A Minor', color: 'text-cyan-400' },
  { icon: Clock, label: 'Duration', value: '3:12', color: 'text-pink-400' },
  { icon: BarChart3, label: 'Beats', value: `${audio.beatMarkers.length}`, color: 'text-yellow-400' },
  { icon: Layers, label: 'Sections', value: 'Intro · Verse · Chorus · Bridge · Outro', color: 'text-green-400' },
]

function AnimatedWaveform() {
  const bars = Array.from({ length: 60 }, (_, i) => i)
  return (
    <div className="flex items-center justify-center gap-[3px] h-24 w-full px-4">
      {bars.map((i) => {
        const height = 20 + Math.sin(i * 0.4) * 14 + Math.sin(i * 0.9 + 1) * 10
        return (
          <motion.div
            key={i}
            className="rounded-full bg-primary/70"
            style={{ width: 4 }}
            initial={{ height: 4, opacity: 0.3 }}
            animate={{
              height: [4, height, height * 0.6, height],
              opacity: [0.3, 1, 0.7, 1],
            }}
            transition={{
              duration: 1.8,
              delay: i * 0.018,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
          />
        )
      })}
    </div>
  )
}

export function ForgeStepUnderstand() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto px-6">
      {/* Waveform */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl border border-border bg-card/50 p-4"
      >
        <p className="text-xs text-muted-foreground mb-2 font-mono">{audio.title} — {audio.artist}</p>
        <AnimatedWaveform />
      </motion.div>

      {/* Analysis results */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ANALYSIS_ITEMS.map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
            className="flex items-start gap-3 rounded-lg border border-border bg-card/40 p-3"
          >
            <item.icon className={`h-4 w-4 mt-0.5 shrink-0 ${item.color}`} />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
              <p className="text-sm font-semibold text-foreground mt-0.5 leading-tight">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
