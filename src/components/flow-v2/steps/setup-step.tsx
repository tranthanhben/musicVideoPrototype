'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Music, Play, Plus, X, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockProjects } from '@/lib/mock/projects'
import type { MockAudio } from '@/lib/mock/types'
import { RENDER_MODES } from '@/lib/flow-v2/mock-data'
import type { RenderMode } from '@/lib/flow-v2/types'

interface SetupStepProps {
  trackIndex: number | null
  prompt: string
  mode: RenderMode
  musicControl: number
  lyricsControl: number
  onTrackSelect: (index: number) => void
  onPromptChange: (prompt: string) => void
  onModeChange: (mode: RenderMode) => void
  onMusicControlChange: (val: number) => void
  onLyricsControlChange: (val: number) => void
  onGenerate?: () => void
}

const DEMO_TRACKS = mockProjects.map((p, i) => ({
  index: i,
  title: p.audio.title,
  artist: p.audio.artist,
  bpm: p.audio.bpm,
  duration: p.audio.duration,
  key: p.audio.key,
  accentColor: i === 0 ? '#7C3AED' : i === 1 ? '#EC4899' : '#0EA5E9',
}))

const SAVED_CHARACTERS = [
  { id: 'char-1', name: 'Alex', initials: 'AX', color: '#7C3AED' },
  { id: 'char-2', name: 'Mia', initials: 'MI', color: '#EC4899' },
  { id: 'char-3', name: 'Jordan', initials: 'JD', color: '#0EA5E9' },
  { id: 'char-4', name: 'Luna', initials: 'LU', color: '#F59E0B' },
]

function formatDuration(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function SetupStep({
  trackIndex, prompt, mode, musicControl, lyricsControl,
  onTrackSelect, onPromptChange, onModeChange, onMusicControlChange, onLyricsControlChange, onGenerate,
}: SetupStepProps) {
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const isTrackSelected = trackIndex !== null && trackIndex >= 0
  const isModeSelected = !!mode
  const canGenerate = isTrackSelected && isModeSelected

  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)

  const handleTrimChange = useCallback((start: number, end: number) => {
    setTrimStart(start)
    setTrimEnd(end)
  }, [])

  // Reset trim range when track changes
  useEffect(() => {
    if (trackIndex !== null && trackIndex >= 0) {
      const audio = mockProjects[trackIndex]?.audio ?? mockProjects[0].audio
      setTrimStart(0)
      setTrimEnd(audio.duration)
    }
  }, [trackIndex])

  const handleGenerate = () => {
    if (!canGenerate) {
      setShowErrors(true)
      return
    }
    onGenerate?.()
  }
  const [characters, setCharacters] = useState<{ id: number; type: '' | 'main' | 'supporting'; preset: string | null }[]>([
    { id: 1, type: '', preset: null },
  ])
  const [nextId, setNextId] = useState(2)

  const addCharacter = () => {
    setCharacters([...characters, { id: nextId, type: '', preset: null }])
    setNextId(nextId + 1)
  }

  const removeCharacter = (id: number) => {
    setCharacters(characters.filter(c => c.id !== id))
  }

  const updateCharacterType = (id: number, type: '' | 'main' | 'supporting') => {
    setCharacters(characters.map(c => c.id === id ? { ...c, type } : c))
  }

  const selectPreset = (id: number, presetId: string | null) => {
    setCharacters(characters.map(c => c.id === id ? { ...c, preset: c.preset === presetId ? null : presetId } : c))
  }


  return (
    <div className="flex h-full justify-center overflow-y-auto p-6">
      <div className="w-full max-w-lg space-y-5">
        {/* Song */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {trackIndex !== null ? (
            <div className="rounded-xl border border-primary/30 bg-primary/5 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0" style={{ backgroundColor: `${DEMO_TRACKS[trackIndex].accentColor}20` }}>
                  <Music className="h-5 w-5" style={{ color: DEMO_TRACKS[trackIndex].accentColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{DEMO_TRACKS[trackIndex].title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{DEMO_TRACKS[trackIndex].artist} · {DEMO_TRACKS[trackIndex].bpm} BPM · {DEMO_TRACKS[trackIndex].key}</p>
                </div>
                <button onClick={() => onTrackSelect(-1)} className="text-xs text-muted-foreground hover:text-foreground cursor-pointer shrink-0">Change</button>
              </div>
              <WaveformTrimSelector
                audio={mockProjects[trackIndex].audio}
                trimStart={trimStart}
                trimEnd={trimEnd}
                onTrimChange={handleTrimChange}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div
                onClick={() => onTrackSelect(0)}
                className="relative rounded-xl border-2 border-dashed border-border bg-gradient-to-b from-primary/5 to-transparent p-5 text-center cursor-pointer hover:border-primary/40 hover:from-primary/10 transition-all group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">Upload your song</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">MP3, WAV, FLAC · Drag & drop or click to browse</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-muted-foreground shrink-0">or try:</span>
                {DEMO_TRACKS.map((track) => (
                  <button
                    key={track.index}
                    onClick={() => onTrackSelect(track.index)}
                    onMouseEnter={() => setHoveredTrack(track.index)}
                    onMouseLeave={() => setHoveredTrack(null)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 cursor-pointer transition-all',
                      hoveredTrack === track.index ? 'border-primary/40 bg-primary/5' : 'border-border bg-card hover:border-border/80',
                    )}
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full shrink-0" style={{ backgroundColor: `${track.accentColor}15` }}>
                      {hoveredTrack === track.index
                        ? <Play className="h-2.5 w-2.5" style={{ color: track.accentColor }} />
                        : <Music className="h-2.5 w-2.5" style={{ color: track.accentColor }} />}
                    </div>
                    <span className="text-[10px] font-medium text-foreground">{track.title.split(' ').slice(0, 2).join(' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Prompt */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <p className="text-sm font-bold text-foreground mb-2">Prompt <span className="text-xs font-normal italic text-muted-foreground">(optional)</span></p>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Describe your vision... e.g., 'A dreamy cosmic love story with floating astronauts in a nebula'"
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-primary/50 transition-colors"
            rows={2}
          />
        </motion.div>

        {/* Character */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <p className="text-sm font-bold text-foreground mb-2">Character <span className="text-xs font-normal italic text-muted-foreground">(optional)</span></p>
          {characters.map((char) => (
            <div key={char.id} className="flex items-center gap-2.5 mb-2.5">
              {/* Upload button */}
              <button
                onClick={() => selectPreset(char.id, null)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed cursor-pointer transition-colors shrink-0',
                  !char.preset ? 'border-primary/40 bg-primary/5' : 'border-border bg-muted/30 hover:border-primary/40',
                )}
              >
                <Upload className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              {/* Saved character avatars */}
              {SAVED_CHARACTERS.map((saved) => (
                <button
                  key={saved.id}
                  onClick={() => selectPreset(char.id, saved.id)}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full text-[10px] font-bold text-white cursor-pointer transition-all shrink-0',
                    char.preset === saved.id
                      ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110'
                      : 'opacity-70 hover:opacity-100',
                  )}
                  style={{ backgroundColor: saved.color }}
                  title={saved.name}
                >
                  {saved.initials}
                </button>
              ))}
              {/* Role dropdown */}
              <div className="relative inline-flex items-center rounded-md bg-muted px-2 py-1.5 ml-1">
                <select
                  value={char.type}
                  onChange={(e) => updateCharacterType(char.id, e.target.value as '' | 'main' | 'supporting')}
                  className={cn(
                    'text-[11px] font-semibold bg-transparent border-none outline-none cursor-pointer appearance-none pr-3.5',
                    char.type === '' ? 'text-muted-foreground' : 'text-foreground',
                  )}
                >
                  <option value="" disabled>Role</option>
                  <option value="main">Main</option>
                  <option value="supporting">Supporting</option>
                </select>
                <svg className="absolute right-1.5 pointer-events-none" width="7" height="4" viewBox="0 0 8 5"><path d="M0 0l4 5 4-5z" fill="currentColor" opacity="0.4" /></svg>
              </div>
              {characters.length > 1 && (
                <button onClick={() => removeCharacter(char.id)} className="text-muted-foreground/40 hover:text-foreground transition-colors cursor-pointer ml-auto">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addCharacter}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-1"
          >
            <Plus className="h-3.5 w-3.5" />
            Add more character(s)
          </button>
        </motion.div>

        {/* Video style & Output quality */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex gap-3">
          <div className="flex-1">
            <h3 className="text-xs font-bold text-foreground mb-2">VIDEO STYLE</h3>
            <div className="relative inline-flex items-center rounded-lg border border-border bg-card px-3 py-2">
              <select
                value={mode}
                onChange={(e) => onModeChange(e.target.value as RenderMode)}
                className="text-[11px] font-semibold text-foreground bg-transparent border-none outline-none cursor-pointer appearance-none pr-5"
              >
                {RENDER_MODES.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
              <svg className="absolute right-2.5 pointer-events-none" width="8" height="5" viewBox="0 0 8 5"><path d="M0 0l4 5 4-5z" fill="currentColor" opacity="0.4" /></svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-foreground mb-2">ASPECT RATIO</h3>
            <div className="relative inline-flex items-center rounded-lg border border-border bg-card px-3 py-2">
              <select defaultValue="16:9" className="text-[11px] font-semibold text-foreground bg-transparent border-none outline-none cursor-pointer appearance-none pr-5">
                <option value="16:9">16:9 Landscape</option>
                <option value="9:16">9:16 Portrait</option>
                <option value="1:1">1:1 Square</option>
                <option value="4:5">4:5 Vertical</option>
              </select>
              <svg className="absolute right-2.5 pointer-events-none" width="8" height="5" viewBox="0 0 8 5"><path d="M0 0l4 5 4-5z" fill="currentColor" opacity="0.4" /></svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-foreground mb-2">OUTPUT QUALITY</h3>
            <div className="relative inline-flex items-center rounded-lg border border-border bg-card px-3 py-2">
              <select defaultValue="480p" className="text-[11px] font-semibold text-foreground bg-transparent border-none outline-none cursor-pointer appearance-none pr-5">
                <option value="480p">SD 480p</option>
                <option value="720p">HD 720p</option>
                <option value="1080p">Full HD 1080p</option>
                <option value="2k">2K 1440p</option>
              </select>
              <svg className="absolute right-2.5 pointer-events-none" width="8" height="5" viewBox="0 0 8 5"><path d="M0 0l4 5 4-5z" fill="currentColor" opacity="0.4" /></svg>
            </div>
          </div>
        </motion.div>

        {/* Advanced section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex items-center gap-2.5 py-2 cursor-pointer group"
          >
            <h3 className="text-xs font-bold text-foreground">ADVANCED</h3>
            <div
              className={cn(
                'relative w-8 h-[18px] rounded-full transition-colors duration-200',
                advancedOpen ? 'bg-primary' : 'bg-border',
              )}
            >
              <div
                className={cn(
                  'absolute top-[3px] h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200',
                  advancedOpen ? 'translate-x-[17px]' : 'translate-x-[3px]',
                )}
              />
            </div>
          </button>
          <AnimatePresence>
            {advancedOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 pb-1">
                  {/* Video Model */}
                  <ModelSelector />
                  <LipsyncControl value={musicControl} onChange={onMusicControlChange} />
                  <CreativityControl value={lyricsControl} onChange={onLyricsControlChange} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Generate button */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="pt-2">
          <button
            onClick={handleGenerate}
            className={cn(
              'w-full rounded-xl py-3 px-4 text-sm font-bold transition-colors cursor-pointer',
              canGenerate
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-primary/50 text-primary-foreground/70 cursor-not-allowed',
            )}
          >
            START
          </button>
          {showErrors && !canGenerate && (
            <p className="text-[10px] text-red-500 text-center mt-1.5">
              {!isTrackSelected ? 'Please upload or select a song first.' : 'Please fill in all required fields.'}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

const VIDEO_MODELS = [
  { value: 'cremi-signature', label: 'Cremi Signature', cost: 10 },
  { value: 'kling-3.0', label: 'Kling 3.0', cost: 15 },
  { value: 'veo-3-fast', label: 'VEO 3 Fast', cost: 12 },
  { value: 'hailuo', label: 'Hailuo', cost: 8 },
  { value: 'seedance', label: 'Seedance', cost: 14 },
  { value: 'wan', label: 'Wan', cost: 6 },
]

function ModelSelector() {
  const [selected, setSelected] = useState('cremi-signature')

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-foreground">Model</p>
          <p className="text-[10px] text-muted-foreground">Video generation model used to create the MV</p>
        </div>
        <div className="relative inline-flex items-center rounded-lg border border-border bg-background px-2.5 py-1.5 ml-3 shrink-0">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="text-[11px] font-semibold text-foreground bg-transparent border-none outline-none cursor-pointer appearance-none pr-4"
          >
            {VIDEO_MODELS.map((m) => (
              <option key={m.value} value={m.value}>{m.label} — {m.cost}/s</option>
            ))}
          </select>
          <svg className="absolute right-2 pointer-events-none" width="8" height="5" viewBox="0 0 8 5"><path d="M0 0l4 5 4-5z" fill="currentColor" opacity="0.4" /></svg>
        </div>
      </div>
    </div>
  )
}

const LIPSYNC_STEPS = [
  { value: 0, label: 'None' },
  { value: 33, label: 'A few lines' },
  { value: 66, label: 'Most lines' },
  { value: 100, label: 'All lines' },
]

function LipsyncControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const currentStep = LIPSYNC_STEPS.reduce((prev, curr) =>
    Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev
  )

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-semibold text-foreground">Lipsync Scenes</p>
          <p className="text-[10px] text-muted-foreground">How much of the video should feature lip-synced singing?</p>
        </div>
        <span className="text-sm font-bold tabular-nums text-primary shrink-0 ml-2">{currentStep.label}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value)
          const snapped = LIPSYNC_STEPS.reduce((prev, curr) =>
            Math.abs(curr.value - v) < Math.abs(prev.value - v) ? curr : prev
          )
          onChange(snapped.value)
        }}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #7C3AED ${value}%, var(--border) ${value}%)`,
        }}
      />
      <div className="flex justify-between mt-1.5">
        {LIPSYNC_STEPS.map((step) => (
          <button
            key={step.value}
            onClick={() => onChange(step.value)}
            className={cn(
              'text-[9px] cursor-pointer transition-colors',
              currentStep.value === step.value ? 'text-foreground font-semibold' : 'text-muted-foreground/50 hover:text-muted-foreground',
            )}
          >
            {step.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const CREATIVITY_STEPS = [
  { value: 0, label: 'Follow lyrics strictly' },
  { value: 33, label: 'Mostly follow lyrics' },
  { value: 66, label: 'Loosely inspired' },
  { value: 100, label: 'Fully creative' },
]

function CreativityControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const currentStep = CREATIVITY_STEPS.reduce((prev, curr) =>
    Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev
  )

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-semibold text-foreground">Script Direction</p>
          <p className="text-[10px] text-muted-foreground">How closely should the storyline follow the lyrics?</p>
        </div>
        <span className="text-sm font-bold tabular-nums text-pink-500 shrink-0 ml-2">{currentStep.label}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value)
          const snapped = CREATIVITY_STEPS.reduce((prev, curr) =>
            Math.abs(curr.value - v) < Math.abs(prev.value - v) ? curr : prev
          )
          onChange(snapped.value)
        }}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #EC4899 ${value}%, var(--border) ${value}%)`,
        }}
      />
      <div className="flex justify-between mt-1.5">
        {CREATIVITY_STEPS.map((step) => (
          <button
            key={step.value}
            onClick={() => onChange(step.value)}
            className={cn(
              'text-[9px] cursor-pointer transition-colors',
              currentStep.value === step.value ? 'text-foreground font-semibold' : 'text-muted-foreground/50 hover:text-muted-foreground',
            )}
          >
            {step.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function SliderControl({ label, description, value, onChange, accentColor }: {
  label: string; description: string; value: number; onChange: (v: number) => void; accentColor: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-semibold text-foreground">{label}</p>
          <p className="text-[10px] text-muted-foreground">{description}</p>
        </div>
        <span className="text-sm font-bold tabular-nums" style={{ color: accentColor }}>{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${accentColor} ${value}%, var(--border) ${value}%)`,
        }}
      />
    </div>
  )
}

// ─── Waveform Trim Selector ────────────────────────────────

const TRIM_BAR_COUNT = 80
const MIN_TRIM_SECONDS = 10

function WaveformTrimSelector({ audio, trimStart, trimEnd, onTrimChange }: {
  audio: MockAudio
  trimStart: number
  trimEnd: number
  onTrimChange: (start: number, end: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<'start' | 'end' | null>(null)
  const trimRef = useRef({ start: trimStart, end: trimEnd })
  const callbackRef = useRef(onTrimChange)
  trimRef.current = { start: trimStart, end: trimEnd }
  callbackRef.current = onTrimChange

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const time = ratio * audio.duration
      const { start, end } = trimRef.current
      if (dragRef.current === 'start') {
        callbackRef.current(Math.max(0, Math.min(time, end - MIN_TRIM_SECONDS)), end)
      } else {
        callbackRef.current(start, Math.min(audio.duration, Math.max(time, start + MIN_TRIM_SECONDS)))
      }
    }
    const handleMouseUp = () => {
      if (dragRef.current) {
        dragRef.current = null
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [audio.duration])

  const startDrag = useCallback((handle: 'start' | 'end') => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragRef.current = handle
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, '0')}`

  const startPct = (trimStart / audio.duration) * 100
  const endPct = (trimEnd / audio.duration) * 100
  const selectedDuration = trimEnd - trimStart

  return (
    <div className="px-4 pb-3">
      {/* Waveform area */}
      <div ref={containerRef} className="relative h-12 mt-1">
        <svg width="100%" height="100%" viewBox="0 0 400 48" preserveAspectRatio="none" className="block">
          {Array.from({ length: TRIM_BAR_COUNT }).map((_, i) => {
            const x = (i / TRIM_BAR_COUNT) * 400
            const time = (i / TRIM_BAR_COUNT) * audio.duration
            const idx = Math.floor((i / TRIM_BAR_COUNT) * audio.energyCurve.length)
            const e = audio.energyCurve[Math.min(idx, audio.energyCurve.length - 1)]?.energy ?? 0.3
            const seed = Math.sin(i * 12.9898 + 78.233) * 43758.5453
            const rand = seed - Math.floor(seed)
            const h = Math.max((e * 0.7 + rand * 0.3) * 36, 3)
            const seg = audio.segments.find((s) => time >= s.startTime && time < s.endTime) ?? audio.segments[audio.segments.length - 1]
            const inRange = time >= trimStart && time <= trimEnd
            return (
              <rect
                key={i}
                x={x}
                y={24 - h / 2}
                width={400 / TRIM_BAR_COUNT * 0.65}
                height={h}
                rx={1}
                fill={seg.color}
                opacity={inRange ? 0.7 : 0.15}
                className="transition-opacity duration-75"
              />
            )
          })}
        </svg>

        {/* Dim overlays outside selection */}
        <div className="absolute inset-y-0 left-0 bg-black/30 pointer-events-none" style={{ width: `${startPct}%` }} />
        <div className="absolute inset-y-0 right-0 bg-black/30 pointer-events-none" style={{ width: `${100 - endPct}%` }} />

        {/* Selection border lines */}
        <div className="absolute top-0 h-[1px] bg-white/25 pointer-events-none" style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }} />
        <div className="absolute bottom-0 h-[1px] bg-white/25 pointer-events-none" style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }} />

        {/* Start handle */}
        <div
          className="absolute inset-y-0 z-10 cursor-ew-resize group/trimL"
          style={{ left: `${startPct}%`, width: '14px', transform: 'translateX(-50%)' }}
          onMouseDown={startDrag('start')}
        >
          <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white/80 group-hover/trimL:bg-white group-hover/trimL:shadow-[0_0_6px_rgba(255,255,255,0.4)] transition-all" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-1.5 rounded-sm bg-white shadow-sm" />
        </div>

        {/* End handle */}
        <div
          className="absolute inset-y-0 z-10 cursor-ew-resize group/trimR"
          style={{ left: `${endPct}%`, width: '14px', transform: 'translateX(-50%)' }}
          onMouseDown={startDrag('end')}
        >
          <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white/80 group-hover/trimR:bg-white group-hover/trimR:shadow-[0_0_6px_rgba(255,255,255,0.4)] transition-all" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-1.5 rounded-sm bg-white shadow-sm" />
        </div>
      </div>

      {/* Segment color strip */}
      <div className="flex gap-[1px] mt-1">
        {audio.segments.map((seg) => {
          const width = ((seg.endTime - seg.startTime) / audio.duration) * 100
          return (
            <div
              key={seg.id}
              className="h-3 flex items-center justify-center rounded-[2px] min-w-0"
              style={{ width: `${width}%`, backgroundColor: seg.color, opacity: 0.5 }}
            >
              {width > 10 && (
                <span className="text-[6px] font-bold text-white truncate px-0.5">{seg.label}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Time labels */}
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[10px] text-muted-foreground tabular-nums">{fmtTime(trimStart)}</span>
        <span className="text-[10px] font-bold text-foreground tabular-nums">{fmtTime(selectedDuration)} selected</span>
        <span className="text-[10px] text-muted-foreground tabular-nums">{fmtTime(trimEnd)}</span>
      </div>
    </div>
  )
}
