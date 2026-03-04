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
}

const project = mockProjects[0]

const MOOD_GRADIENTS = [
  ['#7C3AED', '#22D3EE'],
  ['#EC4899', '#F59E0B'],
  ['#06B6D4', '#10B981'],
  ['#F97316', '#A855F7'],
]

export function BayPreview({ activeTab, selectedSceneId, onAiAssist }: BayPreviewProps) {
  const layers = usePipelineStore((s) => s.layers)
  const selectedScene = project.scenes.find((s) => s.id === selectedSceneId) ?? project.scenes[0]
  const generateLayer = layers['L4_PRODUCTION']
  const isGenerating = generateLayer?.status === 'active'

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 relative overflow-hidden">
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
              {/* Waveform placeholder */}
              <div className="h-16 rounded-lg overflow-hidden">
                <svg viewBox="0 0 400 64" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.7" />
                    </linearGradient>
                  </defs>
                  <rect width="400" height="64" fill="#18181b" />
                  {Array.from({ length: 80 }).map((_, i) => {
                    const h = 8 + Math.sin(i * 0.4) * 12 + Math.sin(i * 0.9) * 10 + Math.random() * 8
                    return (
                      <rect
                        key={i}
                        x={i * 5}
                        y={(64 - h) / 2}
                        width="3"
                        height={h}
                        rx="1"
                        fill="url(#waveGrad)"
                      />
                    )
                  })}
                </svg>
              </div>
              <div className="flex justify-between mt-3 text-xs text-muted-foreground font-mono">
                <span>128 BPM · A minor</span>
                <span>3:12</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'creative' && (
          <div className="w-full max-w-md">
            <p className="text-xs text-muted-foreground mb-3 text-center font-medium uppercase tracking-wide">Mood Board</p>
            <div className="grid grid-cols-2 gap-2">
              {MOOD_GRADIENTS.map(([from, to], i) => (
                <div
                  key={i}
                  className="aspect-video rounded-xl overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'storyboard' && (
          <div className="w-full max-w-lg">
            <MockVideoPlayer
              thumbnailUrl={selectedScene.thumbnailUrl}
              duration={selectedScene.duration}
              aspectRatio="16:9"
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
