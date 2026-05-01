const COLOR_STOPS = [
  { t: 0,    r: 124, g: 58,  b: 237 },
  { t: 0.20, r: 236, g: 72,  b: 153 },
  { t: 0.40, r: 239, g: 68,  b: 68  },
  { t: 0.58, r: 249, g: 115, b: 22  },
  { t: 0.74, r: 234, g: 179, b: 8   },
  { t: 0.88, r: 34,  g: 197, b: 94  },
  { t: 1.00, r: 6,   g: 182, b: 212 },
]

export function scoreToColor(score: number): string {
  const t = Math.max(0, Math.min(score / 100, 1))
  let lo = COLOR_STOPS[0]
  let hi = COLOR_STOPS[COLOR_STOPS.length - 1]
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    if (t >= COLOR_STOPS[i].t && t <= COLOR_STOPS[i + 1].t) {
      lo = COLOR_STOPS[i]; hi = COLOR_STOPS[i + 1]; break
    }
  }
  const span = hi.t - lo.t
  const f = span === 0 ? 0 : (t - lo.t) / span
  return `rgb(${Math.round(lo.r + f * (hi.r - lo.r))},${Math.round(lo.g + f * (hi.g - lo.g))},${Math.round(lo.b + f * (hi.b - lo.b))})`
}
