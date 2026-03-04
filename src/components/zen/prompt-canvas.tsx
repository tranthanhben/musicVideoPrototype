'use client'

interface PromptCanvasProps {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder: string
}

export function PromptCanvas({ value, onChange, label: _label, placeholder }: PromptCanvasProps) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="w-full resize-none bg-transparent text-[18px] leading-[1.75] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none border-b border-[var(--border)] focus:border-[var(--accent)] transition-colors duration-200 pb-2"
        style={{ fontFamily: 'var(--font-ibm-plex-mono, "IBM Plex Mono", monospace)' }}
      />
      <div className="flex justify-end mt-1">
        <span className="text-[14px] text-[var(--muted-foreground)] tabular-nums">
          {value.length}
        </span>
      </div>
    </div>
  )
}
