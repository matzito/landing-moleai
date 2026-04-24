'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Layout ──────────────────────────────────────────────────────────────────
const NODE_W = 110
const NODE_H = 82
const HW = NODE_W / 2   // 55
const HH = NODE_H / 2   // 41
const SVG_W = 485
const SVG_H = 310

// ─── Types ───────────────────────────────────────────────────────────────────
type NodeType = 'source' | 'agent' | 'output'
type ActivityStatus = 'done' | 'running' | 'queued' | 'live'

interface Activity {
  text: string
  status: ActivityStatus
  time: string
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS: Record<ActivityStatus, { label: string; color: string; icon: string }> = {
  done:    { label: 'Completado', color: '#4ade80', icon: '✓' },
  running: { label: 'Ejecutando', color: '#2dd4bf', icon: '▶' },
  queued:  { label: 'En cola',    color: '#475569', icon: '⏳' },
  live:    { label: 'Activo',     color: '#38bdf8', icon: '●' },
}

// ─── Nodes with cycling frames ────────────────────────────────────────────────
const NODES: Array<{
  id: string; label: string; initials: string
  cx: number; cy: number; type: NodeType
  frames: Activity[][]
}> = [
  {
    id: 'n1', label: 'Data Source', initials: 'DS',
    cx: 58, cy: 85, type: 'source',
    frames: [
      [
        { text: 'Stream iniciado',  status: 'live',    time: 'ahora' },
        { text: '1.247 registros',  status: 'live',    time: '1m'    },
      ],
      [
        { text: 'Leyendo batch #4', status: 'running', time: '30s'   },
        { text: '3.891 registros',  status: 'live',    time: '2m'    },
      ],
      [
        { text: 'Validando schema', status: 'running', time: '10s'   },
        { text: 'Batch completado', status: 'done',    time: '3m'    },
      ],
    ],
  },
  {
    id: 'n2', label: 'Planner', initials: 'PL',
    cx: 188, cy: 85, type: 'agent',
    frames: [
      [
        { text: 'Plan generado',    status: 'done',    time: '2m'    },
        { text: 'Sub-tareas divid.',status: 'done',    time: '1m'    },
      ],
      [
        { text: 'Analizando deps.', status: 'running', time: 'ahora' },
        { text: 'Re-planificando',  status: 'running', time: '20s'   },
      ],
      [
        { text: 'Prioridades asig.',status: 'done',    time: '45s'   },
        { text: 'Recursos mapeados',status: 'done',    time: '30s'   },
      ],
    ],
  },
  {
    id: 'n3', label: 'Executor', initials: 'EX',
    cx: 318, cy: 85, type: 'agent',
    frames: [
      [
        { text: 'Esperando ctx',    status: 'queued',  time: '8m'    },
        { text: 'Siguiente en cola',status: 'queued',  time: '6m'    },
      ],
      [
        { text: 'Ejecutando tarea', status: 'running', time: 'ahora' },
        { text: 'Tool call #3',     status: 'running', time: '5s'    },
      ],
      [
        { text: 'Tarea completada', status: 'done',    time: '1m'    },
        { text: 'Siguiente en cola',status: 'queued',  time: '2m'    },
      ],
    ],
  },
  {
    id: 'n4', label: 'Response', initials: 'RE',
    cx: 448, cy: 85, type: 'output',
    frames: [
      [
        { text: 'Conectando fuentes',status: 'running', time: '5m'   },
        { text: 'Fusionando ctx',    status: 'running', time: '3m'   },
      ],
      [
        { text: 'Generando resp.',   status: 'running', time: 'ahora'},
        { text: 'Tokens: 1.2k',      status: 'live',    time: '10s'  },
      ],
      [
        { text: 'Respuesta lista',   status: 'done',    time: '30s'  },
        { text: 'Enviando output',   status: 'running', time: '5s'   },
      ],
    ],
  },
  {
    id: 'n5', label: 'Validator', initials: 'VA',
    cx: 318, cy: 232, type: 'agent',
    frames: [
      [
        { text: 'Esperando result.', status: 'queued',  time: '11m'  },
        { text: 'Validación pend.',  status: 'queued',  time: '9m'   },
      ],
      [
        { text: 'Validando salida',  status: 'running', time: 'ahora'},
        { text: 'Chequeando facts',  status: 'running', time: '15s'  },
      ],
      [
        { text: 'Sin errores found', status: 'done',    time: '1m'   },
        { text: 'Aprobado',          status: 'done',    time: '45s'  },
      ],
    ],
  },
  {
    id: 'n6', label: 'Output', initials: 'OP',
    cx: 448, cy: 232, type: 'output',
    frames: [
      [
        { text: 'Esperando valid.',  status: 'queued',  time: '14m'  },
        { text: 'Etapa final',       status: 'queued',  time: '12m'  },
      ],
      [
        { text: 'Procesando result.',status: 'running', time: 'ahora'},
        { text: 'Formateando',       status: 'running', time: '8s'   },
      ],
      [
        { text: 'Output generado',   status: 'done',    time: '30s'  },
        { text: 'Entregado al user', status: 'done',    time: '20s'  },
      ],
    ],
  },
]

const NODE_COLORS: Record<NodeType, { border: string; bg: string; accent: string }> = {
  source: { border: '#0e7490', bg: '#1a2d3d', accent: '#38bdf8' },
  agent:  { border: '#0f766e', bg: '#162b28', accent: '#2dd4bf' },
  output: { border: '#4f46e5', bg: '#1a1a32', accent: '#818cf8' },
}

const NODE_DELAY: Record<string, number> = {
  n1: 0.0, n2: 0.1, n3: 0.2, n4: 0.3, n5: 0.4, n6: 0.5,
}

// Ball path total ≈ 813px. Offsets = (cumulative dist / 813) * 6000ms.
// n1=0, n2=130, n3=260, n4=390, n5=683, n6=813(→5900ms to fire before reset)
const BALL_VISIT_MS: Record<string, number> = {
  n1:    0,
  n2:  960,
  n3: 1920,
  n4: 2880,
  n5: 5040,
  n6: 5900,
}
const CYCLE_MS = 6000
const INIT_DELAY_MS = 1000 // matches begin="1s" on animateMotion

// ─── Edges ───────────────────────────────────────────────────────────────────
function hEdge(a: typeof NODES[0], b: typeof NODES[0]) {
  return `M ${a.cx + HW + 2} ${a.cy} L ${b.cx - HW - 2} ${b.cy}`
}
function vEdge(a: typeof NODES[0], b: typeof NODES[0]) {
  return `M ${a.cx} ${a.cy + HH + 2} L ${b.cx} ${b.cy - HH - 2}`
}

const [n1, n2, n3, n4, n5, n6] = NODES
const EDGE_LINES = [
  hEdge(n1, n2), hEdge(n2, n3), hEdge(n3, n4),
  `M ${n4.cx - HW - 2} ${n4.cy + 8} L ${n3.cx + HW + 2} ${n3.cy + 8}`,
  vEdge(n3, n5), hEdge(n5, n6),
]

const FULL_PATH = [
  `M ${n1.cx} ${n1.cy}`,
  `L ${n1.cx + HW + 2} ${n1.cy} L ${n2.cx - HW - 2} ${n2.cy} L ${n2.cx} ${n2.cy}`,
  `L ${n2.cx + HW + 2} ${n2.cy} L ${n3.cx - HW - 2} ${n3.cy} L ${n3.cx} ${n3.cy}`,
  `L ${n3.cx + HW + 2} ${n3.cy} L ${n4.cx - HW - 2} ${n4.cy} L ${n4.cx} ${n4.cy}`,
  `L ${n4.cx} ${n4.cy + 8} L ${n4.cx - HW} ${n4.cy + 8}`,
  `L ${n3.cx + HW} ${n3.cy + 8} L ${n3.cx} ${n3.cy + 8} L ${n3.cx} ${n3.cy}`,
  `L ${n3.cx} ${n5.cy - HH - 2} L ${n5.cx} ${n5.cy}`,
  `L ${n5.cx + HW + 2} ${n5.cy} L ${n6.cx - HW - 2} ${n6.cy} L ${n6.cx} ${n6.cy}`,
].join(' ')

export default function NodeFlowAnimation() {
  const [nodeFrames, setNodeFrames] = useState<Record<string, number>>(
    () => Object.fromEntries(NODES.map(n => [n.id, 0]))
  )
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = []

    function scheduleCycle() {
      Object.entries(BALL_VISIT_MS).forEach(([id, offset]) => {
        const h = setTimeout(() => {
          setNodeFrames(prev => ({ ...prev, [id]: prev[id] + 1 }))
        }, offset)
        timeouts.push(h)
      })
    }

    const initId = setTimeout(() => {
      scheduleCycle()
      intervalRef.current = setInterval(scheduleCycle, CYCLE_MS)
    }, INIT_DELAY_MS)

    return () => {
      clearTimeout(initId)
      if (intervalRef.current) clearInterval(intervalRef.current)
      timeouts.forEach(clearTimeout)
    }
  }, [])

  return (
    <div
      className="relative w-full select-none overflow-hidden"
      style={{ height: SVG_H + 10, background: 'rgb(42,41,41)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div style={{
        position: 'absolute', left: '44%', top: '50%',
        width: SVG_W, height: SVG_H,
        transform: 'translate(-50%, -50%)',
      }}>
        <svg width={SVG_W} height={SVG_H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs>
            <filter id="dot-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <path id="travel-path" d={FULL_PATH} fill="none" stroke="none" />
          </defs>

          {EDGE_LINES.map((d, i) => (
            <motion.path key={i} d={d} fill="none"
              stroke="#2a3a4a" strokeWidth="1.5" strokeDasharray="4 5" strokeLinecap="round"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.3 }}
            />
          ))}

          <circle r="4.5" fill="#f97316" filter="url(#dot-glow)">
            <animateMotion dur="6s" repeatCount="indefinite" calcMode="linear" begin="1s">
              <mpath href="#travel-path" />
            </animateMotion>
          </circle>
        </svg>

        {NODES.map((node) => {
          const c = NODE_COLORS[node.type]
          const delay = NODE_DELAY[node.id]
          const frameIdx = nodeFrames[node.id] % node.frames.length
          const activities = node.frames[frameIdx]

          return (
            <motion.div
              key={node.id}
              style={{
                position: 'absolute',
                left: node.cx - HW,
                top: node.cy - HH,
                width: NODE_W,
                height: NODE_H,
                background: c.bg,
                borderRadius: 9,
                border: `1px solid ${c.border}45`,
                borderTop: `0px`,
                borderLeft: `0px`,
                borderRight: `2px solid ${c.border}55`,
                boxShadow: `0px 1px 0px 0px rgba(0,0,0,0.3), 4px 1px 0px 0px rgba(0,0,0,0.2), 0px 0px 1px 0 rgba(255,255,255,0.04)`,
                display: 'flex',
                flexDirection: 'column',
                padding: '7px 8px 6px 8px',
                gap: 0,
                overflow: 'hidden',
              }}
              initial={{ opacity: 0, scale: 0.85, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay, duration: 0.35, ease: 'backOut' }}
              whileHover={{ scale: 1.03, boxShadow: `4px 2px 0px rgba(0,0,0,0.2), 0 0 0 0px ${c.border}` }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                  background: `${c.accent}18`, border: `1px solid ${c.accent}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'ui-monospace, monospace', fontSize: 7, fontWeight: 800,
                  color: c.accent,
                }}>
                  {node.initials}
                </div>
                <span style={{
                  fontFamily: 'ui-monospace, monospace', fontSize: 9.5, fontWeight: 700,
                  color: '#cbd5e1', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {node.label}
                </span>
              </div>

              <div style={{ height: 1, background: `${c.border}30`, marginBottom: 5 }} />

              <div style={{ position: 'relative', height: 28, overflow: 'hidden', flexShrink: 0 }}>
                <AnimatePresence initial={false}>
                  <motion.div
                    key={frameIdx}
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '-100%' }}
                    transition={{ duration: 0.35, ease: [0.32, 0, 0.67, 0] }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', gap: 4 }}
                  >
                    {activities.map((act, ai) => {
                      const st = STATUS[act.status]
                      return (
                        <div key={ai} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 4, height: 4, borderRadius: '50%', background: st.color, flexShrink: 0 }} />
                          <span style={{ flex: 1, fontFamily: 'ui-monospace, monospace', fontSize: 7.5, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {act.text}
                          </span>
                          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 7, color: st.color }}>
                            {st.icon} {act.time}
                          </span>
                        </div>
                      )
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
