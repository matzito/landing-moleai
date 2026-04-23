'use client'

import { motion } from 'framer-motion'

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
  done:     { label: 'Completado', color: '#4ade80', icon: '✓' },
  running: { label: 'Ejecutando', color: '#2dd4bf', icon: '▶' },
  queued:   { label: 'En cola',     color: '#475569', icon: '⏳' },
  live:     { label: 'Activo',      color: '#38bdf8', icon: '●' },
}

// ─── Nodes ───────────────────────────────────────────────────────────────────
const NODES: Array<{
  id: string; label: string; initials: string
  cx: number; cy: number; type: NodeType
  activities: Activity[]
}> = [
  {
    id: 'n1', label: 'Data Source', initials: 'DS',
    cx: 58, cy: 85, type: 'source',
    activities: [
      { text: 'Stream iniciado',   status: 'live',    time: 'ahora' },
      { text: '1.247 registros',   status: 'live',    time: '1m'    },
    ],
  },
  {
    id: 'n2', label: 'Planner', initials: 'PL',
    cx: 188, cy: 85, type: 'agent',
    activities: [
      { text: 'Plan generado',     status: 'done',    time: '2m'    },
      { text: 'Sub-tareas divid.', status: 'done',    time: '1m'    },
    ],
  },
  {
    id: 'n3', label: 'Executor', initials: 'EX',
    cx: 318, cy: 85, type: 'agent',
    activities: [
      { text: 'Esperando ctx',     status: 'queued',  time: '8m'    },
      { text: 'Siguiente en cola', status: 'queued',  time: '6m'    },
    ],
  },
  {
    id: 'n4', label: 'Response', initials: 'RE',
    cx: 448, cy: 85, type: 'output',
    activities: [
      { text: 'Conectando fuentes',status: 'running', time: '5m'    },
      { text: 'Fusionando ctx',    status: 'running', time: '3m'    },
    ],
  },
  {
    id: 'n5', label: 'Validator', initials: 'VA',
    cx: 318, cy: 232, type: 'agent',
    activities: [
      { text: 'Esperando result.', status: 'queued',  time: '11m'   },
      { text: 'Validación pend.',  status: 'queued',  time: '9m'    },
    ],
  },
  {
    id: 'n6', label: 'Output', initials: 'OP',
    cx: 448, cy: 232, type: 'output',
    activities: [
      { text: 'Esperando valid.',  status: 'queued',  time: '14m'   },
      { text: 'Etapa final',       status: 'queued',  time: '12m'   },
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

          <circle r="4.5" fill="#0d9488" filter="url(#dot-glow)">
            <animateMotion dur="6s" repeatCount="indefinite" calcMode="linear" begin="1s">
              <mpath href="#travel-path" />
            </animateMotion>
          </circle>
        </svg>

        {NODES.map((node) => {
          const c = NODE_COLORS[node.type]
          const delay = NODE_DELAY[node.id]
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
                borderRight: `2px solid ${c.border}55`,
                boxShadow: `0 2px 6px rgba(0,0,0,0.3), 2px 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)`,
                display: 'flex',
                flexDirection: 'column',
                padding: '7px 8px 6px 8px',
                gap: 0,
              }}
              initial={{ opacity: 0, scale: 0.85, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay, duration: 0.35, ease: 'backOut' }}
              whileHover={{ scale: 1.03, boxShadow: `0 6px 22px rgba(0,0,0,0.65), 0 0 0 1px ${c.border}` }}
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

              {node.activities.map((act, ai) => {
                const st = STATUS[act.status]
                return (
                  <div key={ai} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: ai === 0 ? 4 : 0 }}>
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
          )
        })}
      </div>
    </div>
  )
}