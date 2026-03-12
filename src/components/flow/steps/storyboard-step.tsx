'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GripVertical, Pencil, Trash2, Plus, X, Check, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockProjects } from '@/lib/mock/projects'
import type { MockScene } from '@/lib/mock/types'

interface StoryboardStepProps {
  trackIndex: number
  onContinue: () => void
}

interface EditableScene extends MockScene {
  isNew?: boolean
}

export function StoryboardStep({ trackIndex, onContinue }: StoryboardStepProps) {
  const project = mockProjects[trackIndex] ?? mockProjects[0]
  const [scenes, setScenes] = useState<EditableScene[]>(project.scenes)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editSubject, setEditSubject] = useState('')
  const [editAction, setEditAction] = useState('')
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)

  const startEdit = useCallback((scene: EditableScene) => {
    setEditingId(scene.id)
    setEditSubject(scene.subject)
    setEditAction(scene.action)
  }, [])

  function saveEdit() {
    if (!editingId) return
    setScenes((prev) => prev.map((s) =>
      s.id === editingId ? { ...s, subject: editSubject, action: editAction } : s
    ))
    setEditingId(null)
  }

  function deleteScene(id: string) {
    setScenes((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, index: i })))
  }

  function insertScene(afterIndex: number) {
    const newId = `new-scene-${Date.now()}`
    const newScene: EditableScene = {
      id: newId,
      index: afterIndex + 1,
      subject: 'New Scene',
      action: 'describe action here',
      environment: 'environment',
      cameraAngle: 'medium shot',
      cameraMovement: 'slow pan',
      prompt: '',
      thumbnailUrl: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%2327272a"/><text x="200" y="150" fill="%23a1a1aa" font-size="14" text-anchor="middle" dominant-baseline="middle">New Scene</text></svg>`,
      duration: 20,
      status: 'init',
      takes: [],
      isNew: true,
    }
    setScenes((prev) => {
      const copy = [...prev]
      copy.splice(afterIndex + 1, 0, newScene)
      return copy.map((s, i) => ({ ...s, index: i }))
    })
    startEdit(newScene)
  }

  function handleDragStart(idx: number) { setDraggedIdx(idx) }
  function handleDragOver(e: React.DragEvent, idx: number) { e.preventDefault(); setDragOverIdx(idx) }
  function handleDragEnd() { setDraggedIdx(null); setDragOverIdx(null) }

  function handleDrop(idx: number) {
    if (draggedIdx === null || draggedIdx === idx) { handleDragEnd(); return }
    setScenes((prev) => {
      const copy = [...prev]
      const [moved] = copy.splice(draggedIdx, 1)
      copy.splice(idx, 0, moved)
      return copy.map((s, i) => ({ ...s, index: i }))
    })
    handleDragEnd()
  }

  return (
    <div className="flex h-full flex-col overflow-hidden p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 shrink-0"
      >
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <div>
            <h2 className="text-lg font-bold text-foreground">Storyboard</h2>
            <p className="text-xs text-muted-foreground">{scenes.length} scenes · drag to reorder · click to edit</p>
          </div>
        </div>
        <button
          onClick={onContinue}
          className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
        >
          Generate Videos
        </button>
      </motion.div>

      {/* Scene grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
          {scenes.map((scene, idx) => {
            const isEditing = editingId === scene.id
            const isDragged = draggedIdx === idx
            const isDragOver = dragOverIdx === idx

            return (
              <div key={scene.id}>
                <motion.div
                  layout
                  draggable={!isEditing}
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e: React.DragEvent) => handleDragOver(e, idx)}
                  onDrop={() => handleDrop(idx)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    'relative rounded-xl border overflow-hidden transition-all group',
                    isDragged && 'opacity-30 scale-95',
                    isDragOver && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]',
                    isEditing ? 'border-primary shadow-md shadow-primary/20' : 'border-border hover:border-border/60',
                  )}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video relative bg-muted">
                    <img
                      src={scene.thumbnailUrl}
                      alt={`Scene ${scene.index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Scene number badge — prominent */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      {!isEditing && (
                        <GripVertical className="h-3.5 w-3.5 text-white/70 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                      <span className="rounded-lg bg-black/70 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm border border-white/10">
                        S{scene.index + 1}
                      </span>
                      {scene.isNew && (
                        <span className="rounded-full bg-primary/80 px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground">
                          NEW
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    {!isEditing && (
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => startEdit(scene)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/70 text-white cursor-pointer hover:bg-black/90 backdrop-blur-sm"
                        >
                          <Pencil className="h-3 w-3" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteScene(scene.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/80 text-white cursor-pointer hover:bg-red-600 backdrop-blur-sm"
                        >
                          <Trash2 className="h-3 w-3" />
                        </motion.button>
                      </div>
                    )}

                    {/* Bottom label */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-[10px] font-medium text-white truncate">
                        {scene.subject} — {scene.action}
                      </p>
                      <p className="text-[9px] text-white/50 truncate">{scene.environment}</p>
                    </div>
                  </div>

                  {/* Edit form */}
                  <AnimatePresence>
                    {isEditing && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 space-y-2 bg-card border-t border-border">
                          <input
                            value={editSubject}
                            onChange={(e) => setEditSubject(e.target.value)}
                            autoFocus
                            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                            placeholder="Subject"
                          />
                          <input
                            value={editAction}
                            onChange={(e) => setEditAction(e.target.value)}
                            className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                            placeholder="Action"
                          />
                          <div className="flex gap-1.5">
                            <button
                              onClick={saveEdit}
                              className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-primary py-1.5 text-[10px] font-semibold text-primary-foreground cursor-pointer hover:bg-primary/90"
                            >
                              <Check className="h-3 w-3" /> Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-border py-1.5 text-[10px] font-medium text-muted-foreground cursor-pointer hover:bg-muted"
                            >
                              <X className="h-3 w-3" /> Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Insert between scenes — always visible with hover reveal */}
                <div className="flex justify-center py-1.5">
                  <motion.button
                    onClick={() => insertScene(idx)}
                    whileHover={{ scale: 1.2 }}
                    className="flex h-5 w-5 items-center justify-center rounded-full border border-dashed border-border/60 text-muted-foreground/50 opacity-0 hover:opacity-100 focus:opacity-100 transition-all cursor-pointer hover:border-primary hover:text-primary hover:bg-primary/10 group-hover:opacity-60"
                  >
                    <Plus className="h-3 w-3" />
                  </motion.button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
