'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Pencil, ChevronLeft, ChevronRight, Loader2, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { makeSvgThumb } from '@/lib/flow-v2/mock-data'
import type { VisualConcept, StorylineVersion, ConceptDetails, ColorSwatch } from '@/lib/flow-v2/types'

// ─── Typewriter ──────────────────────────────────────────────

function Typewriter({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState('')
  const doneRef = useRef(false)

  useEffect(() => {
    doneRef.current = false
    let i = 0
    const iv = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(iv)
        if (!doneRef.current) { doneRef.current = true; onDone?.() }
      }
    }, 12)
    return () => clearInterval(iv)
  }, [text, onDone])

  return <>{displayed}</>
}

// ─── Storyline Summary ───────────────────────────────────────

interface StorylineSummaryProps {
  text: string
  isFirstLoad: boolean
  versions: StorylineVersion[]
  currentVersionIndex: number
  onVersionChange: (index: number) => void
  onRegenerate: (newText: string) => void
  onTypewriterDone?: () => void
}

function StorylineSummary({
  text,
  isFirstLoad,
  versions,
  currentVersionIndex,
  onVersionChange,
  onRegenerate,
  onTypewriterDone,
}: StorylineSummaryProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const [typewriterDone, setTypewriterDone] = useState(!isFirstLoad)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setDraft(text) }, [text])
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [isEditing])

  const handleRegenerate = () => {
    setIsEditing(false)
    onRegenerate(draft)
  }

  const totalVersions = versions.length
  const canGoBack = currentVersionIndex > 0
  const canGoForward = currentVersionIndex < totalVersions - 1

  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
          </motion.div>
          <p className="text-xs font-semibold text-foreground">Storyline Summary</p>
        </div>
        {totalVersions > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => canGoBack && onVersionChange(currentVersionIndex - 1)}
              disabled={!canGoBack}
              className={cn('p-0.5 rounded transition-colors cursor-pointer', canGoBack ? 'text-muted-foreground hover:text-foreground' : 'text-muted-foreground/30 cursor-not-allowed')}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] text-muted-foreground font-medium tabular-nums">
              Version {currentVersionIndex + 1} of {totalVersions}
            </span>
            <button
              onClick={() => canGoForward && onVersionChange(currentVersionIndex + 1)}
              disabled={!canGoForward}
              className={cn('p-0.5 rounded transition-colors cursor-pointer', canGoForward ? 'text-muted-foreground hover:text-foreground' : 'text-muted-foreground/30 cursor-not-allowed')}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Content — gradient border wrapper */}
      <div className="rounded-xl bg-gradient-to-br from-primary/30 via-primary/10 to-transparent p-[1px]">
        <div className="rounded-[11px] bg-card p-4 relative group">
          {/* Decorative open-quote */}
          <span className="absolute top-2.5 left-3.5 text-primary/10 text-3xl font-serif leading-none select-none">&ldquo;</span>
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = e.target.scrollHeight + 'px'
                  }}
                  className="w-full bg-transparent text-[13px] text-foreground leading-relaxed resize-none outline-none pl-4"
                  rows={4}
                />
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => { setIsEditing(false); setDraft(text) }}
                    className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRegenerate}
                    disabled={draft.trim() === text.trim()}
                    className={cn(
                      'flex items-center gap-1 text-[10px] font-semibold px-3 py-1 rounded-lg transition-colors cursor-pointer',
                      draft.trim() !== text.trim()
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-muted text-muted-foreground cursor-not-allowed',
                    )}
                  >
                    <Sparkles className="h-3 w-3" />
                    Generate new story
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[13px] text-foreground/80 leading-relaxed pr-8 pl-4 italic">
                  {isFirstLoad && !typewriterDone ? (
                    <Typewriter text={text} onDone={() => { setTypewriterDone(true); onTypewriterDone?.() }} />
                  ) : (
                    text
                  )}
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─── Concept Card ────────────────────────────────────────────

interface ConceptCardProps {
  concept: VisualConcept
  isSelected: boolean
  anySelected: boolean
  onSelect: () => void
  index: number
}

function ConceptCard({ concept, isSelected, anySelected, onSelect, index }: ConceptCardProps) {
  const [from, to] = concept.thumbnailColors

  return (
    <motion.div
      layout
      animate={{
        scale: isSelected ? 1.04 : anySelected ? 0.96 : 1,
        opacity: anySelected && !isSelected ? 0.45 : 1,
      }}
      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
    >
      <motion.button
        initial={{ opacity: 0, y: 20, filter: 'blur(16px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, delay: index * 0.15 }}
        whileHover={!anySelected ? { y: -4, transition: { duration: 0.2 } } : undefined}
        onClick={onSelect}
        className={cn(
          'relative w-full rounded-2xl overflow-hidden text-left cursor-pointer transition-all duration-300',
          isSelected
            ? 'ring-2 ring-primary shadow-xl shadow-primary/25'
            : 'ring-1 ring-border hover:ring-primary/40 hover:shadow-lg hover:shadow-primary/10',
        )}
      >
        {/* Gradient thumbnail — taller */}
        <div className="relative h-36 overflow-hidden">
          <img src={makeSvgThumb(from, to)} alt={concept.title} className="absolute inset-0 w-full h-full object-cover" />
          {/* Animated shimmer on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/5" />

          {/* Theme tags at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center gap-1 flex-wrap">
              {concept.details.themes.slice(0, 2).map((theme) => (
                <span key={theme} className="rounded-full bg-white/15 backdrop-blur-sm px-1.5 py-0.5 text-[8px] font-medium text-white/80">
                  {theme}
                </span>
              ))}
            </div>
          </div>

          {/* Selected check */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
              >
                <svg className="h-3.5 w-3.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom: color palette row */}
        <div className="px-3 py-2.5 flex items-center gap-1.5 bg-card/50 backdrop-blur-sm">
          {concept.details.colorPalette.slice(0, 5).map((c) => (
            <span key={c.hex} className="h-3.5 w-3.5 rounded-full border border-white/10 shrink-0 shadow-sm" style={{ backgroundColor: c.hex }} />
          ))}
          <span className="text-[9px] text-muted-foreground/70 ml-auto font-medium truncate max-w-[60px]">{concept.details.lightingStyle.split(',')[0]}</span>
        </div>
      </motion.button>
    </motion.div>
  )
}

// ─── Concept Grid ────────────────────────────────────────────

interface ConceptGridProps {
  concepts: VisualConcept[]
  selectedConceptId: string | null
  onSelect: (id: string) => void
}

function ConceptGrid({ concepts, selectedConceptId, onSelect }: ConceptGridProps) {
  const anySelected = selectedConceptId !== null
  return (
    <div className="grid grid-cols-3 gap-3">
      {concepts.map((concept, i) => (
        <ConceptCard
          key={concept.id}
          concept={concept}
          isSelected={selectedConceptId === concept.id}
          anySelected={anySelected}
          onSelect={() => onSelect(concept.id)}
          index={i}
        />
      ))}
    </div>
  )
}

// ─── Editable Tags ───────────────────────────────────────────

function EditableTags({ items, onChange, accentColor }: { items: string[]; onChange: (items: string[]) => void; accentColor?: string }) {
  const [adding, setAdding] = useState(false)
  const [newTag, setNewTag] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (adding && inputRef.current) inputRef.current.focus() }, [adding])

  const handleAdd = () => {
    const v = newTag.trim()
    if (v && !items.includes(v)) { onChange([...items, v]) }
    setNewTag('')
    setAdding(false)
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <AnimatePresence>
        {items.map((tag) => (
          <motion.span
            key={tag}
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
          >
            {tag}
            <button onClick={() => onChange(items.filter((t) => t !== tag))} className="hover:text-red-400 cursor-pointer transition-colors">
              <X className="h-2.5 w-2.5" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      {adding ? (
        <input
          ref={inputRef}
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewTag('') } }}
          onBlur={handleAdd}
          className="rounded-full border border-primary/30 bg-transparent px-2 py-0.5 text-[10px] text-foreground outline-none w-24"
          placeholder="Add tag..."
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-0.5 rounded-full border border-dashed border-muted-foreground/30 px-2 py-0.5 text-[10px] text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
        >
          <Plus className="h-2.5 w-2.5" />
          Add
        </button>
      )}
    </div>
  )
}

// ─── Editable Color Palette ──────────────────────────────────

function EditableColorPalette({ colors, onChange }: { colors: ColorSwatch[]; onChange: (colors: ColorSwatch[]) => void }) {
  const [adding, setAdding] = useState(false)
  const [newHex, setNewHex] = useState('#7C3AED')
  const [newName, setNewName] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (adding && nameRef.current) nameRef.current.focus() }, [adding])

  const handleAdd = () => {
    const name = newName.trim()
    if (name && newHex) {
      onChange([...colors, { hex: newHex, name }])
    }
    setNewName('')
    setNewHex('#7C3AED')
    setAdding(false)
  }

  return (
    <div className="flex items-end gap-3 flex-wrap">
      <AnimatePresence>
        {colors.map((c) => (
          <motion.div
            key={c.hex}
            layout
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className="flex flex-col items-center gap-1 relative group/swatch"
          >
            <div className="relative">
              <span className="block h-8 w-8 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: c.hex }} />
              <button
                onClick={() => onChange(colors.filter((s) => s.hex !== c.hex))}
                className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500/80 flex items-center justify-center opacity-0 group-hover/swatch:opacity-100 transition-opacity cursor-pointer"
              >
                <X className="h-2 w-2 text-white" />
              </button>
            </div>
            <span className="text-[8px] text-muted-foreground font-medium">{c.name}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      {adding ? (
        <div className="flex flex-col items-center gap-1">
          <input
            type="color"
            value={newHex}
            onChange={(e) => setNewHex(e.target.value)}
            className="h-8 w-8 rounded-full border border-white/10 cursor-pointer bg-transparent p-0 appearance-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none"
          />
          <input
            ref={nameRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewName('') } }}
            onBlur={handleAdd}
            placeholder="Name"
            className="w-12 text-center bg-transparent text-[8px] text-foreground outline-none border-b border-primary/30 pb-0.5"
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex flex-col items-center gap-1 cursor-pointer group/add"
        >
          <span className="h-8 w-8 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center group-hover/add:border-primary transition-colors">
            <Plus className="h-3 w-3 text-muted-foreground group-hover/add:text-primary transition-colors" />
          </span>
          <span className="text-[8px] text-muted-foreground group-hover/add:text-primary transition-colors">Add</span>
        </button>
      )}
    </div>
  )
}

// ─── Editable Text ───────────────────────────────────────────

function EditableText({ text, onChange }: { text: string; onChange: (text: string) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(text)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setDraft(text) }, [text])
  useEffect(() => {
    if (isEditing && ref.current) {
      ref.current.focus()
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [isEditing])

  return isEditing ? (
    <textarea
      ref={ref}
      value={draft}
      onChange={(e) => { setDraft(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
      onBlur={() => { onChange(draft); setIsEditing(false) }}
      onKeyDown={(e) => { if (e.key === 'Escape') { setDraft(text); setIsEditing(false) } }}
      className="w-full bg-transparent text-[10px] text-muted-foreground leading-relaxed resize-none outline-none border-b border-primary/30 pb-1"
    />
  ) : (
    <p
      onClick={() => setIsEditing(true)}
      className="text-[10px] text-muted-foreground leading-relaxed cursor-text hover:text-foreground transition-colors"
    >
      {text}
    </p>
  )
}

// ─── Editable Bullet List ────────────────────────────────────

function EditableBulletList({ items, onChange }: { items: string[]; onChange: (items: string[]) => void }) {
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (adding && inputRef.current) inputRef.current.focus() }, [adding])

  const handleAdd = () => {
    const v = newItem.trim()
    if (v) { onChange([...items, v]) }
    setNewItem('')
    setAdding(false)
  }

  return (
    <div className="space-y-1">
      <AnimatePresence>
        {items.map((item, i) => (
          <motion.div
            key={`${item}-${i}`}
            layout
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2 group/item"
          >
            <span className="text-[10px] text-primary mt-0.5">•</span>
            <p className="text-[10px] text-muted-foreground leading-snug flex-1">{item}</p>
            <button
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="opacity-0 group-hover/item:opacity-100 text-muted-foreground/40 hover:text-red-400 cursor-pointer transition-all shrink-0 mt-0.5"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
      {adding ? (
        <div className="flex items-center gap-2 pl-4">
          <input
            ref={inputRef}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') { setAdding(false); setNewItem('') } }}
            onBlur={handleAdd}
            className="flex-1 bg-transparent text-[10px] text-foreground outline-none border-b border-primary/30 pb-0.5"
            placeholder="Add item..."
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1 pl-4 text-[10px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        >
          <Plus className="h-2.5 w-2.5" />
          Add
        </button>
      )}
    </div>
  )
}

// ─── Concept Details Panel ───────────────────────────────────

interface ConceptDetailsPanelProps {
  concept: VisualConcept
  editedDetails: Partial<ConceptDetails>
  onEditDetails: (updates: Partial<ConceptDetails>) => void
}

export function ConceptDetailsPanel({ concept, editedDetails, onEditDetails }: ConceptDetailsPanelProps) {
  const details = { ...concept.details, ...editedDetails }

  const sections = [
    {
      label: 'Themes',
      content: (
        <EditableTags
          items={details.themes}
          onChange={(themes) => onEditDetails({ themes })}
        />
      ),
    },
    {
      label: 'Color Palette',
      content: (
        <EditableColorPalette
          colors={details.colorPalette}
          onChange={(colorPalette) => onEditDetails({ colorPalette })}
        />
      ),
    },
    {
      label: 'Character Style',
      content: (
        <EditableTags
          items={details.characterStyle}
          onChange={(characterStyle) => onEditDetails({ characterStyle })}
        />
      ),
    },
    {
      label: 'Lighting Style',
      content: (
        <EditableText
          text={details.lightingStyle}
          onChange={(lightingStyle) => onEditDetails({ lightingStyle })}
        />
      ),
    },
    {
      label: 'Cinematography',
      content: (
        <EditableBulletList
          items={details.cinematography}
          onChange={(cinematography) => onEditDetails({ cinematography })}
        />
      ),
    },
  ]

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="rounded-xl border border-border bg-card p-3 space-y-3 mt-2">
        <p className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">
          {concept.title} — Details
        </p>
        {sections.map((section, i) => (
          <motion.div
            key={section.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.25 }}
          >
            <p className="text-[10px] font-medium text-foreground/70 mb-1.5">{section.label}</p>
            {section.content}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Loading Spinner ─────────────────────────────────────────

const LOADING_WORDS = ['Analyzing your storyline', 'Mapping visual concepts', 'Generating palettes']

function ConceptsLoading() {
  const [wordIndex, setWordIndex] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => setWordIndex((i) => (i + 1) % LOADING_WORDS.length), 700)
    return () => clearInterval(iv)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center gap-3 py-10"
    >
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}>
        <Loader2 className="h-7 w-7 text-primary" />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.p
          key={wordIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="text-xs text-muted-foreground"
        >
          {LOADING_WORDS[wordIndex]}...
        </motion.p>
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Main Export: StorylineConceptsSection ────────────────────

export interface ConceptPanelState {
  selectedConcept: VisualConcept | null
  editedDetails: Record<string, Partial<ConceptDetails>>
  conceptsLoading: boolean
  handleEditDetails: (conceptId: string, updates: Partial<ConceptDetails>) => void
}

interface StorylineConceptsSectionProps {
  selectedConceptId: string | null
  onConceptSelect: (id: string) => void
  onContinue: () => void
  onConceptsReady?: () => void
  hideInlineDetails?: boolean
  onStateChange?: (state: ConceptPanelState) => void
  durationRatio?: number
}

export function StorylineConceptsSection({ selectedConceptId, onConceptSelect, onContinue, onConceptsReady, hideInlineDetails, onStateChange, durationRatio = 1 }: StorylineConceptsSectionProps) {
  // Import mock data inline to avoid circular deps
  const [mockData, setMockData] = useState<{
    storylineText: string
    concepts: VisualConcept[]
    conceptsAlt: VisualConcept[]
  } | null>(null)

  useEffect(() => {
    import('@/lib/flow-v2/mock-data').then((mod) => {
      setMockData({
        storylineText: mod.MOCK_STORYLINE_TEXT,
        concepts: mod.MOCK_CONCEPTS,
        conceptsAlt: mod.MOCK_CONCEPTS_ALT,
      })
    })
  }, [])

  const [versions, setVersions] = useState<StorylineVersion[]>([])
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0)
  const [conceptsLoading, setConceptsLoading] = useState(true)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [typewriterDone, setTypewriterDone] = useState(false)
  const [editedDetails, setEditedDetails] = useState<Record<string, Partial<ConceptDetails>>>({})
  const initRef = useRef(false)

  // Initialize first version when mock data loads (don't start concept loading yet)
  useEffect(() => {
    if (!mockData || initRef.current) return
    initRef.current = true
    const firstVersion: StorylineVersion = {
      id: 'v1',
      storylineText: mockData.storylineText,
      concepts: mockData.concepts,
      timestamp: Date.now(),
    }
    setVersions([firstVersion])
  }, [mockData])

  // Start concept loading only after typewriter finishes on first load
  useEffect(() => {
    if (!typewriterDone || !isFirstLoad) return
    setConceptsLoading(true)
    const t = setTimeout(() => {
      setConceptsLoading(false)
      // Signal parent that concepts are ready — triggers auto-scroll to Ideation
      onConceptsReady?.()
    }, 1800)
    return () => clearTimeout(t)
  }, [typewriterDone, isFirstLoad, onConceptsReady])

  const currentVersion = versions[currentVersionIndex]

  const handleRegenerate = useCallback((newText: string) => {
    if (!mockData) return
    setConceptsLoading(true)
    setEditedDetails({})
    // Reset selection
    onConceptSelect('')

    setTimeout(() => {
      const newVersion: StorylineVersion = {
        id: `v${versions.length + 1}`,
        storylineText: newText,
        // Alternate between concept sets
        concepts: versions.length % 2 === 0 ? mockData.conceptsAlt : mockData.concepts,
        timestamp: Date.now(),
      }
      const newVersions = [...versions.slice(0, currentVersionIndex + 1), newVersion]
      setVersions(newVersions)
      setCurrentVersionIndex(newVersions.length - 1)
      setConceptsLoading(false)
      setIsFirstLoad(false)
    }, 1800)
  }, [mockData, versions, currentVersionIndex, onConceptSelect])

  const handleVersionChange = useCallback((index: number) => {
    setCurrentVersionIndex(index)
    setEditedDetails({})
    onConceptSelect('')
  }, [onConceptSelect])

  const handleEditDetails = useCallback((conceptId: string, updates: Partial<ConceptDetails>) => {
    setEditedDetails((prev) => ({
      ...prev,
      [conceptId]: { ...prev[conceptId], ...updates },
    }))
  }, [])

  const selectedConcept = currentVersion?.concepts.find((c) => c.id === selectedConceptId) ?? null

  // Notify parent of state changes for external rendering of details panel
  useEffect(() => {
    onStateChange?.({
      selectedConcept,
      editedDetails,
      conceptsLoading,
      handleEditDetails,
    })
  }, [selectedConcept, editedDetails, conceptsLoading, handleEditDetails, onStateChange])

  if (!currentVersion) return null

  return (
    <div className="space-y-3">
      {/* Storyline */}
      <StorylineSummary
        text={currentVersion.storylineText}
        isFirstLoad={isFirstLoad}
        versions={versions}
        currentVersionIndex={currentVersionIndex}
        onVersionChange={handleVersionChange}
        onRegenerate={handleRegenerate}
        onTypewriterDone={() => setTypewriterDone(true)}
      />

      {/* Concept section — only show after typewriter finishes on first load */}
      {(!isFirstLoad || typewriterDone) && (
        <>
          {/* Concept section label */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs font-semibold text-foreground">Visual Concepts</p>
                {!selectedConceptId && (
                  <span className="text-[9px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5">Pick 1</span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Select 1 of 3 visual concepts to continue — you can customize after selecting
              </p>
            </div>
          </motion.div>

          {/* Concepts */}
          <AnimatePresence mode="wait">
            {conceptsLoading ? (
              <ConceptsLoading key="loading" />
            ) : (
              <motion.div
                key={`concepts-${currentVersion.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ConceptGrid
                  concepts={currentVersion.concepts}
                  selectedConceptId={selectedConceptId}
                  onSelect={onConceptSelect}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Concept details (inline — hidden when parent renders externally) */}
      {!hideInlineDetails && (
        <AnimatePresence>
          {selectedConcept && !conceptsLoading && (
            <ConceptDetailsPanel
              key={selectedConcept.id}
              concept={selectedConcept}
              editedDetails={editedDetails[selectedConcept.id] ?? {}}
              onEditDetails={(updates) => handleEditDetails(selectedConcept.id, updates)}
            />
          )}
        </AnimatePresence>
      )}

      {/* Generate button (inline — hidden when parent renders externally) */}
      {!hideInlineDetails && (
        <AnimatePresence>
          {selectedConceptId && !conceptsLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="space-y-1.5"
            >
              <button
                onClick={onContinue}
                className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
              >
                Generate Storyboard
              </button>
              <p className="text-center text-[10px] text-muted-foreground">
                Estimated cost: <span className="font-semibold text-foreground">{Math.round(400 * durationRatio).toLocaleString()}</span> for Storyboard &amp; <span className="font-semibold text-foreground">{Math.round(2550 * durationRatio).toLocaleString()}</span> for Video Scenes. Total <span className="font-semibold text-foreground">{Math.round(2950 * durationRatio).toLocaleString()} credits</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
