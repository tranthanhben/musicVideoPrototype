'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePipelineStore } from '@/lib/pipeline/store'
import { mockProjects } from '@/lib/mock/projects'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'
import { GenerationLoading } from '@/components/shared/generation-loading'
import { SceneGrid } from '@/components/editor/scene-grid'
import { SimpleTimeline } from '@/components/editor/simple-timeline'
import type { PipelineLayerId } from '@/lib/pipeline/types'

const project = mockProjects[0]
const audio = project.audio

const MOOD_GRADIENTS = [
  ['from-violet-600', 'to-cyan-400'],
  ['from-pink-500', 'to-orange-400'],
  ['from-blue-600', 'to-emerald-400'],
  ['from-amber-500', 'to-rose-500'],
  ['from-indigo-500', 'to-purple-400'],
  ['from-teal-500', 'to-cyan-300'],
]

const STYLE_TAGS = ['Cinematic', 'Sci-Fi', 'Romantic', 'Epic', 'Ethereal', 'Cosmic']

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function L1Content() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="w-full max-w-lg bg-card border border-border rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Audio Analysis</h2>
        {/* Waveform SVG */}
        <div className="h-16 w-full rounded-lg bg-muted/30 overflow-hidden flex items-center px-4">
          <svg viewBox="0 0 300 40" className="w-full h-full" preserveAspectRatio="none">
            {Array.from({ length: 60 }).map((_, i) => {
              const h = 4 + Math.abs(Math.sin(i * 0.4) * 18 + Math.sin(i * 0.7) * 10)
              return (
                <rect
                  key={i}
                  x={i * 5}
                  y={(40 - h) / 2}
                  width="3"
                  height={h}
                  className="fill-primary/60"
                  rx="1"
                />
              )
            })}
          </svg>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">BPM</p>
            <p className="text-lg font-bold text-foreground">{audio.bpm}</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Key</p>
            <p className="text-lg font-bold text-foreground">F# Min</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-lg font-bold text-foreground">{formatDuration(audio.duration)}</p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground space-y-1 border-t border-border pt-3">
          <p><span className="text-foreground font-medium">Track:</span> {audio.title}</p>
          <p><span className="text-foreground font-medium">Artist:</span> {audio.artist}</p>
          <p><span className="text-foreground font-medium">Sections:</span> Intro · Verse · Chorus · Bridge · Outro</p>
        </div>
      </div>
    </div>
  )
}

function L2Content() {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Mood Board</h2>
      <div className="grid grid-cols-3 gap-3">
        {MOOD_GRADIENTS.map((pair, i) => (
          <div
            key={i}
            className={`aspect-video rounded-lg bg-gradient-to-br ${pair[0]} ${pair[1]} opacity-80`}
          />
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {['#7C3AED', '#22D3EE', '#EC4899', '#F59E0B', '#10B981'].map((color) => (
          <div
            key={color}
            className="h-8 w-8 rounded-full border-2 border-white/10 cursor-pointer hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {STYLE_TAGS.map((tag) => (
          <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

function L3Content() {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Scene Cards</h2>
      <SceneGrid scenes={project.scenes} columns={3} />
    </div>
  )
}

function L4Content() {
  const layers = usePipelineStore((s) => s.layers)
  const progress = layers['L4_PRODUCTION']?.progress ?? 0

  return (
    <div className="h-full overflow-y-auto p-6 space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Generation</h2>
      <div className="relative">
        <SceneGrid scenes={project.scenes} columns={3} />
        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg">
          <GenerationLoading progress={progress} message="Generating scenes..." />
        </div>
      </div>
    </div>
  )
}

function L5Content() {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-4">
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Final Video</h2>
      <MockVideoPlayer
        thumbnailUrl={project.thumbnailUrl}
        duration={audio.duration}
        className="w-full max-w-2xl mx-auto"
      />
      <SimpleTimeline scenes={project.scenes} className="max-w-2xl mx-auto" />
    </div>
  )
}

const LAYER_CONTENT: Record<PipelineLayerId, React.ReactNode> = {
  L1_INPUT: <L1Content />,
  L2_CREATIVE: <L2Content />,
  L3_PREPRODUCTION: <L3Content />,
  L4_PRODUCTION: <L4Content />,
  L5_POSTPRODUCTION: <L5Content />,
}

export function DockEditor() {
  const currentLayerId = usePipelineStore((s) => s.currentLayerId)

  return (
    <div className="flex-1 h-full overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentLayerId ?? 'initial'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="h-full"
        >
          {currentLayerId ? (
            LAYER_CONTENT[currentLayerId]
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground text-sm">Pipeline starting...</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
