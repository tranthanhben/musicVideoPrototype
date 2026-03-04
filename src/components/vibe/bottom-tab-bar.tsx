'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Grid, Plus, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomTabBar() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-[var(--border)] bg-white">
      <div className="flex items-end justify-around px-4 py-2">
        {/* Home tab */}
        <Link
          href="/vibe"
          className={cn(
            'flex flex-col items-center gap-1 pb-1 pt-2 min-w-[44px]',
            pathname === '/vibe' ? 'text-pink-500' : 'text-slate-400'
          )}
        >
          <Grid className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* Create tab - elevated */}
        <Link
          href="/vibe/create"
          className="flex flex-col items-center gap-1 -mb-2"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
            style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
          >
            <Plus className="h-7 w-7 text-white" strokeWidth={2.5} />
          </div>
          <span className={cn(
            'text-[10px] font-medium mt-1',
            pathname === '/vibe/create' ? 'text-pink-500' : 'text-slate-400'
          )}>
            Create
          </span>
        </Link>

        {/* Profile tab */}
        <Link
          href="/vibe"
          className="flex flex-col items-center gap-1 pb-1 pt-2 text-slate-400 min-w-[44px]"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </div>
      {/* iOS safe area padding */}
      <div className="h-safe-bottom" />
    </div>
  )
}
