'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface EditProjectData {
  name: string
  description: string
  tags: string[]
}

interface EditProjectModalProps {
  projectName: string
  onSave: (data: EditProjectData) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EditProjectModal({ projectName, onSave, open: controlledOpen, onOpenChange }: EditProjectModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? (onOpenChange ?? setInternalOpen) : setInternalOpen

  const [name, setName] = useState(projectName)
  useEffect(() => { setName(projectName) }, [projectName])
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>(['music video', 'cinematic'])
  const [tagInput, setTagInput] = useState('')

  function handleSave() { onSave({ name: name.trim() || projectName, description, tags }); setOpen(false) }
  function addTag() { const t = tagInput.trim(); if (t && !tags.includes(t)) setTags([...tags, t]); setTagInput('') }
  function removeTag(tag: string) { setTags(tags.filter((t) => t !== tag)) }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-sm font-semibold">Project Settings</DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div className="space-y-1.5">
            <label htmlFor="proj-name" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Project Name</label>
            <input id="proj-name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors" />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="proj-desc" className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Description</label>
            <textarea id="proj-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="Optional project notes..." />
          </div>

          {/* Config grid */}
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Video Type" value="Full Music Video" options={['Full Music Video', 'Performance', 'Lyrics Video', 'Dance', 'Visualizer']} />
            <SelectField label="Video Style" value="Realistic" options={['Realistic', '3D Animation', 'Anime', 'Stylized']} />
            <SelectField label="Model" value="Cremi Signature" options={['Cremi Signature', 'Kling 3.0', 'VEO 3 Fast', 'Hailuo', 'Seedance', 'Wan']} />
            <SelectField label="Quality" value="SD 480p" options={['SD 480p', 'HD 720p', 'Full HD 1080p', '2K 1440p']} />
            <SelectField label="Aspect Ratio" value="16:9 Landscape" options={['16:9 Landscape', '9:16 Portrait', '1:1 Square', '4:5 Vertical']} />
            <SelectField label="Frame Rate" value="30fps" options={['24fps', '30fps', '60fps']} />
          </div>

          {/* Credits summary */}
          <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 px-3 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] text-muted-foreground">Estimated total cost</span>
            </div>
            <span className="text-sm font-bold text-amber-400 tabular-nums">947 credits</span>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Tags</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] text-primary font-medium">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-primary/60 hover:text-primary transition-colors cursor-pointer"><X className="h-2.5 w-2.5" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                placeholder="Add tag..." className="flex-1 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 text-[11px] text-foreground focus:outline-none focus:border-primary/50 transition-colors" />
              <button onClick={addTag} className="flex items-center gap-1 rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="px-5 pb-4">
          <button onClick={() => setOpen(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Cancel</button>
          <button onClick={handleSave} className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">Save</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SelectField({ label, value, options }: { label: string; value: string; options: string[] }) {
  const [selected, setSelected] = useState(value)
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="relative">
        <select value={selected} onChange={(e) => setSelected(e.target.value)}
          className="w-full rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 text-[11px] font-medium text-foreground appearance-none cursor-pointer focus:outline-none focus:border-primary/50 pr-6 transition-colors">
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" width="8" height="5" viewBox="0 0 8 5"><path d="M0 0l4 5 4-5z" fill="currentColor" opacity="0.4" /></svg>
      </div>
    </div>
  )
}
