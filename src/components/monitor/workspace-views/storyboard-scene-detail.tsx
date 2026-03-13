'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Save, Camera, Eye, MapPin, User } from 'lucide-react'
import type { MockScene } from '@/lib/mock/types'

interface SceneDetailProps {
  scene: MockScene
  onClose: () => void
}

export function StoryboardSceneDetail({ scene, onClose }: SceneDetailProps) {
  const [editPrompt, setEditPrompt] = useState(scene.prompt)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scaleY: 0.96 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, y: 4, scaleY: 0.96 }}
      transition={{ duration: 0.18 }}
      className="col-span-3 rounded-xl border border-primary/25 bg-primary/5 p-3 -mt-1"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
          Scene {scene.index + 1} — Detail
        </span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-1.5 mb-2.5">
        <MetaRow icon={User} label="Subject" value={scene.subject} />
        <MetaRow icon={Eye} label="Action" value={scene.action} />
        <MetaRow icon={MapPin} label="Environment" value={scene.environment} />
        <MetaRow icon={Camera} label="Angle" value={scene.cameraAngle} />
        <div className="col-span-2">
          <MetaRow icon={Camera} label="Movement" value={scene.cameraMovement} />
        </div>
      </div>

      {/* Prompt edit */}
      <div>
        <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Full Prompt</p>
        <textarea
          value={editPrompt}
          onChange={(e) => setEditPrompt(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border/60 bg-background/80 px-2.5 py-2 text-[10px] text-foreground leading-relaxed resize-none focus:outline-none focus:border-primary/60 transition-colors"
        />
        <div className="flex justify-end mt-1.5">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg bg-primary/90 hover:bg-primary px-3 py-1.5 text-[10px] font-semibold text-primary-foreground transition-colors cursor-pointer"
          >
            <Save className="h-3 w-3" />
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function MetaRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5 rounded-lg bg-background/50 border border-border/30 px-2 py-1.5">
      <Icon className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-[10px] text-foreground leading-snug line-clamp-2">{value}</p>
      </div>
    </div>
  )
}
