import type { MockAudio, AudioSegment, EnergyPoint } from './types'

function generateBeatMarkers(bpm: number, durationSeconds: number): number[] {
  const beatInterval = 60 / bpm
  const markers: number[] = []
  let current = 0
  while (current <= durationSeconds) {
    markers.push(parseFloat(current.toFixed(3)))
    current += beatInterval
  }
  return markers
}

function generateEnergyCurve(
  duration: number,
  peakTimestamps: number[],
): EnergyPoint[] {
  const points: EnergyPoint[] = []
  const step = 2 // one point every 2 seconds
  for (let t = 0; t <= duration; t += step) {
    let energy = 0.25 + 0.15 * Math.sin((t / duration) * Math.PI)
    for (const peak of peakTimestamps) {
      const dist = Math.abs(t - peak)
      if (dist < 20) energy += (1 - dist / 20) * 0.55
    }
    energy = Math.min(1, Math.max(0, energy))
    const isPeak = peakTimestamps.some((p) => Math.abs(t - p) < 3)
    points.push({ time: t, energy: parseFloat(energy.toFixed(3)), isPeak })
  }
  return points
}

// --- Cosmic Love Story (192s / 3:12) ---

const cosmicSegments: AudioSegment[] = [
  { id: 'cs-1', label: 'Intro',    type: 'intro',   startTime: 0,   endTime: 16,  color: '#6366F1' },
  { id: 'cs-2', label: 'Verse 1',  type: 'verse',   startTime: 16,  endTime: 48,  color: '#8B5CF6' },
  { id: 'cs-3', label: 'Chorus 1', type: 'chorus',  startTime: 48,  endTime: 80,  color: '#EC4899' },
  { id: 'cs-4', label: 'Verse 2',  type: 'verse',   startTime: 80,  endTime: 112, color: '#8B5CF6' },
  { id: 'cs-5', label: 'Chorus 2', type: 'chorus',  startTime: 112, endTime: 144, color: '#EC4899' },
  { id: 'cs-6', label: 'Bridge',   type: 'bridge',  startTime: 144, endTime: 168, color: '#F59E0B' },
  { id: 'cs-7', label: 'Outro',    type: 'outro',   startTime: 168, endTime: 192, color: '#6366F1' },
]

export const cosmicLoveAudio: MockAudio = {
  title: 'Cosmic Love Story',
  artist: 'Aurora Synthwave',
  duration: 192,
  bpm: 128,
  key: 'A minor',
  beatMarkers: generateBeatMarkers(128, 192),
  segments: cosmicSegments,
  energyCurve: generateEnergyCurve(192, [78, 138, 165]),
}

// --- Neon City Nights (168s / 2:48) ---

const neonSegments: AudioSegment[] = [
  { id: 'ns-1', label: 'Intro',   type: 'intro',     startTime: 0,   endTime: 14,  color: '#06B6D4' },
  { id: 'ns-2', label: 'Drop 1',  type: 'drop',      startTime: 14,  endTime: 42,  color: '#F43F5E' },
  { id: 'ns-3', label: 'Break',   type: 'breakdown',  startTime: 42,  endTime: 70,  color: '#22D3EE' },
  { id: 'ns-4', label: 'Drop 2',  type: 'drop',      startTime: 70,  endTime: 112, color: '#F43F5E' },
  { id: 'ns-5', label: 'Bridge',  type: 'bridge',    startTime: 112, endTime: 140, color: '#F59E0B' },
  { id: 'ns-6', label: 'Outro',   type: 'outro',     startTime: 140, endTime: 168, color: '#06B6D4' },
]

export const neonCityAudio: MockAudio = {
  title: 'Neon City Nights',
  artist: 'Volt Collective',
  duration: 168,
  bpm: 140,
  key: 'F# minor',
  beatMarkers: generateBeatMarkers(140, 168),
  segments: neonSegments,
  energyCurve: generateEnergyCurve(168, [42, 84, 126]),
}

// --- Ocean Dreams (240s / 4:00) ---

const oceanSegments: AudioSegment[] = [
  { id: 'os-1', label: 'Intro',    type: 'intro',   startTime: 0,   endTime: 20,  color: '#0EA5E9' },
  { id: 'os-2', label: 'Verse 1',  type: 'verse',   startTime: 20,  endTime: 50,  color: '#6366F1' },
  { id: 'os-3', label: 'Chorus 1', type: 'chorus',  startTime: 50,  endTime: 80,  color: '#10B981' },
  { id: 'os-4', label: 'Verse 2',  type: 'verse',   startTime: 80,  endTime: 110, color: '#6366F1' },
  { id: 'os-5', label: 'Drop',     type: 'drop',    startTime: 110, endTime: 140, color: '#F43F5E' },
  { id: 'os-6', label: 'Chorus 2', type: 'chorus',  startTime: 140, endTime: 170, color: '#10B981' },
  { id: 'os-7', label: 'Bridge',   type: 'bridge',  startTime: 170, endTime: 210, color: '#F59E0B' },
  { id: 'os-8', label: 'Outro',    type: 'outro',   startTime: 210, endTime: 240, color: '#0EA5E9' },
]

export const oceanDreamsAudio: MockAudio = {
  title: 'Ocean Dreams',
  artist: 'Tide & Wave',
  duration: 240,
  bpm: 96,
  key: 'D major',
  beatMarkers: generateBeatMarkers(96, 240),
  segments: oceanSegments,
  energyCurve: generateEnergyCurve(240, [60, 144, 210]),
}
