'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Upload, Music, Play, Plus, X, User, Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockProjects } from '@/lib/mock/projects'
import type { MockAudio } from '@/lib/mock/types'
import { RENDER_MODES } from '@/lib/flow-v5/mock-data'
import type { RenderMode } from '@/lib/flow-v5/types'

interface SetupStepProps {
  mvType?: string
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
  mvType, trackIndex, prompt, mode, musicControl, lyricsControl,
  onTrackSelect, onPromptChange, onModeChange, onMusicControlChange, onLyricsControlChange, onGenerate,
}: SetupStepProps) {
  const [hoveredTrack, setHoveredTrack] = useState<number | null>(null)
  const [showErrors, setShowErrors] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [outputQuality, setOutputQuality] = useState('480p')

  // Determine defaults based on video type
  const isPerformance = mvType === 'performance'
  const isNonNarrative = mvType === 'dance' || mvType === 'lyrics' || mvType === 'visualizer'
  const showScriptDirection = !isNonNarrative

  // Set lipsync default based on video type
  useEffect(() => {
    if (isPerformance) {
      onMusicControlChange(100) // All lines
    } else if (isNonNarrative) {
      onMusicControlChange(0) // None
    }
  }, [mvType]) // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="relative flex h-full justify-center overflow-y-auto p-6">
      {/* Ambient atmosphere blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full opacity-20 dark:opacity-[0.07] blur-[100px]"
          style={{
            background: 'radial-gradient(circle, #7C3AED, transparent 70%)',
            animation: 'blob-float-1 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-1/3 -right-16 h-56 w-56 rounded-full opacity-15 dark:opacity-[0.06] blur-[90px]"
          style={{
            background: 'radial-gradient(circle, #EC4899, transparent 70%)',
            animation: 'blob-float-2 25s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-12 left-1/4 h-48 w-48 rounded-full opacity-15 dark:opacity-[0.05] blur-[80px]"
          style={{
            background: 'radial-gradient(circle, #0EA5E9, transparent 70%)',
            animation: 'blob-float-3 22s ease-in-out infinite',
          }}
        />
      </div>
      <div className="relative z-10 w-full max-w-2xl space-y-5">
        {/* Song */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {trackIndex !== null ? (
            <div className="glass-surface rounded-2xl overflow-hidden">
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
                className="relative glass-surface rounded-2xl border-2 border-dashed border-white/10 dark:border-white/[0.08] p-5 text-center cursor-pointer hover:border-primary/30 transition-all group"
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
                      hoveredTrack === track.index ? 'border-primary/40 bg-primary/5' : 'glass-surface hover:border-white/15',
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
            className="w-full glass-input rounded-2xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none transition-colors"
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
                  !char.preset ? 'border-primary/30 glass-input' : 'border-border glass-input hover:border-primary/30',
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
                      ? 'ring-2 ring-primary/60 ring-offset-2 ring-offset-background scale-110 shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                      : 'opacity-70 hover:opacity-100 hover:shadow-[0_0_8px_rgba(255,255,255,0.15)]',
                  )}
                  style={{ backgroundColor: saved.color }}
                  title={saved.name}
                >
                  {saved.initials}
                </button>
              ))}
              {/* Role dropdown */}
              <GlassSelect
                value={char.type}
                onChange={(v) => updateCharacterType(char.id, v as '' | 'main' | 'supporting')}
                placeholder="Role"
                options={[
                  { value: 'main', label: 'Main' },
                  { value: 'supporting', label: 'Supporting' },
                ]}
                className="ml-1"
              />
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

        {/* Video style */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3 className="text-[10px] font-semibold text-foreground/80 tracking-[0.12em] mb-3">VIDEO STYLE</h3>
          <div className="grid grid-cols-4 gap-2.5">
            {RENDER_MODES.map((m) => {
              const isSelected = mode === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => onModeChange(m.id as RenderMode)}
                  className={cn(
                    'group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-200 cursor-pointer text-left',
                    isSelected
                      ? 'ring-2 ring-primary/60 shadow-[0_0_20px_rgba(124,58,237,0.25)] scale-[1.02]'
                      : 'glass-surface hover:scale-[1.01]'
                  )}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    {/* Gradient background */}
                    <div
                      className="absolute inset-0"
                      style={{ background: `linear-gradient(135deg, ${m.gradientFrom}, ${m.gradientTo})` }}
                    />
                    {/* Character silhouette */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <ellipse cx="80" cy="30" rx="13" ry="15" fill="white" fillOpacity="0.15" />
                      <rect x="74" y="43" width="12" height="8" rx="3" fill="white" fillOpacity="0.1" />
                      <path d="M55 57 Q80 48 105 57 L110 95 Q80 100 50 95 Z" fill="white" fillOpacity="0.1" />
                    </svg>
                    {/* Actual image on top */}
                    <Image
                      src={m.imageUrl}
                      alt={`${m.label} style`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105 relative z-10"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    {/* Selected check badge */}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-primary shadow-lg">
                        <Check className="h-2.5 w-2.5 text-primary-foreground" />
                      </div>
                    )}
                    {/* Glass label overlay at bottom */}
                    <div className="absolute inset-x-0 bottom-0 z-10 bg-black/25 backdrop-blur-md px-2 py-1.5 text-center border-t border-white/10">
                      <p className="text-[11px] font-bold text-white/90">{m.label}</p>
                      <p className="text-[9px] text-white/55 mt-0.5">{m.shortDesc}</p>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 z-[5] bg-white/0 group-hover:bg-white/5 transition-colors duration-200" />
                  </div>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Aspect ratio & Output quality */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="flex gap-3">
          <div className="flex-1">
            <h3 className="text-[10px] font-semibold text-foreground/80 tracking-[0.12em] mb-2">ASPECT RATIO</h3>
            <GlassSelect
              value={aspectRatio}
              onChange={setAspectRatio}
              options={[
                { value: '16:9', label: '16:9 Landscape' },
                { value: '9:16', label: '9:16 Portrait' },
                { value: '1:1', label: '1:1 Square' },
                { value: '4:5', label: '4:5 Vertical' },
              ]}
            />
          </div>
          <div className="flex-1">
            <h3 className="text-[10px] font-semibold text-foreground/80 tracking-[0.12em] mb-2">OUTPUT QUALITY</h3>
            <GlassSelect
              value={outputQuality}
              onChange={setOutputQuality}
              options={[
                { value: '480p', label: 'SD 480p' },
                { value: '720p', label: 'HD 720p' },
                { value: '1080p', label: 'Full HD 1080p' },
                { value: '2k', label: '2K 1440p' },
              ]}
            />
          </div>
        </motion.div>

        {/* Advanced section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <button
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="flex items-center gap-2.5 py-2 cursor-pointer group"
          >
            <h3 className="text-[10px] font-semibold text-foreground/80 tracking-[0.12em]">ADVANCED</h3>
            <div
              className={cn(
                'relative w-8 h-[18px] rounded-full transition-all duration-200',
                advancedOpen ? 'glass-toggle-active' : 'glass-toggle',
              )}
            >
              <div
                className={cn(
                  'absolute top-[3px] h-3 w-3 rounded-full bg-white transition-all duration-200',
                  advancedOpen ? 'translate-x-[17px] shadow-[0_0_6px_rgba(124,58,237,0.4)]' : 'translate-x-[3px] shadow-sm',
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
                  <SceneReuseToggle />
                  <LipsyncControl value={musicControl} onChange={onMusicControlChange} />
                  {showScriptDirection && (
                    <CreativityControl value={lyricsControl} onChange={onLyricsControlChange} />
                  )}
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
              'w-full rounded-2xl py-3 px-4 text-sm font-bold cursor-pointer text-white',
              canGenerate
                ? 'glass-button'
                : 'glass-button opacity-50 cursor-not-allowed',
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
    <div className="glass-surface rounded-2xl p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-foreground">Model</p>
          <p className="text-[10px] text-muted-foreground">Video generation model used to create the MV</p>
        </div>
        <GlassSelect
          value={selected}
          onChange={setSelected}
          className="ml-3 shrink-0"
          options={VIDEO_MODELS.map((m) => ({
            value: m.value,
            label: `${m.label} — ${m.cost}/s`,
          }))}
        />
      </div>
    </div>
  )
}

function SceneReuseToggle() {
  const [enabled, setEnabled] = useState(false)

  return (
    <div className="glass-surface rounded-2xl p-3">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 mr-3">
          <p className="text-xs font-semibold text-foreground">Scene Reuse</p>
          <p className="text-[10px] text-muted-foreground">Import scenes from previous projects to save generation credits</p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={cn(
            'relative w-8 h-[18px] rounded-full transition-all duration-200 shrink-0 cursor-pointer',
            enabled ? 'bg-emerald-500/70 backdrop-blur-sm border border-emerald-400/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'glass-toggle',
          )}
        >
          <div
            className={cn(
              'absolute top-[3px] h-3 w-3 rounded-full bg-white transition-all duration-200',
              enabled ? 'translate-x-[17px] shadow-[0_0_6px_rgba(16,185,129,0.4)]' : 'translate-x-[3px] shadow-sm',
            )}
          />
        </button>
      </div>
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-2.5 glass-input rounded-xl border-dashed p-2.5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span className="text-[10px]">Select a previous project to import scenes</span>
              </div>
              <div className="mt-2 space-y-1.5">
                {['Summer Vibes MV — 12 scenes', 'Midnight Dreams — 8 scenes'].map((project) => (
                  <button
                    key={project}
                    className="w-full text-left glass-input rounded-lg px-2.5 py-1.5 text-[10px] text-foreground/70 hover:border-primary/30 hover:text-foreground transition-colors cursor-pointer"
                  >
                    {project}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    <div className="glass-surface rounded-2xl p-3">
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
    <div className="glass-surface rounded-2xl p-3">
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
    <div className="glass-surface rounded-2xl p-3">
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
  const [isPlaying, setIsPlaying] = useState(false)
  const [playPosition, setPlayPosition] = useState(trimStart)
  const playRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      if (playRef.current) clearInterval(playRef.current)
      playRef.current = null
      setIsPlaying(false)
    } else {
      setPlayPosition(trimStart)
      setIsPlaying(true)
      playRef.current = setInterval(() => {
        setPlayPosition((pos) => {
          const next = pos + 0.1
          if (next >= trimEnd) {
            if (playRef.current) clearInterval(playRef.current)
            playRef.current = null
            setIsPlaying(false)
            return trimStart
          }
          return next
        })
      }, 100)
    }
  }, [isPlaying, trimStart, trimEnd])

  // Cleanup on unmount
  useEffect(() => () => { if (playRef.current) clearInterval(playRef.current) }, [])
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
      <div ref={containerRef} className="relative h-12 mt-1 group/wave">
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

        {/* Playhead */}
        {isPlaying && (
          <div
            className="absolute inset-y-0 z-20 pointer-events-none"
            style={{ left: `${(playPosition / audio.duration) * 100}%` }}
          >
            <div className="absolute inset-y-0 left-0 w-[2px] bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]" />
          </div>
        )}

        {/* Centered play/pause overlay */}
        <button
          onClick={togglePlay}
          className={cn(
            'absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'flex h-8 w-8 items-center justify-center rounded-full',
            'bg-black/40 backdrop-blur-md border border-white/15 shadow-[0_0_12px_rgba(0,0,0,0.3)]',
            'transition-all duration-200 cursor-pointer',
            isPlaying
              ? 'opacity-80 hover:opacity-100'
              : 'opacity-0 group-hover/wave:opacity-70 hover:!opacity-100',
          )}
        >
          {isPlaying ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="white"><rect x="1.5" y="1" width="2.5" height="8" rx="0.5" /><rect x="6" y="1" width="2.5" height="8" rx="0.5" /></svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="white"><polygon points="3,0 10,5 3,10" /></svg>
          )}
        </button>
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
        <span className="text-[10px] text-muted-foreground tabular-nums">{fmtTime(trimEnd)}</span>
      </div>
    </div>
  )
}

/* ─── Glass Select ─────────────────────────────────────────── */
interface GlassSelectOption {
  value: string
  label: string
}

function GlassSelect({
  value,
  options,
  onChange,
  placeholder,
  className,
}: {
  value: string
  options: GlassSelectOption[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1.5 glass-input rounded-xl px-2.5 py-1.5 cursor-pointer transition-all',
          open && 'border-primary/40 shadow-[0_0_12px_rgba(124,58,237,0.15)]',
        )}
      >
        <span className={cn('text-[11px] font-semibold', selected ? 'text-foreground' : 'text-muted-foreground')}>
          {selected?.label ?? placeholder ?? 'Select'}
        </span>
        <ChevronDown className={cn('h-3 w-3 text-muted-foreground transition-transform duration-200', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 z-50 min-w-[140px] overflow-hidden rounded-xl border border-white/[0.08] shadow-2xl"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            }}
          >
            <div className="py-1">
              {options.map((opt) => {
                const isActive = opt.value === value
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-1.5 text-[11px] font-medium cursor-pointer transition-colors',
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground/80 hover:bg-white/[0.06] hover:text-foreground',
                    )}
                  >
                    {isActive && <Check className="h-3 w-3 text-primary shrink-0" />}
                    <span className={cn(!isActive && 'ml-5')}>{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
