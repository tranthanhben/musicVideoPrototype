/**
 * Simulates AI generation progress over a given duration.
 * Uses setInterval for SSR compatibility (no requestAnimationFrame in Node).
 */
export function simulateGeneration(
  durationMs: number,
  onProgress: (progress: number) => void
): Promise<void> {
  return new Promise((resolve) => {
    const intervalMs = 50
    const steps = durationMs / intervalMs
    let currentStep = 0

    const interval = setInterval(() => {
      currentStep++
      // Ease-out curve: fast at start, slows near 100
      const raw = currentStep / steps
      const eased = 1 - Math.pow(1 - raw, 2)
      const progress = Math.min(100, Math.round(eased * 100))
      onProgress(progress)

      if (currentStep >= steps) {
        clearInterval(interval)
        onProgress(100)
        resolve()
      }
    }, intervalMs)
  })
}
