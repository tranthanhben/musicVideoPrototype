'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, ChevronDown, AlertTriangle } from 'lucide-react'
import { ShowcaseSection } from './showcase-section-wrapper'
import { cn } from '@/lib/utils'

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        'relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-200',
        checked ? 'bg-purple-600' : 'bg-zinc-700'
      )}
      role="switch"
      aria-checked={checked}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn(
          'pointer-events-none absolute top-0.5 h-3 w-3 rounded-full bg-white shadow',
          checked ? 'left-3.5' : 'left-0.5'
        )}
      />
    </button>
  )
}

function SelectField({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none rounded-md border border-zinc-700 bg-zinc-800 py-1.5 pl-2.5 pr-7 text-[11px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" />
    </div>
  )
}

function GroupHeader({ label }: { label: string }) {
  return <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600 mb-2 mt-4 first:mt-0">{label}</p>
}

function PrefRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/60 last:border-0">
      <span className="text-[11px] text-zinc-400">{label}</span>
      <div className="ml-4 shrink-0">{children}</div>
    </div>
  )
}

export function UserPreferencesSection() {
  const [model,     setModel]    = useState('Cremi Signature')
  const [quality,   setQuality]  = useState('Full HD 1080p')
  const [style,     setStyle]    = useState('Realistic')
  const [autoSave,  setAutoSave] = useState('1m')
  const [emailNotif,     setEmailNotif]     = useState(true)
  const [genComplete,    setGenComplete]    = useState(true)
  const [creditWarn,     setCreditWarn]     = useState(true)
  const [creditThreshold, setCreditThreshold] = useState('100')
  const [darkTheme,  setDarkTheme]  = useState(true)
  const [compact,    setCompact]    = useState(false)
  const [showCost,   setShowCost]   = useState(true)
  const [displayName, setDisplayName] = useState('Jamie Davis')

  return (
    <ShowcaseSection
      id="user-preferences"
      title="User Preferences"
      description="Customize generation defaults, notifications, and interface"
      icon={<Settings className="h-4 w-4 text-primary" />}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

        <GroupHeader label="Generation Defaults" />
        <PrefRow label="Default Model">
          <SelectField value={model} onChange={setModel}
            options={['Cremi Signature', 'Kling 3.0', 'VEO 3 Fast', 'Hailuo', 'Seedance', 'Wan']} />
        </PrefRow>
        <PrefRow label="Default Quality">
          <SelectField value={quality} onChange={setQuality}
            options={['SD 480p', 'HD 720p', 'Full HD 1080p']} />
        </PrefRow>
        <PrefRow label="Default Style">
          <SelectField value={style} onChange={setStyle}
            options={['Realistic', '3D Animation', 'Anime', 'Stylized']} />
        </PrefRow>

        <GroupHeader label="Notifications" />
        <PrefRow label="Email notifications">
          <Toggle checked={emailNotif} onChange={() => setEmailNotif(v => !v)} />
        </PrefRow>
        <PrefRow label="Generation complete alerts">
          <Toggle checked={genComplete} onChange={() => setGenComplete(v => !v)} />
        </PrefRow>
        <div className="flex items-start justify-between py-1.5 border-b border-zinc-800/60">
          <div>
            <span className="text-[11px] text-zinc-400">Credit low warnings</span>
            {creditWarn && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-600">Alert when below:</span>
                <input
                  type="number"
                  value={creditThreshold}
                  onChange={e => setCreditThreshold(e.target.value)}
                  className="w-14 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[11px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
                <span className="text-[10px] text-zinc-600">credits</span>
              </div>
            )}
          </div>
          <div className="ml-4 mt-0.5 shrink-0">
            <Toggle checked={creditWarn} onChange={() => setCreditWarn(v => !v)} />
          </div>
        </div>

        <GroupHeader label="Interface" />
        <PrefRow label="Theme">
          <div className="flex rounded-md border border-zinc-700 overflow-hidden text-[10px] font-medium">
            {(['Dark', 'Light'] as const).map(t => (
              <button
                key={t}
                onClick={() => setDarkTheme(t === 'Dark')}
                className={cn(
                  'px-2.5 py-1 transition-colors',
                  (t === 'Dark') === darkTheme ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                )}
              >{t}</button>
            ))}
          </div>
        </PrefRow>
        <PrefRow label="Compact mode">
          <Toggle checked={compact} onChange={() => setCompact(v => !v)} />
        </PrefRow>
        <PrefRow label="Show cost estimates">
          <Toggle checked={showCost} onChange={() => setShowCost(v => !v)} />
        </PrefRow>
        <PrefRow label="Auto-save interval">
          <SelectField value={autoSave} onChange={setAutoSave} options={['30s', '1m', '5m', 'Manual']} />
        </PrefRow>

        <GroupHeader label="Account" />
        <PrefRow label="Display name">
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-36 rounded-md border border-zinc-700 bg-zinc-800 py-1 px-2 text-[11px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
          />
        </PrefRow>
        <PrefRow label="Email">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500">jamie@songgen.io</span>
            <button className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors">Change</button>
          </div>
        </PrefRow>

        <div className="mt-4 pt-3 border-t border-zinc-800">
          <button className="flex items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-[11px] text-red-400/70 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-colors">
            <AlertTriangle className="h-3 w-3" />
            Delete Account
          </button>
        </div>
      </motion.div>
    </ShowcaseSection>
  )
}
