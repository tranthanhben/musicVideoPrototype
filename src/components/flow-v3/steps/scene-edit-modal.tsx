'use client'

import { useState, useEffect } from 'react'
import { Trash2, RefreshCw, Save, Mic, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { MockScene } from '@/lib/mock/types'

const ANGLES = ['wide shot', 'medium shot', 'close-up', 'extreme close-up', 'low angle', 'high angle', 'aerial', 'POV']
const MOVEMENTS = ['slow dolly in', 'slow pan', 'tracking shot', 'crane up', 'handheld', 'steadicam orbit', 'whip pan', 'push in', 'pullback reveal', 'static']
const TRANSITIONS = ['Hard Cut', 'Crossfade', 'Whip Pan', 'Beat-Synced', 'AI Morph']
const VFX_PRESETS = ['None', 'Cosmic Cinema', 'Neon Glow', 'Film Noir', 'Dreamy Soft', 'Clean Pop', 'Vintage 16mm']

interface SceneEditModalProps {
  scene: MockScene | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (sceneId: string, updates: Partial<MockScene>) => void
  onRegenerate: (sceneId: string) => void
  onDelete: (sceneId: string) => void
}

export function SceneEditModal({ scene, open, onOpenChange, onUpdate, onRegenerate, onDelete }: SceneEditModalProps) {
  const [subject, setSubject] = useState('')
  const [action, setAction] = useState('')
  const [environment, setEnvironment] = useState('')
  const [angle, setAngle] = useState('')
  const [movement, setMovement] = useState('')
  const [duration, setDuration] = useState(4)
  const [lipsync, setLipsync] = useState(false)
  const [vfx, setVfx] = useState('None')
  const [transition, setTransition] = useState('Hard Cut')
  const [notes, setNotes] = useState('')
  const [changed, setChanged] = useState(false)

  useEffect(() => {
    if (!scene) return
    setSubject(scene.subject); setAction(scene.action); setEnvironment(scene.environment)
    setAngle(scene.cameraAngle); setMovement(scene.cameraMovement); setDuration(scene.duration)
    setLipsync(scene.subject === 'Singer' || scene.subject === 'Band')
    setVfx('None'); setTransition('Hard Cut'); setNotes(''); setChanged(false)
  }, [scene])

  const prompt = `${subject} ${action} in ${environment}, ${angle}, ${movement}, cinematic`.trim()

  function save() {
    if (!scene) return
    onUpdate(scene.id, { subject, action, environment, cameraAngle: angle, cameraMovement: movement, duration, prompt })
    onOpenChange(false)
  }
  function regen() {
    if (!scene || !changed) return
    onUpdate(scene.id, { subject, action, environment, cameraAngle: angle, cameraMovement: movement, duration, prompt })
    onRegenerate(scene.id)
    onOpenChange(false)
  }

  if (!scene) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden" showCloseButton>
        <div className="flex gap-0 max-h-[80vh]">
          {/* Left — preview */}
          <div className="w-[55%] flex flex-col border-r border-border">
            <div className="relative aspect-video bg-zinc-900">
              <img src={scene.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              <span className="absolute top-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-bold text-white">S{scene.index + 1}</span>
              <span className="absolute top-2 right-2 rounded bg-primary/80 px-1.5 py-0.5 text-[10px] font-medium text-white">{duration}s</span>
            </div>
            {/* Prompt */}
            <div className="p-3 border-t border-border">
              <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Prompt</p>
              <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">{prompt}</p>
            </div>
            {/* VFX + Transition + Lipsync */}
            <div className="px-3 pb-3 space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">VFX Preset</p>
                  <select value={vfx} onChange={(e) => { setVfx(e.target.value); setChanged(true) }}
                    className="w-full rounded-md border border-border bg-muted/30 px-2 py-1 text-[10px] text-foreground appearance-none cursor-pointer focus:outline-none focus:border-primary/50">
                    {VFX_PRESETS.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Transition</p>
                  <select value={transition} onChange={(e) => { setTransition(e.target.value); setChanged(true) }}
                    className="w-full rounded-md border border-border bg-muted/30 px-2 py-1 text-[10px] text-foreground appearance-none cursor-pointer focus:outline-none focus:border-primary/50">
                    {TRANSITIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={() => { setLipsync(!lipsync); setChanged(true) }}
                className={cn('flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10px] font-medium cursor-pointer transition-colors',
                  lipsync ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-border text-muted-foreground hover:text-foreground')}>
                <Mic className="h-3 w-3" /> Lipsync {lipsync ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Right — fields */}
          <div className="w-[45%] flex flex-col overflow-y-auto">
            <div className="p-3 space-y-2.5 flex-1">
              <p className="text-[11px] font-semibold text-foreground">Scene Properties</p>
              <Field label="Subject" value={subject} onChange={(v) => { setSubject(v); setChanged(true) }} />
              <Field label="Action" value={action} onChange={(v) => { setAction(v); setChanged(true) }} />
              <Field label="Environment" value={environment} onChange={(v) => { setEnvironment(v); setChanged(true) }} />
              <div className="space-y-1">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Camera Angle</p>
                <select value={angle} onChange={(e) => { setAngle(e.target.value); setChanged(true) }}
                  className="w-full rounded-md border border-border bg-muted/30 px-2 py-1.5 text-[11px] text-foreground cursor-pointer focus:outline-none focus:border-primary/50">
                  {ANGLES.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Camera Movement</p>
                <select value={movement} onChange={(e) => { setMovement(e.target.value); setChanged(true) }}
                  className="w-full rounded-md border border-border bg-muted/30 px-2 py-1.5 text-[11px] text-foreground cursor-pointer focus:outline-none focus:border-primary/50">
                  {MOVEMENTS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Duration (s)</p>
                <input type="number" min={1} max={30} value={duration} onChange={(e) => { setDuration(Number(e.target.value)); setChanged(true) }}
                  className="w-full rounded-md border border-border bg-muted/30 px-2 py-1.5 text-[11px] text-foreground focus:outline-none focus:border-primary/50" />
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">Notes</p>
                <textarea value={notes} onChange={(e) => { setNotes(e.target.value); setChanged(true) }} rows={2} placeholder="Director notes..."
                  className="w-full rounded-md border border-border bg-muted/30 px-2 py-1.5 text-[11px] text-foreground resize-none focus:outline-none focus:border-primary/50" />
              </div>
              {/* Cost per scene */}
              <div className="flex items-center gap-1.5 rounded-md bg-amber-500/5 border border-amber-500/20 px-2 py-1.5">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span className="text-[10px] text-amber-400 font-medium">~20 credits / scene</span>
              </div>
            </div>

            <DialogFooter className="px-3 pb-3 pt-2 border-t border-border flex-row justify-between sm:justify-between">
              <button onClick={() => { onDelete(scene.id); onOpenChange(false) }}
                className="flex items-center gap-1 rounded-md border border-red-800/50 bg-red-950/30 px-2.5 py-1.5 text-[10px] font-medium text-red-400 hover:bg-red-950/60 transition-colors cursor-pointer">
                <Trash2 className="h-3 w-3" /> Delete
              </button>
              <div className="flex gap-1.5">
                <button onClick={regen} disabled={!changed}
                  className={cn('flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[10px] font-medium cursor-pointer transition-colors',
                    changed ? 'border-primary/50 text-primary hover:bg-primary/10' : 'border-border text-muted-foreground/40 cursor-not-allowed')}>
                  <RefreshCw className="h-3 w-3" /> Regen
                </button>
                <button onClick={save} className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-[10px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
                  <Save className="h-3 w-3" /> Save
                </button>
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-muted/30 px-2 py-1.5 text-[11px] text-foreground focus:outline-none focus:border-primary/50 transition-colors" />
    </div>
  )
}
