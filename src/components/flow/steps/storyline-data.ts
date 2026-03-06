// Mock scene descriptions per storyline — keyed by storyline id
export const SCENE_DESCRIPTIONS: Record<string, string[]> = {
  'celestial-journey': [
    'Wide shot: Two stars spiral toward each other in a violet nebula',
    'Close-up: Hands reaching through shimmering light streams',
    'Aerial: A galaxy arm sweeps across the frame in slow motion',
    'Medium: A figure floats weightless inside a glowing orb',
    'Macro: Light refracts through crystalline asteroid fields',
    'Wide: A supernova blooms behind silhouetted figures',
    'Close-up: Eyes reflecting the birth of a new star',
    'Final: Two forms of light merge at the edge of the universe',
  ],
  'urban-pulse': [
    'Establishing: Rain-slicked alley with neon reflections',
    'Tracking: Dancer moves through a crowded night market',
    'Cut: Rooftop silhouette against city light glow',
    'Low angle: Underground club strobes in sync with the beat',
    'Montage: Time-lapse traffic and flickering signs',
    'Final: Dancer freezes mid-air as the city exhales',
  ],
  'ocean-memory': [
    'Dawn: Misty shoreline, footprints dissolving in tide',
    'Flashback: Children chasing waves in warm summer haze',
    'Medium: A woman holds a faded photograph by the sea',
    'Underwater: Bioluminescent plankton drifts in slow motion',
    'Sunset: Golden light breaks across cresting waves',
    'Night: Full moon path shimmers on open water',
    'Close-up: Hands releasing a paper boat into the surf',
    'Aerial: The coastline curves into darkness',
    'Flashback: Two figures dancing on wet sand',
    'Final: Waves wash over footprints as the scene fades',
  ],
}

export function interpolateHex(hex1: string, hex2: string, t: number): string {
  const r1 = parseInt(hex1.slice(1, 3), 16)
  const g1 = parseInt(hex1.slice(3, 5), 16)
  const b1 = parseInt(hex1.slice(5, 7), 16)
  const r2 = parseInt(hex2.slice(1, 3), 16)
  const g2 = parseInt(hex2.slice(3, 5), 16)
  const b2 = parseInt(hex2.slice(5, 7), 16)
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`
}
