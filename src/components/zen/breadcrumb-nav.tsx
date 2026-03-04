import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav className="flex items-center gap-2 text-[14px] mb-8">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && (
              <span className="text-[var(--muted-foreground)] select-none">{'>'}</span>
            )}
            {isLast || !item.href ? (
              <span className="text-[var(--foreground)]">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className="text-[var(--muted-foreground)] transition-opacity duration-200 hover:opacity-70"
              >
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
