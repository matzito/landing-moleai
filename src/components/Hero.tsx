'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import NodeFlowAnimation from './NodeFlowAnimation'

type AgentStatus = 'complete' | 'running' | 'queued'

type PipelineRow = {
  name: string
  status: AgentStatus
  task: string
  tokens: string
  ms: string | null
}

type StatusConfig = {
  dotCls: string
  text: string
  label: string
}

const PIPELINE_STATES: PipelineRow[][] = [
  [
    { name: 'Planner',    status: 'complete', task: 'Query decomposed',   tokens: '1,247', ms: null   },
    { name: 'Integrator', status: 'running',  task: 'Searching vectors…', tokens: '—',     ms: null   },
    { name: 'Executor',   status: 'queued',   task: 'Awaiting retrieval', tokens: '—',     ms: null   },
    { name: 'Validator',  status: 'queued',   task: 'Awaiting pipeline',  tokens: '—',     ms: null   },
    { name: 'Dispatcher', status: 'queued',   task: 'Awaiting pipeline',  tokens: '—',     ms: null   },
  ],
  [
    { name: 'Planner',    status: 'complete', task: 'Query decomposed',   tokens: '1,247', ms: '312ms' },
    { name: 'Integrator', status: 'complete', task: 'Found 12 chunks',    tokens: '3,104', ms: '548ms' },
    { name: 'Executor',   status: 'running',  task: 'API calls (2 / 5)…', tokens: '—',     ms: null   },
    { name: 'Validator',  status: 'queued',   task: 'Awaiting executor',  tokens: '—',     ms: null   },
    { name: 'Dispatcher', status: 'queued',   task: 'Awaiting executor',  tokens: '—',     ms: null   },
  ],
  [
    { name: 'Planner',    status: 'complete', task: 'Query decomposed',   tokens: '1,247', ms: '312ms' },
    { name: 'Integrator', status: 'complete', task: 'Found 12 chunks',    tokens: '3,104', ms: '548ms' },
    { name: 'Executor',   status: 'complete', task: 'All APIs resolved',  tokens: '4,217', ms: '891ms' },
    { name: 'Validator',  status: 'running',  task: 'Evaluating output…', tokens: '—',     ms: null   },
    { name: 'Dispatcher', status: 'queued',   task: 'Awaiting validation',tokens: '—',     ms: null   },
  ],
  [
    { name: 'Planner',    status: 'complete', task: 'Query decomposed',   tokens: '1,247', ms: '312ms' },
    { name: 'Integrator', status: 'complete', task: 'Found 12 chunks',    tokens: '3,104', ms: '548ms' },
    { name: 'Executor',   status: 'complete', task: 'All APIs resolved',  tokens: '4,217', ms: '891ms' },
    { name: 'Validator',  status: 'complete', task: 'Score 0.94 · Pass',  tokens: '892',   ms: '204ms' },
    { name: 'Dispatcher', status: 'running',  task: 'Routing to App/API', tokens: '—',     ms: null   },
  ],
]

const STATUS: Record<AgentStatus, StatusConfig> = {
  complete: { dotCls: 'bg-teal-500',  text: 'text-teal-600',  label: 'Complete' },
  running:  { dotCls: 'dot-amber',    text: 'text-amber-600', label: 'Running'  },
  queued:   { dotCls: 'bg-zinc-300',  text: 'text-zinc-400',  label: 'Queued'   },
}

function AgentWorkflow() {
  const [stateIdx, setStateIdx] = useState<number>(0)

  useEffect(() => {
    const id = setInterval(() => setStateIdx(i => (i + 1) % PIPELINE_STATES.length), 2200)
    return () => clearInterval(id)
  }, [])

  const rows = PIPELINE_STATES[stateIdx]
  const completed = rows.filter(r => r.status === 'complete').length
  const totalTokens = rows
    .filter(r => r.tokens !== '—')
    .reduce((a, r) => a + parseInt(r.tokens.replace(',', '') || '0', 10), 0)
    .toLocaleString()

  return (
    <div className="rounded-xl overflow-hidden border border-zinc-200 border-outer bg-white shadow-sm">
      {/* Chrome */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"/>
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"/>
          <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"/>
        </div>
        <div className="flex items-center gap-2">
          <span className="dot-teal"/>
          <span className="text-[11px] font-mono text-zinc-500 tracking-wide">
            agent_pipeline · {completed}/{rows.length} complete
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 tabular-nums">{totalTokens} tokens</span>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-[28px_200px_260px_80px_56px] px-4 py-2 border-b border-zinc-100 bg-zinc-50/50">
        {['', 'Agent', 'Current Task', 'Tokens', 'Time'].map(h => (
          <span key={h} className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest font-mono">{h}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-zinc-50">
        {rows.map((row, i) => {
          const cfg = STATUS[row.status]
          const isRunning = row.status === 'running'
          return (
            <motion.div
              key={row.name}
              layout
              className={`grid grid-cols-[28px_200px_220px_80px_70px] px-4 py-3 items-center ${isRunning ? 'row-running' : ''}`}
            >
              <span className="text-[10px] font-mono text-zinc-300">{String(i + 1).padStart(2, '0')}</span>
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${cfg.dotCls}`}/>
                <span className="text-[13px] font-medium text-zinc-700 truncate">{row.name}</span>
                <span className={`hidden sm:inline text-[10px] font-mono ${cfg.text}`}>{cfg.label}</span>
              </div>
              <span className={`text-[11px] font-mono truncate ${isRunning ? 'text-zinc-600' : 'text-zinc-400'}`}>{row.task}</span>
              <span className={`text-[11px] font-mono tabular-nums text-right ${row.tokens === '—' ? 'text-zinc-200' : 'text-zinc-500'}`}>{row.tokens}</span>
              <span className={`text-[11px] font-mono tabular-nums text-right ${row.ms ? 'text-teal-600' : 'text-zinc-200'}`}>{row.ms ?? '—'}</span>
            </motion.div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-zinc-400">mode: <span className="text-zinc-600">deterministic</span></span>
          <span className="text-[10px] font-mono text-zinc-400">memory: <span className="text-zinc-600">137 MB</span></span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="dot-teal" style={{ width: 5, height: 5 }}/>
          <span className="text-[10px] font-mono text-zinc-400">live</span>
        </div>
      </div>
    </div>
  )
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] },
})

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-20 px-6 overflow-hidden">

      {/* Subtle grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hero-grid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#e4e4e7" strokeWidth="0.6"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)"/>
      </svg>

      {/* Teal ambient */}
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(circle at 80% 20%, rgba(13,148,136,0.05) 0%, transparent 65%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-14 lg:gap-8 items-center">

          {/* Left */}
          <div className="flex flex-col gap-7">

            {/* Pill badge */}
            <motion.div {...fadeUp(0)}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-widest uppercase border border-zinc-200 bg-white text-zinc-500 shadow-sm">
                <span className="dot-teal"/>
                Next-Gen AI ENGINEERING
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...fadeUp(0.08)}
              className="text-[2rem] xs:text-[2.1rem] sm:text-5xl lg:text-[3.2rem] font-black leading-[1.1] tracking-[-0.02em] text-zinc-900 sm:text-balance"
            >
              <span className="block sm:inline">Ingeniería de Software</span>{' '}
              <span className="block sm:inline">e Integración de</span>{' '}
              <span className="text-gradient-teal inline decoration-clone break-all sm:inline-block">
                Inteligencia Artificial
              </span>{' '}
              <span className="block sm:inline">para la Próxima</span>{' '}
              <span className="block sm:inline">Generación de Empresas</span>
            </motion.h1>

            {/* Sub */}
            <motion.p {...fadeUp(0.15)} className="text-[15px] text-zinc-500 leading-relaxed max-w-lg">
              Diseñamos y desplegamos soluciones punta a punta: desde aplicaciones móviles robustas e integraciones críticas de sistemas, hasta arquitecturas de agentes autónomos que transforman procesos en{' '}
              <span className="text-zinc-800 font-medium">flujos de ejecución deterministas</span>.
            </motion.p>

            {/* Metrics */}
            <motion.div {...fadeUp(0.22)} className="flex gap-8 pt-1">
              {[
                { value: '10×',   label: 'Aumento en capacidad operativa' },
                { value: '99.9%', label: 'Disponibilidad de plataforma'   },
                { value: '80%',   label: 'Reducción en Time-to-Market'    },
              ].map(m => (
                <div key={m.label} className="flex flex-col gap-0.5">
                  <span className="text-xl font-black text-zinc-900 font-mono tabular-nums">{m.value}</span>
                  <span className="text-[11px] text-zinc-400 tracking-wide">{m.label}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div {...fadeUp(0.28)} className="flex flex-wrap gap-3">
              <a href="#contact" className="btn-persimmon inline-flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl">
                Agendar Consultoría Técnica
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </a>
              <a
                href="#comparison"
                className="inline-flex items-center gap-1.5 px-5 py-3 text-sm text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300 rounded-xl bg-white transition-all duration-150 shadow-sm"
              >
                Ver comparativa
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </a>
            </motion.div>
          </div>

          {/* Right: Node flow panel */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden flex-1 lg:block"
          >
            <div
              className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#2a2a31]"
              style={{
                transform: 'perspective(900px) rotateY(-20deg) rotateX(4deg)',
                transformOrigin: 'center center',
                boxShadow: `
                  1px 0px 0px #1a1a1a,
                  2px 0px 0px #1a1a1a,
                  3px 1px 0px #1a1a1a,
                  4px 1px 0px #1a1a1a,
                  5px 1px 0px #1a1a1a,
                  6px 2px 0px #1a1a1a,
                  20px 30px 60px rgba(0,0,0,0.6)
                `,
              }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
                    Runtime Preview
                  </span>
                </div>
                <span className="font-mono text-[10px] text-gray-500">
                  moleai.engineering v2.4
                </span>
              </div>

              {/* Animation */}
              <NodeFlowAnimation />

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-white/5 px-5 py-2.5">
                <span className="font-mono text-[10px] text-gray-400">
                  mode: <span className="text-[#0D9488]">deterministic</span>
                  {'  '}memory: 137 MB
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#0D9488]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0D9488]" />
                  live
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-zinc-200"/>
    </section>
  )
}
