'use client'

import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'
import { GenerationLoading } from '@/components/shared/generation-loading'
import { usePipelineStore } from '@/lib/pipeline/store'
import { mockProjects } from '@/lib/mock/projects'
import type { BayTab } from './bay-top-bar'

interface BayPreviewProps {
  activeTab: BayTab
  selectedSceneId: string | null
  onAiAssist: () => void
  onAction: (action: string) => void
  selectedStoryline: number | null
}

const project = mockProjects[0]

const STORYLINES = [
  {
    title: 'Celestial Journey',
    tone: 'Ethereal, intimate, soaring',
    description: 'An epic space voyage synced to verse/chorus arcs. Soft nebula visuals for verses, supernova bursts for choruses.',
    keyScene: 'Scene 4 at Chorus — dancing on a moonlit planet at energy peak',
    matchPct: 94,
    gradient: ['#7C3AED', '#22D3EE'],
  },
  {
    title: 'Neon Metropolis',
    tone: 'Cyberpunk, electric, driving',
    description: 'High-energy city narrative with beat-driven cuts. Neon reflections and motion blur match the 128 BPM pulse.',
    keyScene: 'Scene 5 at Chorus — supernova explosion at biggest energy peak',
    matchPct: 87,
    gradient: ['#EC4899', '#F59E0B'],
  },
  {
    title: 'Abstract Emotion',
    tone: 'Minimal, poetic, flowing',
    description: 'Pure visual poetry following the emotion curve. Color and form shift with energy — no narrative, pure feeling.',
    keyScene: 'Scene 8 at Outro — cosmic reunion during the emotional finale',
    matchPct: 81,
    gradient: ['#06B6D4', '#10B981'],
  },
]

// Pre-compute waveform bar heights at module level to avoid re-render flicker
const WAVEFORM_BARS = Array.from(
  { length: 80 },
  (_, i) => 8 + Math.sin(i * 0.4) * 12 + Math.sin(i * 0.9) * 10 + (((i * 7919) % 97) / 97) * 8
)

const SVG_WIDTH = 400
const SVG_HEIGHT = 64
const BAND_HEIGHT = 6
const BAND_Y = SVG_HEIGHT - BAND_HEIGHT

export function BayPreview({ activeTab, selectedSceneId, onAiAssist, onAction, selectedStoryline }: BayPreviewProps) {
  const layers = usePipelineStore((s) => s.layers)
  const selectedScene = project.scenes.find((s) => s.id === selectedSceneId) ?? project.scenes[0]
  const generateLayer = layers['L4_PRODUCTION']
  const isGenerating = generateLayer?.status === 'active'

  const { segments, energyCurve, duration, bpm, key } = project.audio

  // Build energy polyline points
  const energyPoints = energyCurve
    .map((p) => {
      const x = (p.time / duration) * SVG_WIDTH
      const y = SVG_HEIGHT - BAND_HEIGHT - 4 - p.energy * 50
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center p-6 min-h-0">
        {activeTab === 'input' && (
          <div className="w-full max-w-lg space-y-4">
            <div className="rounded-2xl border border-border/40 bg-zinc-900 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="text-lg">🎵</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{project.audio.title}</p>
                  <p className="text-sm text-muted-foreground">{project.audio.artist}</p>
                </div>
              </div>

              {/* Waveform with overlays */}
              <div className="h-16 rounded-lg overflow-hidden">
                <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.7" />
                    </linearGradient>
                  </defs>

                  {/* Background */}
                  <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="#18181b" />

                  {/* Waveform bars */}
                  {WAVEFORM_BARS.map((h, i) => (
                    <rect
                      key={i}
                      x={i * 5}
                      y={(SVG_HEIGHT - BAND_HEIGHT - 4 - h) / 2}
                      width="3"
                      height={h}
                      rx="1"
                      fill="url(#waveGrad)"
                    />
                  ))}

                  {/* Energy curve overlay */}
                  {energyPoints && (
                    <polyline
                      points={energyPoints}
                      fill="none"
                      stroke="rgba(34, 211, 238, 0.55)"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Peak markers */}
                  {energyCurve
                    .filter((p) => p.isPeak)
                    .map((p, i) => {
                      const x = (p.time / duration) * SVG_WIDTH
                      const y = SVG_HEIGHT - BAND_HEIGHT - 4 - p.energy * 50
                      return (
                        <circle
                          key={i}
                          cx={x.toFixed(1)}
                          cy={y.toFixed(1)}
                          r="3"
                          fill="#F43F5E"
                        />
                      )
                    })}

                  {/* Segment color bands at bottom */}
                  {segments.map((seg) => {
                    const x = (seg.startTime / duration) * SVG_WIDTH
                    const w = ((seg.endTime - seg.startTime) / duration) * SVG_WIDTH
                    return (
                      <rect
                        key={seg.id}
                        x={x.toFixed(1)}
                        y={BAND_Y}
                        width={w.toFixed(1)}
                        height={BAND_HEIGHT}
                        fill={seg.color}
                        opacity="0.85"
                      />
                    )
                  })}
                </svg>
              </div>

              <div className="flex justify-between mt-3 text-xs text-muted-foreground font-mono">
                <span>{bpm} BPM · {key}</span>
                <span>
                  {String(Math.floor(duration / 60))}:{String(duration % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'creative' && (
          <div className="w-full max-w-lg space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Choose a Storyline</p>
              <span className="text-[10px] font-mono text-purple-400 border border-purple-500/30 rounded-full px-2 py-0.5">
                CREMI-7C3A-COSMIC
              </span>
            </div>
            {STORYLINES.map((s, i) => (
              <button
                key={i}
                onClick={() => onAction(`select_storyline_${i}`)}
                className={cn(
                  'w-full text-left p-4 rounded-xl border transition-all',
                  selectedStoryline === i
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                    : 'border-border/40 bg-zinc-900 hover:border-border'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-foreground">{s.title}</span>
                  <span className="text-[10px] text-primary font-mono">{s.matchPct}% match</span>
                </div>
                <p className="text-[10px] text-muted-foreground italic">{s.tone}</p>
                <p className="text-xs text-muted-foreground/80 leading-relaxed mt-1">{s.description}</p>
                <p className="text-[10px] text-primary/70 mt-2">{s.keyScene}</p>
                <div
                  className="h-1 rounded-full mt-2"
                  style={{ background: `linear-gradient(to right, ${s.gradient[0]}, ${s.gradient[1]})` }}
                />
              </button>
            ))}
          </div>
        )}

        {activeTab === 'storyboard' && (
          <div className="w-full max-w-lg">
            <MockVideoPlayer
              thumbnailUrl={selectedScene.thumbnailUrl}
              duration={selectedScene.duration}
              aspectRatio="16:9"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground text-center mt-2">
              Scene {selectedScene.index + 1} — {selectedScene.subject}
            </p>
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            {isGenerating ? (
              <GenerationLoading
                progress={generateLayer.progress}
                message={`Generating scene ${selectedScene.index + 1}...`}
              />
            ) : (
              <MockVideoPlayer
                thumbnailUrl={selectedScene.thumbnailUrl}
                duration={selectedScene.duration}
                aspectRatio="16:9"
                className="w-full"
              />
            )}
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="w-full max-w-xl">
            <MockVideoPlayer
              thumbnailUrl={selectedScene.thumbnailUrl}
              duration={selectedScene.duration}
              aspectRatio="16:9"
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* AI Assist CTA */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={onAiAssist}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium',
            'bg-primary/90 hover:bg-primary text-primary-foreground transition-colors shadow-lg'
          )}
        >
          <Bot className="h-3.5 w-3.5" />
          AI Assist
        </button>
      </div>
    </div>
  )
}
