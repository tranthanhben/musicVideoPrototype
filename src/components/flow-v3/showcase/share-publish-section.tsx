'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Globe, Lock, Eye, UserPlus, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ShowcaseSection } from './showcase-section-wrapper'

type Privacy = 'public' | 'unlisted' | 'private'

const privacyOptions: { id: Privacy; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'public', label: 'Public', icon: <Globe className="h-3 w-3" />, desc: 'Anyone can view' },
  { id: 'unlisted', label: 'Unlisted', icon: <Eye className="h-3 w-3" />, desc: 'Only with link' },
  { id: 'private', label: 'Private', icon: <Lock className="h-3 w-3" />, desc: 'Only you' },
]

const socials = [
  { id: 'youtube', label: 'YouTube', color: 'hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/40', initial: 'YT' },
  { id: 'tiktok', label: 'TikTok', color: 'hover:bg-zinc-600/20 hover:text-zinc-300 hover:border-zinc-500/40', initial: 'TK' },
  { id: 'instagram', label: 'Instagram', color: 'hover:bg-pink-600/20 hover:text-pink-400 hover:border-pink-600/40', initial: 'IG' },
  { id: 'x', label: 'X (Twitter)', color: 'hover:bg-zinc-600/20 hover:text-zinc-300 hover:border-zinc-500/40', initial: 'X' },
]

const members = [
  { name: 'Alex Kim', initials: 'AK', role: 'Owner', color: 'bg-purple-700' },
  { name: 'Sam Lee', initials: 'SL', role: 'Editor', color: 'bg-blue-700' },
  { name: 'Mia Chen', initials: 'MC', role: 'Viewer', color: 'bg-emerald-700' },
]

const roleColors: Record<string, string> = {
  Owner: 'bg-primary/20 text-primary',
  Editor: 'bg-blue-900/50 text-blue-300',
  Viewer: 'bg-zinc-800 text-zinc-400',
}

const MOCK_URL = 'https://songgen.app/mv/midnight-dreams-4f2a9b'
const EMBED_CODE = `<iframe src="${MOCK_URL}/embed" width="640" height="360" frameborder="0" allowfullscreen></iframe>`

export function SharePublishSection() {
  const [privacy, setPrivacy] = useState<Privacy>('unlisted')
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  function copyText(text: string, setter: (v: boolean) => void) {
    navigator.clipboard.writeText(text).catch(() => {})
    setter(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setter(false), 2000)
  }

  return (
    <ShowcaseSection
      id="share-publish"
      title="Share & Publish"
      description="Share your music video or collaborate with your team"
      icon={<Share2 className="h-4 w-4 text-primary" />}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-4">
        {/* Privacy selector */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Privacy</p>
          <div className="flex gap-2">
            {privacyOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setPrivacy(opt.id)}
                className={cn(
                  'flex-1 rounded-lg border py-2 px-2 text-center transition-all',
                  privacy === opt.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40',
                )}
              >
                <div className={cn('flex justify-center mb-0.5', privacy === opt.id ? 'text-primary' : 'text-muted-foreground')}>{opt.icon}</div>
                <p className={cn('text-[10px] font-semibold', privacy === opt.id ? 'text-primary' : 'text-foreground')}>{opt.label}</p>
                <p className="text-[9px] text-muted-foreground">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Share link */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Share Link</p>
          <div className="flex gap-1.5">
            <div className="flex-1 rounded-lg border border-border bg-muted/30 px-3 py-1.5">
              <p className="text-[10px] text-muted-foreground truncate">{MOCK_URL}</p>
            </div>
            <button
              onClick={() => copyText(MOCK_URL, setCopiedLink)}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[10px] text-foreground hover:border-primary/60 transition-colors"
            >
              {copiedLink ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              {copiedLink ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Social sharing */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Share To</p>
          <div className="flex gap-2">
            {socials.map((s) => (
              <button
                key={s.id}
                className={cn('flex-1 rounded-lg border border-border py-2 text-[10px] font-semibold text-muted-foreground transition-all', s.color)}
              >
                {s.initial}
              </button>
            ))}
          </div>
        </div>

        {/* Embed code */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Embed Code</p>
            <button
              onClick={() => copyText(EMBED_CODE, setCopiedEmbed)}
              className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
            >
              {copiedEmbed ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copiedEmbed ? 'Copied' : 'Copy'}
            </button>
          </div>
          <textarea
            readOnly
            value={EMBED_CODE}
            rows={2}
            className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2 text-[9px] font-mono text-muted-foreground resize-none focus:outline-none"
          />
        </div>

        {/* Team collaboration */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Team</p>
            <button className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary hover:bg-primary/20 transition-colors border border-primary/30">
              <UserPlus className="h-3 w-3" /> Invite
            </button>
          </div>
          <div className="space-y-1.5">
            {members.map((m) => (
              <div key={m.name} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/30 transition-colors">
                <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white', m.color)}>{m.initials}</div>
                <p className="flex-1 text-[11px] text-foreground">{m.name}</p>
                <span className={cn('rounded px-1.5 py-0.5 text-[9px] font-medium', roleColors[m.role])}>{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </ShowcaseSection>
  )
}
