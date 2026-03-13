'use client'

import { Bot, CheckCircle2, Upload, Music, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MockVideoPlayer } from '@/components/shared/mock-video-player'
import { GenerationLoading } from '@/components/shared/generation-loading'
import { usePipelineStore } from '@/lib/pipeline/store'
import { mockProjects } from '@/lib/mock/projects'
import { BayPreviewCreative } from './bay-preview-creative'
import type { BayTab } from './bay-top-bar'
import type { JourneyStateId } from '@/lib/journey/orchestrator'

interface BayPreviewProps {
  activeTab: BayTab
  selectedSceneId: string | null
  onAiAssist: () => void
  onAction: (action: string) => void
  selectedStoryline: number | null
  journeyState: JourneyStateId
  onTrackSelect?: (index: number) => void
}

const project = mockProjects[0]

const WAVEFORM_BARS = Array.from(
  { length: 80 },
  (_, i) => 8 + Math.sin(i * 0.4) * 12 + Math.sin(i * 0.9) * 10 + (((i * 7919) % 97) / 97) * 8
)

const SVG_W = 480
const SVG_H = 80
const BAND_H = 8

const VFX_PRESETS = [
  { name: 'Cosmic Cinema', colors: ['#7C3AED', '#22D3EE'] },
  { name: 'Neon Pulse', colors: ['#EC4899', '#F59E0B'] },
  { name: 'Ocean Drift', colors: ['#06B6D4', '#10B981'] },
  { name: 'Warm Analog', colors: ['#F59E0B', '#EF4444'] },
]

const DEMO_TRACKS = [
  { title: 'Cosmic Love Story', artist: 'Aria & Kael', bpm: 128, key: 'A minor', gradient: ['#7C3AED', '#22D3EE'] },
  { title: 'Neon City Nights', artist: 'NightPulse', bpm: 135, key: 'F# minor', gradient: ['#EC4899', '#F59E0B'] },
  { title: 'Ocean Dreams', artist: 'Tidal', bpm: 92, key: 'D major', gradient: ['#06B6D4', '#10B981'] },
]

export function BayPreview({ activeTab, selectedSceneId, onAiAssist, onAction, selectedStoryline, journeyState, onTrackSelect }: BayPreviewProps) {
  const layers = usePipelineStore((s) => s.layers)
  const selectedScene = project.scenes.find((s) => s.id === selectedSceneId) ?? project.scenes[0]
  const generateLayer = layers['L4_PRODUCTION']
  const isGenerating = generateLayer?.status === 'active'

  const { segments, energyCurve, duration, bpm, key, title, artist } = project.audio

  const energyPoints = energyCurve
    .map((p) => {
      const x = (p.time / duration) * SVG_W
      const y = SVG_H - BAND_H - 6 - p.energy * 55
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const showUpload = activeTab === 'input' && journeyState === 'welcome'

  return (
    <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
      <div className="flex-1 flex items-center justify-center p-6 min-h-0 overflow-y-auto">

        {activeTab === 'input' && showUpload && (
          <BayUploadView onTrackSelect={onTrackSelect} onAction={onAction} />
        )}

        {activeTab === 'input' && !showUpload && (
          <BayWaveformView
            title={title} artist={artist} bpm={bpm} keyStr={key}
            segments={segments} energyCurve={energyCurve} energyPoints={energyPoints} duration={duration}
          />
        )}

        {activeTab === 'creative' && (
          <BayPreviewCreative selectedStoryline={selectedStoryline} onAction={onAction} />
        )}

        {activeTab === 'storyboard' && (
          <div className="w-full max-w-xl">
            <MockVideoPlayer thumbnailUrl={selectedScene.thumbnailUrl} duration={selectedScene.duration} aspectRatio="16:9" className="w-full" />
            <p className="text-xs text-muted-foreground text-center mt-2">
              Scene {selectedScene.index + 1} — {selectedScene.subject} · {selectedScene.environment}
            </p>
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="flex flex-col items-center gap-4 w-full max-w-md">
            {isGenerating ? (
              <GenerationLoading progress={generateLayer.progress} message={`Generating scene ${selectedScene.index + 1}...`} />
            ) : (
              <>
                <MockVideoPlayer thumbnailUrl={selectedScene.thumbnailUrl} duration={selectedScene.duration} aspectRatio="16:9" className="w-full" />
                <div className="grid grid-cols-4 gap-1.5 w-full">
                  {project.scenes.map((scene) => (
                    <div key={scene.id} className="relative aspect-video rounded-md overflow-hidden">
                      <img src={scene.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      {scene.status === 'completed' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="w-full max-w-xl space-y-3">
            <MockVideoPlayer thumbnailUrl="/assets/export/final-preview.jpg" duration={project.audio.duration} aspectRatio="16:9" className="w-full" />
            <div className="flex gap-2 justify-center flex-wrap">
              {VFX_PRESETS.map((preset, i) => (
                <button key={preset.name} onClick={() => onAction(`apply_vfx_${preset.name.toLowerCase().replace(/\s+/g, '_')}`)}
                  className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    i === 0 ? 'border-primary bg-primary/15 text-foreground' : 'border-border/50 bg-muted/40 text-muted-foreground hover:border-border hover:text-foreground'
                  )}>
                  <div className="h-3 w-3 rounded-sm" style={{ background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})` }} />
                  {preset.name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'YouTube', ratio: '16:9', size: '~320 MB', icon: '▶' },
                { label: 'TikTok', ratio: '9:16', size: '~180 MB', icon: '♪' },
                { label: 'Instagram', ratio: '1:1', size: '~220 MB', icon: '□' },
              ].map((fmt) => (
                <button key={fmt.label} onClick={() => onAction(`export_${fmt.label.toLowerCase()}`)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted hover:border-border transition-all text-center">
                  <span className="text-lg">{fmt.icon}</span>
                  <span className="text-xs font-medium text-foreground">{fmt.label}</span>
                  <span className="text-[10px] text-muted-foreground">{fmt.ratio}</span>
                  <span className="text-[10px] text-muted-foreground">{fmt.size}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Assist CTA */}
      <div className="absolute bottom-4 right-4">
        <button onClick={onAiAssist}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-primary/90 hover:bg-primary text-primary-foreground transition-colors shadow-lg">
          <Bot className="h-3.5 w-3.5" />
          AI Assist
        </button>
      </div>
    </div>
  )
}

// ─── Upload View (shown before analysis) ─────────────────────────────────────

function BayUploadView({ onTrackSelect, onAction }: { onTrackSelect?: (i: number) => void; onAction: (a: string) => void }) {
  return (
    <div className="w-full max-w-lg space-y-5">
      {/* Upload area */}
      <div className="rounded-2xl border-2 border-dashed border-border/60 bg-muted/10 p-8 text-center hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
        onClick={() => onAction('start_analysis')}>
        <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
          <Upload className="h-7 w-7 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">Upload your audio track</p>
        <p className="text-xs text-muted-foreground mb-3">MP3, WAV, FLAC — up to 50MB</p>
        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
          <Upload className="h-3.5 w-3.5" />
          Choose File
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">or try a demo track</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Demo tracks */}
      <div className="space-y-2">
        {DEMO_TRACKS.map((track, i) => (
          <button key={i} onClick={() => { onTrackSelect?.(i); onAction('start_demo') }}
            className="w-full flex items-center gap-3 rounded-xl border border-border/40 bg-zinc-900/60 p-3 hover:border-primary/40 hover:bg-zinc-900 transition-all text-left group cursor-pointer">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `linear-gradient(135deg, ${track.gradient[0]}30, ${track.gradient[1]}30)`, border: `1px solid ${track.gradient[0]}40` }}>
              <Music className="h-4 w-4" style={{ color: track.gradient[0] }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{track.title}</p>
              <p className="text-[11px] text-muted-foreground">{track.artist}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-mono" style={{ color: track.gradient[0] }}>{track.bpm} BPM</p>
              <p className="text-[10px] text-muted-foreground">{track.key}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Play className="h-3.5 w-3.5 text-primary ml-0.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Waveform View (shown after analysis starts) ──────────────────────────────

interface WaveformProps {
  title: string; artist: string; bpm: number; keyStr: string
  segments: typeof project.audio.segments
  energyCurve: typeof project.audio.energyCurve
  energyPoints: string; duration: number
}

function BayWaveformView({ title, artist, bpm, keyStr, segments, energyCurve, energyPoints, duration }: WaveformProps) {
  return (
    <div className="w-full max-w-xl space-y-4">
      <div className="rounded-2xl border border-border/40 bg-zinc-900 p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-11 w-11 rounded-xl bg-primary/20 flex items-center justify-center">
            <span className="text-xl">🎵</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{artist}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs font-mono text-primary">{bpm} BPM</p>
            <p className="text-xs text-muted-foreground">{keyStr}</p>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden" style={{ height: `${SVG_H}px` }}>
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wg2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#EC4899" stopOpacity="0.7" />
              </linearGradient>
            </defs>
            <rect width={SVG_W} height={SVG_H} fill="#18181b" />
            {segments.map((seg) => {
              const x = (seg.startTime / duration) * SVG_W
              const w = ((seg.endTime - seg.startTime) / duration) * SVG_W
              return <rect key={seg.id} x={x} y={SVG_H - BAND_H} width={w} height={BAND_H} fill={seg.color} opacity="0.9" />
            })}
            {WAVEFORM_BARS.map((h, i) => (
              <rect key={i} x={i * 6} y={(SVG_H - BAND_H - h) / 2} width="4" height={h} rx="1.5" fill="url(#wg2)" />
            ))}
            {energyPoints && (
              <polyline points={energyPoints} fill="none" stroke="rgba(34,211,238,0.6)" strokeWidth="1.5" strokeLinejoin="round" />
            )}
            {energyCurve.filter((p) => p.isPeak).map((p, i) => {
              const cx = (p.time / duration) * SVG_W
              const cy = SVG_H - BAND_H - 6 - p.energy * 55
              return <circle key={i} cx={cx} cy={cy} r="3" fill="#F43F5E" />
            })}
          </svg>
        </div>

        <div className="flex justify-between mt-3 text-xs text-muted-foreground font-mono">
          <span>{segments.length} segments · {energyCurve.filter((p) => p.isPeak).length} peaks</span>
          <span>{String(Math.floor(duration / 60))}:{String(duration % 60).padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  )
}
