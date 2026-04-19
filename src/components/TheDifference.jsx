import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

/* ── Pipeline states ─────────────────────────────────────────────── */
const PIPELINE = [
  [
    { name: 'Analista',   status: 'running',  task: 'Procesando información…', ms: null   },
    { name: 'Ejecutor',   status: 'queued',   task: 'Esperando analista',      ms: null   },
    { name: 'Supervisor', status: 'queued',   task: 'Esperando ejecución',     ms: null   },
  ],
  [
    { name: 'Analista',   status: 'complete', task: 'Datos estructurados',     ms: '38ms' },
    { name: 'Ejecutor',   status: 'running',  task: 'Sincronizando sistemas…', ms: null   },
    { name: 'Supervisor', status: 'queued',   task: 'Esperando ejecución',     ms: null   },
  ],
  [
    { name: 'Analista',   status: 'complete', task: 'Datos estructurados',     ms: '38ms' },
    { name: 'Ejecutor',   status: 'complete', task: 'Sistemas sincronizados',  ms: '42ms' },
    { name: 'Supervisor', status: 'running',  task: 'Validando resultados…',   ms: null   },
  ],
  [
    { name: 'Analista',   status: 'complete', task: 'Datos estructurados',     ms: '38ms' },
    { name: 'Ejecutor',   status: 'complete', task: 'Sistemas sincronizados',  ms: '42ms' },
    { name: 'Supervisor', status: 'complete', task: 'Validación: ✓ Pass',      ms: '21ms' },
  ],
]

const STATUS_CFG = {
  complete: { dot: 'bg-teal-500',                      label: 'Complete', labelCls: 'text-teal-600',  rowCls: '' },
  running:  { dot: 'bg-amber-400 animate-pulse',        label: 'Running',  labelCls: 'text-amber-500', rowCls: 'bg-teal-50/60' },
  queued:   { dot: 'bg-zinc-200',                       label: 'Queued',   labelCls: 'text-zinc-400',  rowCls: '' },
}

/* ── Agent Workflow (light) ──────────────────────────────────────── */
function AgentWorkflow() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % PIPELINE.length), 2000)
    return () => clearInterval(id)
  }, [])

  const rows   = PIPELINE[idx]
  const done   = rows.filter(r => r.status === 'complete').length
  const totalMs = rows.filter(r => r.ms).reduce((a, r) => a + parseInt(r.ms), 0)

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-200 bg-white">
      {/* Chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-50 border-b border-zinc-100">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-200"/>
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-200"/>
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-200"/>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse flex-shrink-0"/>
          <span className="text-[10px] font-mono text-zinc-400 tracking-wider">
            agent_pipeline · {done}/{rows.length} complete
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 tabular-nums">
          {totalMs > 0 ? `${totalMs}ms` : '—'}
        </span>
      </div>

      {/* Col headers */}
      <div className="grid grid-cols-[20px_1fr_1fr_48px] gap-x-4 px-4 py-2 border-b border-zinc-100 bg-zinc-50/50">
        {['', 'Agent', 'Task', 'Time'].map(h => (
          <span key={h} className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400 font-mono">{h}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-zinc-50">
        {rows.map((row, i) => {
          const cfg = STATUS_CFG[row.status]
          return (
            <motion.div
              key={row.name}
              layout
              className={`grid grid-cols-[20px_1fr_1fr_48px] gap-x-4 items-center px-4 py-3 ${cfg.rowCls}`}
            >
              <span className="text-[10px] font-mono text-zinc-300 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
                <span className="text-[12px] font-semibold text-zinc-800 truncate">{row.name}</span>
                <span className={`text-[9px] font-mono ${cfg.labelCls} flex-shrink-0 hidden sm:inline`}>{cfg.label}</span>
              </div>
              <span className={`text-[11px] font-mono truncate ${row.status === 'running' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {row.task}
              </span>
              <span className={`text-[11px] font-mono tabular-nums text-right ${row.ms ? 'text-teal-600 font-semibold' : 'text-zinc-200'}`}>
                {row.ms ?? '—'}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Telemetry footer */}
      <div className="px-4 py-2.5 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-zinc-400">
            latency: <span className="text-teal-600 font-semibold">42ms</span>
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            status: <span className="text-teal-600 font-semibold">deterministic</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"/>
          <span className="text-[10px] font-mono text-zinc-400">live</span>
        </div>
      </div>
    </div>
  )
}

/* ── Error Log Mockup (light, inert) ─────────────────────────────── */
const LOG_LINES = [
  { tag: '[ERROR]',   msg: 'Manual Data Entry Mismatch — row 847',  tagCls: 'text-red-400',   msgCls: 'text-zinc-500'   },
  { tag: '[WAIT]',    msg: 'Approval Pending (12h+) — finance@',    tagCls: 'text-zinc-400',  msgCls: 'text-zinc-400'   },
  { tag: '[FAIL]',    msg: 'Legacy API Timeout — ERP connector',    tagCls: 'text-red-400',   msgCls: 'text-zinc-500'   },
  { tag: '[WAIT]',    msg: 'Approval Pending (8h) — ops manager',   tagCls: 'text-zinc-400',  msgCls: 'text-zinc-400'   },
  { tag: '[ERROR]',   msg: 'Schema drift detected — CRM sync',      tagCls: 'text-red-400',   msgCls: 'text-zinc-500'   },
  { tag: '[LATENCY]', msg: '48hrs — executive report deadline',     tagCls: 'text-zinc-300',  msgCls: 'text-zinc-300'   },
  { tag: '[WAIT]',    msg: 'Manual Reconciliation — spreadsheet',   tagCls: 'text-zinc-400',  msgCls: 'text-zinc-400'   },
]

function ErrorLogMockup() {
  return (
    <div className="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
      {/* Chrome */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-100/60 border-b border-zinc-200">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-300"/>
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-300"/>
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-300"/>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 tracking-wider">ops-log · production</span>
        <span className="text-[10px] font-mono text-red-400/80">3 errors · 4 blocked</span>
      </div>

      {/* Log lines */}
      <div className="px-4 py-3 flex flex-col gap-1.5">
        {LOG_LINES.map((line, i) => (
          <div key={i} className="flex items-start gap-2.5 font-mono text-[10px]">
            <span className={`flex-shrink-0 font-semibold w-[68px] ${line.tagCls}`}>{line.tag}</span>
            <span className={line.msgCls}>{line.msg}</span>
          </div>
        ))}
        {/* Blinking cursor */}
        <div className="flex items-center gap-1 mt-1 font-mono text-[10px]">
          <span className="text-zinc-300">{'>'}</span>
          <span className="w-1.5 h-3 bg-zinc-300 animate-pulse"/>
        </div>
      </div>
    </div>
  )
}

/* ── Metrics row ─────────────────────────────────────────────────── */
const METRICS = [
  { value: '10x',   label: 'Capacidad de escala'        },
  { value: '99.9%', label: 'Precisión operativa'        },
  { value: '-40%',  label: 'Reducción de costos'        },
  { value: '24/7',  label: 'Operación sin interrupción' },
]

/* ── Main ────────────────────────────────────────────────────────── */
export default function TheDifference() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="diferencial" className="bg-white py-20 px-6 border-b border-zinc-100">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">

        {/* ── Header ── */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-3 max-w-2xl"
        >
          <span className="text-[11px] font-mono font-semibold tracking-widest uppercase text-zinc-400">
            The Difference
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-[1.08]">
            Deje de parchear procesos.{' '}
            <span className="text-gradient-teal">Empiece a orquestar inteligencia.</span>
          </h2>
          <p className="text-[15px] text-zinc-500 leading-relaxed">
            Sustituimos la fricción manual por capacidad de ejecución autónoma.
          </p>
        </motion.div>

        {/* ── Two Windows ── */}
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Left — El Freno */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">
                Estado actual
              </span>
              <h3 className="text-lg font-black text-zinc-800 tracking-tight">El Freno Operativo</h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed">
                Dependencia de aprobaciones manuales, hojas de cálculo como fuente de verdad y APIs legadas sin monitoreo.
              </p>
            </div>
            <ErrorLogMockup />
          </motion.div>

          {/* Right — El Motor */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-teal-600">
                Con Mole Engineering
              </span>
              <h3 className="text-lg font-black text-zinc-900 tracking-tight">El Motor Autónomo</h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed">
                Ecosistema determinista que conecta herramientas, ejecuta procesos completos y valida resultados sin intervención humana.
              </p>
            </div>
            {/* Elevated card */}
            <div
              className="rounded-2xl border border-teal-500/20 bg-white overflow-hidden"
              style={{ boxShadow: '0 8px 40px rgba(20,184,166,0.07), 0 2px 8px rgba(0,0,0,0.06)' }}
            >
              <AgentWorkflow />
            </div>
          </motion.div>
        </div>

        {/* ── Metrics row ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-100 border border-zinc-100 rounded-2xl overflow-hidden"
        >
          {METRICS.map((m, i) => (
            <div key={m.label} className="flex flex-col gap-1 px-8 py-7">
              <span className="text-3xl font-black font-mono tabular-nums text-zinc-900 tracking-tight">{m.value}</span>
              <span className="text-[11px] text-zinc-400 uppercase tracking-wide leading-snug">{m.label}</span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
