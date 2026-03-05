'use client'

import type { MockScene } from '@/lib/mock/types'

interface PropertyInspectorProps {
  scene: MockScene | null
  onUpdate: (field: string, value: string) => void
  onGenerate: () => void
}

const MONO = 'JetBrains Mono, monospace'

const statusColors: Record<string, string> = {
  init: 'bg-muted text-muted-foreground',
  generating: 'bg-amber-500/20 text-amber-400',
  completed: 'bg-emerald-500/20 text-emerald-400',
  failed: 'bg-red-500/20 text-red-400',
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block mb-0.5 uppercase tracking-wider opacity-50"
      style={{ fontSize: 10, fontFamily: MONO }}
    >
      {children}
    </label>
  )
}

function Field({
  label,
  value,
  rows,
  onChange,
}: {
  label: string
  value: string
  rows?: number
  onChange: (v: string) => void
}) {
  if (rows && rows > 1) {
    return (
      <div className="mb-2">
        <Label>{label}</Label>
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none rounded px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-violet-500"
          style={{
            fontFamily: MONO,
            background: 'hsl(var(--muted))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          }}
        />
      </div>
    )
  }
  return (
    <div className="mb-2">
      <Label>{label}</Label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-violet-500"
        style={{
          fontFamily: MONO,
          background: 'hsl(var(--muted))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        }}
      />
    </div>
  )
}

export function PropertyInspector({ scene, onUpdate, onGenerate }: PropertyInspectorProps) {
  if (!scene) {
    return (
      <div className="flex items-center justify-center h-full opacity-30">
        <span style={{ fontFamily: MONO, fontSize: 11 }}>SELECT A SCENE</span>
      </div>
    )
  }

  const statusClass = statusColors[scene.status] ?? 'bg-muted text-muted-foreground'

  return (
    <div className="h-full overflow-y-auto px-3 py-3" style={{ fontFamily: MONO }}>
      {/* Scene Info */}
      <div className="mb-3 pb-2 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] uppercase tracking-wider opacity-70">
            Scene {scene.index + 1}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide ${statusClass}`}>
            {scene.status}
          </span>
        </div>
        <div className="text-[10px] opacity-40">
          Duration: {scene.duration}s
        </div>
      </div>

      {/* Editable fields */}
      <Field
        label="Subject"
        value={scene.subject}
        rows={2}
        onChange={(v) => onUpdate('subject', v)}
      />
      <Field
        label="Action"
        value={scene.action}
        rows={2}
        onChange={(v) => onUpdate('action', v)}
      />
      <Field
        label="Environment"
        value={scene.environment}
        rows={2}
        onChange={(v) => onUpdate('environment', v)}
      />
      <Field
        label="Camera Angle"
        value={scene.cameraAngle}
        onChange={(v) => onUpdate('cameraAngle', v)}
      />
      <Field
        label="Camera Movement"
        value={scene.cameraMovement}
        onChange={(v) => onUpdate('cameraMovement', v)}
      />
      <Field
        label="Prompt"
        value={scene.prompt}
        rows={3}
        onChange={(v) => onUpdate('prompt', v)}
      />

      {/* Regenerate button */}
      <button
        onClick={onGenerate}
        className="w-full mt-2 py-2 rounded text-[11px] uppercase tracking-widest transition-colors duration-150 hover:bg-violet-500"
        style={{
          fontFamily: MONO,
          background: '#7C3AED',
          color: '#fff',
        }}
      >
        Regenerate Scene
      </button>
    </div>
  )
}
