'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Layout ──────────────────────────────────────────────────────────────────
const NODE_W = 110
const NODE_H = 82
const HW = NODE_W / 2
const HH = NODE_H / 2
const SVG_W = 485
const SVG_H = 310

// ─── Colors ──────────────────────────────────────────────────────────────────
const COLOR_PRIMARY       = '#0369a1'               // blue — primary accent: edges, active state, strips
const COLOR_STRIP         = '#7e8d96'              // blue — primary accent: edges, active state, strips
const COLOR_DONE          = '#0fd759'               // green — completed activity dot & icon
const COLOR_ORANGE        = '#eb7125'               // orange — queued activity dot & icon; source node badge
const COLOR_AGENT_ACCENT  = '#6366f1'               // indigo — agent node initials badge
const COLOR_OUTPUT_ACCENT = '#94a3b8'               // slate  — output node initials badge
const COLOR_SOURCE_BG     = 'rgb(52, 32, 32)'       // dark red — source node card background
const COLOR_NODE_BG       = '#ffffff'               // white — agent/output node card background
const COLOR_CANVAS_BG     = 'rgb(44, 44, 48)'       // dark blue-gray — outer container background
const COLOR_GRID_LINE     = 'rgba(255,255,255,0.05)'// faint white — grid overlay lines
const COLOR_BALL          = '#f97316'               // orange — travelling dot along edges
const COLOR_CARD_BG       = 'rgb(59, 59, 62)'               // near-black — node card surface
const COLOR_CARD_EDGE     = '#2f312f'               // dark gray — card side edge in box-shadow
const COLOR_SHADOW_CORE   = 'rgba(0,0,0,0.35)'      // shadow: compact core darkness
const COLOR_SHADOW_FLOOR  = 'rgba(36,36,38,0.45)'   // shadow: floor projection weight
const COLOR_TEXT_LABEL    = '#b9b9bf'               // muted gray — node title text
const COLOR_TEXT_ACTIVITY = '#d1d1d1'               // light gray — activity row text

// ─── Shadows ─────────────────────────────────────────────────────────────────
// Two clean strings (no comments) so framer-motion can interpolate between them
const SHADOW_BASE   = `-1px 1px 0px ${COLOR_CARD_EDGE}, -2px 2px 0px ${COLOR_CARD_EDGE}, -3px 3px 0px ${COLOR_CARD_EDGE}, -7px 10px 10px ${COLOR_SHADOW_CORE}, -5px 5px 2px ${COLOR_SHADOW_FLOOR}`
const SHADOW_LIFTED = `-2px 2px 0px ${COLOR_CARD_EDGE}, -4px 4px 0px ${COLOR_CARD_EDGE}, -6px 6px 0px ${COLOR_CARD_EDGE}, -14px 18px 20px ${COLOR_SHADOW_CORE}, -10px 10px 6px ${COLOR_SHADOW_FLOOR}`

// ─── Types ───────────────────────────────────────────────────────────────────
type NodeType = 'source' | 'agent' | 'output'
type ActivityStatus = 'done' | 'running' | 'queued' | 'live'

interface Activity {
  text: string
  status: ActivityStatus
  time: string
}

const STATUS: Record<ActivityStatus, { color: string; icon: string }> = {
  done:    { color: COLOR_DONE,    icon: '✓' },
  running: { color: COLOR_PRIMARY, icon: '▶' },
  queued:  { color: COLOR_ORANGE,  icon: '·' },
  live:    { color: COLOR_PRIMARY, icon: '●' },
}

const NODE_COLORS: Record<NodeType, { bg: string; accent: string; stripOpacity: number }> = {
  source: { bg: COLOR_SOURCE_BG, accent: COLOR_ORANGE,        stripOpacity: 1   },
  agent:  { bg: COLOR_NODE_BG,   accent: COLOR_AGENT_ACCENT,  stripOpacity: 0.6 },
  output: { bg: COLOR_NODE_BG,   accent: COLOR_OUTPUT_ACCENT, stripOpacity: 0.4 },
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

const NODE_DELAY: Record<string, number> = {
  n1: 0.0, n2: 0.1, n3: 0.2, n4: 0.3, n5: 0.4, n6: 0.5,
}

// Ball path total ≈ 813px. Offsets = (cumulative dist / 813) * 6000ms.
const BALL_VISIT_MS: Record<string, number> = {
  n1:    0,
  n2:  960,
  n3: 1920,
  n4: 2880,
  n5: 5040,
  n6: 5900,
}
const CYCLE_MS = 6000
const INIT_DELAY_MS = 1000

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
      style={{ height: 380, background: COLOR_CANVAS_BG }}
    >
      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(${COLOR_GRID_LINE} 1px, transparent 1px),
            linear-gradient(90deg, ${COLOR_GRID_LINE} 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Isometric content */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '52%',
        width: SVG_W,
        height: SVG_H,
        transform: 'translate(-50%, -50%) scale(1.2) rotateX(55deg) rotateZ(-45deg)',
        transformOrigin: 'center center',
        transformStyle: 'preserve-3d',
      }}>
        <svg width={SVG_W} height={SVG_H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs>
            <filter id="dot-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <path id="travel-path" d={FULL_PATH} fill="none" stroke="none" />
          </defs>

          {EDGE_LINES.map((d, i) => (
            <motion.path key={i} d={d} fill="none"
              stroke={`${COLOR_STRIP}88`} strokeWidth="1.5" strokeDasharray="4 6" strokeLinecap="round"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
            />
          ))}

          <circle r="5" fill={COLOR_BALL} filter="url(#dot-glow)">
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

          const isAgent = node.type === 'agent'

          return (
            <motion.div
              key={node.id}
              style={{
                position: 'absolute',
                left: node.cx - HW,
                top: node.cy - HH,
                width: NODE_W,
                height: NODE_H,
                background: COLOR_CARD_BG,
                borderRadius: 8,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                cursor: isAgent ? 'pointer' : 'default',
              }}
              initial={{ opacity: 0, scale: 0.85, boxShadow: SHADOW_BASE }}
              animate={{ opacity: 1, scale: 1, boxShadow: SHADOW_BASE }}
              whileHover={isAgent ? {
                z: 16,
                boxShadow: SHADOW_LIFTED,
                transition: { type: 'spring', stiffness: 380, damping: 22 },
              } : undefined}
              transition={{ delay, duration: 0.35, ease: 'backOut' }}
            >
              {/* Yellow header strip */}
              <div style={{
                height: 4,
                background: `${COLOR_PRIMARY}`,
                opacity: c.stripOpacity,
                flexShrink: 0,
              }} />

              {/* Card body */}
              <div style={{ padding: '6px 8px 6px 8px', display: 'flex', flexDirection: 'column', flex: 1, gap: 0 }}>
                {/* Title row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    background: `${COLOR_PRIMARY}22`,
                    border: `1px solid ${COLOR_PRIMARY}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'ui-monospace, monospace', fontSize: 6.5, fontWeight: 900,
                    color: c.accent,
                    letterSpacing: '-0.5px',
                  }}>
                    {node.initials}
                  </div>
                  <span style={{
                    fontFamily: 'ui-monospace, monospace', fontSize: 9, fontWeight: 700,
                    color: COLOR_TEXT_LABEL, flex: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    letterSpacing: '0.2px',
                  }}>
                    {node.label}
                  </span>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: `${COLOR_PRIMARY}18`, marginBottom: 5 }} />

                {/* Activities — fixed height, fade transition */}
                <div style={{ position: 'relative', height: 28, overflow: 'hidden', flexShrink: 0 }}>
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={frameIdx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', gap: 4 }}
                    >
                      {activities.map((act, ai) => {
                        const st = STATUS[act.status]
                        return (
                          <div key={ai} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{
                              width: 4, height: 4, borderRadius: '50%',
                              background: st.color, flexShrink: 0,
                              boxShadow: st.color === COLOR_PRIMARY ? `0 0 4px ${COLOR_PRIMARY}` : 'none',
                            }} />
                            <span style={{
                              flex: 1, fontFamily: 'ui-monospace, monospace', fontSize: 6,
                              color: COLOR_TEXT_ACTIVITY,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {act.text}
                            </span>
                            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 6, color: st.color }}>
                              {st.icon} {act.time}
                            </span>
                          </div>
                        )
                      })}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
