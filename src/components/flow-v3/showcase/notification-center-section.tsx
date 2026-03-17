'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Download, AlertTriangle, Users, XCircle, Sparkles, Bell } from 'lucide-react'
import { ShowcaseSection } from './showcase-section-wrapper'
import { cn } from '@/lib/utils'

type NotifType = 'generation_complete' | 'export_ready' | 'credit_low' | 'team_invite' | 'generation_failed' | 'system_update'

interface Notification {
  id: number
  type: NotifType
  title: string
  description: string
  time: string
  read: boolean
}

const ICON_MAP: Record<NotifType, { icon: React.ElementType; color: string; bg: string }> = {
  generation_complete: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  export_ready:       { icon: Download,     color: 'text-blue-400',   bg: 'bg-blue-400/10'   },
  credit_low:         { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10'  },
  team_invite:        { icon: Users,         color: 'text-purple-400', bg: 'bg-purple-400/10' },
  generation_failed:  { icon: XCircle,       color: 'text-red-400',   bg: 'bg-red-400/10'    },
  system_update:      { icon: Sparkles,      color: 'text-zinc-400',  bg: 'bg-zinc-400/10'   },
}

const INITIAL: Notification[] = [
  { id: 1, type: 'generation_complete', title: 'Scene generation complete', description: 'All 39 scenes for Solar Flare are ready', time: '5 min ago', read: false },
  { id: 2, type: 'export_ready',        title: 'Export ready',              description: 'Midnight Dreams MV (1080p) is ready to download', time: '1 hr ago', read: false },
  { id: 3, type: 'credit_low',          title: 'Credits running low',       description: 'You have 150 credits remaining. Top up to continue.', time: '2 hr ago', read: false },
  { id: 4, type: 'team_invite',         title: 'Team invitation',           description: 'Alex invited you to collaborate on Neon Pulse', time: 'Yesterday', read: true },
  { id: 5, type: 'generation_failed',   title: 'Generation failed',         description: 'Scene 12 of Ocean Drift failed. Retry?', time: 'Yesterday', read: true },
  { id: 6, type: 'system_update',       title: 'System update',             description: "New VFX preset 'Holographic' is now available", time: '2 days ago', read: true },
]

export function NotificationCenterSection() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL)

  const unreadCount = notifications.filter(n => !n.read).length

  const toggleRead = (id: number) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n))

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))

  return (
    <ShowcaseSection
      id="notification-center"
      title="Notification Center"
      description="Manage alerts and updates from your projects"
      icon={<Bell className="h-4 w-4 text-primary" />}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-zinc-200">Notifications</span>
          {unreadCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-bold text-white">
              {unreadCount}
            </span>
          )}
          <span className="text-[10px] text-zinc-500">{unreadCount} unread</span>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors">
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-1">
        {notifications.map((n, i) => {
          const { icon: Icon, color, bg } = ICON_MAP[n.type]
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => toggleRead(n.id)}
              className={cn(
                'flex items-start gap-3 rounded-lg p-2.5 cursor-pointer transition-colors',
                n.read ? 'opacity-50 hover:opacity-75 hover:bg-zinc-800/30' : 'hover:bg-zinc-800/50'
              )}
            >
              <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', bg)}>
                <Icon className={cn('h-3.5 w-3.5', color)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] font-medium text-zinc-200 leading-snug">{n.title}</p>
                  {!n.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />}
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug mt-0.5">{n.description}</p>
                <p className="text-[10px] text-zinc-600 mt-1">{n.time}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </ShowcaseSection>
  )
}
