'use client'

import { useEffect, useRef, useState } from 'react'
import { scoreToColor } from '@/lib/scoreColor'

interface DonutChartProps {
  score: number
  label: string
}

// Arc-position color (t: 0–1 along the arc) — kept local since it's only for canvas drawing
const COLOR_STOPS = [
  { t: 0,    r: 124, g: 58,  b: 237 },
  { t: 0.20, r: 236, g: 72,  b: 153 },
  { t: 0.40, r: 239, g: 68,  b: 68  },
  { t: 0.58, r: 249, g: 115, b: 22  },
  { t: 0.74, r: 234, g: 179, b: 8   },
  { t: 0.88, r: 34,  g: 197, b: 94  },
  { t: 1.00, r: 6,   g: 182, b: 212 },
]

function lerpColor(t: number): string {
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

const toRad = (deg: number) => (deg * Math.PI) / 180

export default function DonutChart({ score, label }: DonutChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [animated, setAnimated] = useState(0)

  // Smooth rAF animation from 0 → score
  useEffect(() => {
    const duration = 1200
    const start = performance.now()
    let raf: number
    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1)
      setAnimated((1 - Math.pow(1 - t, 3)) * score)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    const id = setTimeout(() => { raf = requestAnimationFrame(tick) }, 80)
    return () => { clearTimeout(id); cancelAnimationFrame(raf) }
  }, [score])

  // Redraw canvas whenever animation progresses
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const SIZE = 200
    const DPR  = window.devicePixelRatio || 1
    canvas.width  = SIZE * DPR
    canvas.height = SIZE * DPR
    ctx.scale(DPR, DPR)

    const cx = SIZE / 2
    const cy = SIZE / 2
    const r  = 78
    const lw = 13

    ctx.clearRect(0, 0, SIZE, SIZE)

    // Gray track (270° open at the bottom)
    ctx.beginPath()
    ctx.arc(cx, cy, r, toRad(-225), toRad(45))
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth   = lw
    ctx.lineCap     = 'round'
    ctx.stroke()

    if (animated <= 0) return

    // Draw gradient arc as 300 tiny butt-capped segments → perfectly smooth
    const N = 300
    const filledDeg = (animated / 100) * 270

    for (let i = 0; i < N; i++) {
      const t0  = i / N
      const t1  = (i + 1) / N
      const deg0 = t0 * 270
      if (deg0 >= filledDeg) break

      const deg1    = Math.min(t1 * 270, filledDeg)
      const ang0    = toRad(-225 + deg0)
      const ang1    = toRad(-225 + deg1)
      const isFirst = i === 0
      const isLast  = deg1 >= filledDeg

      ctx.beginPath()
      ctx.arc(cx, cy, r, ang0, ang1)
      ctx.strokeStyle = lerpColor(t0)
      ctx.lineWidth   = lw
      ctx.lineCap     = isFirst || isLast ? 'round' : 'butt'
      ctx.stroke()
    }
  }, [animated])

  // Single source of truth for the score color — reused across score text, label, and progress bar
  const scoreColor = scoreToColor(score)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: 200, height: 200 }}>
        <canvas ref={canvasRef} style={{ width: 200, height: 200 }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ paddingBottom: 4 }}>
          <span style={{ fontSize: 48, fontWeight: 800, fontFamily: 'ui-monospace, monospace', color: scoreColor, lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'system-ui, sans-serif', marginTop: 6 }}>
            puntuación
          </span>
        </div>
      </div>

      <span className="text-white text-sm font-bold px-5 py-1.5 rounded"
        style={{ backgroundColor: scoreColor }}>
        {label}
      </span>
      <span className="text-[14px] text-gray-600 font-medium text-center leading-snug">
        {score >= 80
          ? '¡Excelente! Tu landing está optimizada.'
          : score >= 60
          ? '¡Bien hecho! Hay áreas de mejora.'
          : 'Hay problemas críticos que deben resolverse.'}
      </span>
    </div>
  )
}
