'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  LayoutGrid, Sparkles, FolderOpen, Users, Download, Share2,
  Clock, Bell, BarChart2, ListOrdered, Settings, ArrowLeft, Keyboard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProjectDashboardSection } from '@/components/flow-v3/showcase/project-dashboard-section'
import { CreditsBillingSection } from '@/components/flow-v3/showcase/credits-billing-section'
import { AssetLibrarySection } from '@/components/flow-v3/showcase/asset-library-section'
import { CharacterLibrarySection } from '@/components/flow-v3/showcase/character-library-section'
import { ExportSettingsSection } from '@/components/flow-v3/showcase/export-settings-section'
import { SharePublishSection } from '@/components/flow-v3/showcase/share-publish-section'
import { VersionHistorySection } from '@/components/flow-v3/showcase/version-history-section'
import { NotificationCenterSection } from '@/components/flow-v3/showcase/notification-center-section'
import { UsageAnalyticsSection } from '@/components/flow-v3/showcase/usage-analytics-section'
import { GenerationQueueSection } from '@/components/flow-v3/showcase/generation-queue-section'
import { UserPreferencesSection } from '@/components/flow-v3/showcase/user-preferences-section'
import { KeyboardShortcutsSection } from '@/components/flow-v3/showcase/keyboard-shortcuts-section'

const navItems = [
  { id: 'project-dashboard', label: 'Project Dashboard', icon: LayoutGrid },
  { id: 'credits-billing', label: 'Credits & Billing', icon: Sparkles },
  { id: 'asset-library', label: 'Asset Library', icon: FolderOpen },
  { id: 'character-library', label: 'Character Library', icon: Users },
  { id: 'export-settings', label: 'Export Settings', icon: Download },
  { id: 'share-publish', label: 'Share & Publish', icon: Share2 },
  { id: 'version-history', label: 'Version History', icon: Clock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'usage-analytics', label: 'Usage Analytics', icon: BarChart2 },
  { id: 'generation-queue', label: 'Generation Queue', icon: ListOrdered },
  { id: 'user-preferences', label: 'User Preferences', icon: Settings },
  { id: 'keyboard-shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
]

export default function ShowcasePage() {
  const [activeSection, setActiveSection] = useState('project-dashboard')

  useEffect(() => {
    const container = document.getElementById('showcase-scroll')
    if (!container) return
    function onScroll() {
      const scrollY = container!.scrollTop + 100
      const sections = navItems.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[]
      for (let i = sections.length - 1; i >= 0; i--) {
        if (sections[i].offsetTop <= scrollY) {
          setActiveSection(sections[i].id)
          break
        }
      }
    }
    container.addEventListener('scroll', onScroll)
    return () => container.removeEventListener('scroll', onScroll)
  }, [])

  function scrollToSection(id: string) {
    const el = document.getElementById(id)
    const container = document.getElementById('showcase-scroll')
    if (el && container) {
      container.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' })
      setActiveSection(id)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-border bg-card/40 overflow-y-auto">
        <div className="p-4 border-b border-border">
          <Link href="/flow-v3" className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors mb-3">
            <ArrowLeft className="h-3 w-3" /> Back to Prototype
          </Link>
          <h1 className="text-[13px] font-bold text-foreground">Product Components</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">Component gallery & preview</p>
        </div>
        <nav className="flex-1 p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={cn(
                'w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[11px] transition-colors mb-0.5',
                activeSection === item.id
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main scroll area */}
      <main id="showcase-scroll" className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-10">
          <ProjectDashboardSection />
          <CreditsBillingSection />
          <AssetLibrarySection />
          <CharacterLibrarySection />
          <ExportSettingsSection />
          <SharePublishSection />
          <VersionHistorySection />
          <NotificationCenterSection />
          <UsageAnalyticsSection />
          <GenerationQueueSection />
          <UserPreferencesSection />
          <KeyboardShortcutsSection />

          <div className="h-16" />
        </div>
      </main>
    </div>
  )
}
