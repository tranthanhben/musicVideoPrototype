import { cn } from '@/lib/utils'

interface DirectorsSlateProp {
  projectTitle: string
  sceneCount: number
  totalDuration: string
  status: string
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-amber-600 text-white',
  rendering: 'bg-red-600 text-white',
  complete: 'bg-emerald-600 text-white',
}

export function DirectorsSlate({
  projectTitle,
  sceneCount,
  totalDuration,
  status,
}: DirectorsSlateProp) {
  const badgeClass = cn(
    'px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider',
    STATUS_COLORS[status] ?? 'bg-muted text-foreground'
  )

  return (
    <div className="w-full rounded-lg overflow-hidden border border-border shadow-2xl">
      {/* Clapperboard stripes */}
      <div
        className="h-8 w-full"
        style={{
          background:
            'repeating-linear-gradient(135deg, #000 0px, #000 16px, #FAFAF9 16px, #FAFAF9 32px)',
        }}
      />

      {/* Slate body */}
      <div className="bg-card px-5 py-4 border-t-2 border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold mb-1">
              Production
            </p>
            <h1
              className="text-2xl font-bold text-foreground truncate"
              style={{ fontFamily: 'var(--font-playfair-display, serif)' }}
            >
              {projectTitle}
            </h1>
          </div>
          <span className={badgeClass}>{status}</span>
        </div>

        <div className="mt-3 flex items-center gap-6 text-sm text-muted-foreground">
          <span>
            <span className="text-foreground/80 font-semibold">{sceneCount}</span> scenes
          </span>
          <span>
            <span className="text-foreground/80 font-semibold">{totalDuration}</span> total
          </span>
          <span className="text-amber-500 font-semibold uppercase tracking-wide text-xs">
            Director&apos;s Cut
          </span>
        </div>
      </div>
    </div>
  )
}
