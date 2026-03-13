'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, Users, Settings2, MonitorPlay, Maximize2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CHARACTER_ARCHETYPES } from '@/lib/mock/characters'

const VIDEO_MODELS = ['Kling v1.6 Pro', 'Runway Gen-4', 'Sora Turbo', 'Pika Labs 2.0']
const ASPECT_RATIOS = ['16:9', '9:16', '1:1', '4:3']
const QUALITY_OPTIONS = ['Draft (Fast)', 'Standard', 'High Quality', 'Ultra (Slow)']

// ─── Character Quick-Select ───────────────────────────────────────────────────

export function InputCharacterSelect() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 3 ? prev : [...prev, id]
    )
  }

  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-bold text-foreground">Characters</h3>
        <span className="ml-auto text-[10px] text-muted-foreground">Select up to 3</span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {CHARACTER_ARCHETYPES.slice(0, 8).map((char) => {
          const isSelected = selectedIds.includes(char.id)
          const isDisabled = !isSelected && selectedIds.length >= 3
          return (
            <button
              key={char.id}
              onClick={() => toggle(char.id)}
              disabled={isDisabled}
              className={cn(
                'relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer aspect-square',
                isSelected ? 'border-primary shadow-md' : 'border-transparent',
                isDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:border-primary/40',
              )}
              style={isSelected ? { boxShadow: `0 0 0 1px ${char.accentColor}60` } : {}}
            >
              <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <p className="absolute bottom-0.5 left-0 right-0 text-center text-[8px] font-bold text-white px-0.5 leading-tight truncate">
                {char.name.split(' ')[0]}
              </p>
              {isSelected && (
                <div className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-primary-foreground" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Advanced Settings (collapsible) ─────────────────────────────────────────

export function InputAdvancedSettings() {
  const [open, setOpen] = useState(false)
  const [videoModel, setVideoModel] = useState(VIDEO_MODELS[0])
  const [lipsync, setLipsync] = useState(true)
  const [scriptDir, setScriptDir] = useState('Auto')
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [quality, setQuality] = useState('Standard')

  return (
    <div className="rounded-xl border border-border/50 bg-muted/20">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-bold text-foreground">Advanced Settings</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Video Model */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <MonitorPlay className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Video Model</p>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {VIDEO_MODELS.map((m) => (
                    <button key={m} onClick={() => setVideoModel(m)}
                      className={cn(
                        'rounded-lg border py-1.5 px-2 text-[10px] font-semibold transition-all cursor-pointer text-left',
                        videoModel === m ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40',
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lipsync + Script Direction */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Lipsync</p>
                  <button
                    onClick={() => setLipsync((v) => !v)}
                    className={cn(
                      'w-full rounded-lg border py-1.5 px-3 text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                      lipsync ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground',
                    )}
                  >
                    <Zap className="h-3 w-3" />
                    {lipsync ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Direction</p>
                  <div className="flex gap-1">
                    {['Auto', 'Manual'].map((d) => (
                      <button key={d} onClick={() => setScriptDir(d)}
                        className={cn(
                          'flex-1 rounded-lg border py-1.5 text-[10px] font-semibold transition-all cursor-pointer',
                          scriptDir === d ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40',
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Output Configuration */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Output Config</p>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-[9px] text-muted-foreground mb-1">Aspect Ratio</p>
                    <div className="flex gap-1.5">
                      {ASPECT_RATIOS.map((r) => (
                        <button key={r} onClick={() => setAspectRatio(r)}
                          className={cn(
                            'flex-1 rounded-lg border py-1 text-[10px] font-mono font-semibold transition-all cursor-pointer',
                            aspectRatio === r ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40',
                          )}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground mb-1">Quality</p>
                    <div className="grid grid-cols-2 gap-1">
                      {QUALITY_OPTIONS.map((q) => (
                        <button key={q} onClick={() => setQuality(q)}
                          className={cn(
                            'rounded-lg border py-1 px-2 text-[9px] font-semibold transition-all cursor-pointer text-left',
                            quality === q ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40',
                          )}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
