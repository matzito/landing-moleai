'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

type ComparisonRow = {
  feature: string
  traditional: string
  moleai: string
}

const ROWS: ComparisonRow[] = [
  { feature: 'Time-to-value',          traditional: '6 – 12 meses',                                                     moleai: '< 10 Días prototipo funcional' },
  { feature: 'Integración de Sistemas', traditional: 'Conexiones manuales vía Webhooks/APIs rígidas.',                   moleai: 'Integración fluida y determinista con el stack empresarial (ERP, CRM, Legacy).' },
  { feature: 'Escalabilidad',          traditional: 'Limitada por headcount de equipo',                                  moleai: 'Infinita — los agentes escalan solos' },
  { feature: 'Observabilidad',         traditional: 'Manual, post-mortem, logs dispersos',                               moleai: 'Instrumentada en runtime (tokens, latencia, scores)' },
  { feature: 'Integración LLM',        traditional: 'Plug-in externo, sin diseño de contexto',                           moleai: 'Arquitectura nativa con fallback routing' },
  { feature: 'Costo de mantenimiento', traditional: 'Alto — requiere equipo dedicado',                                   moleai: 'Self-healing pipelines con evaluadores internos' },
  { feature: 'Entrega de conocimiento',traditional: 'Documentación estática al cierre',                                  moleai: 'Runbook vivo + transferencia de ownership' },
  { feature: 'Modelo de entrega',      traditional: 'Desarrollo de silos aislados (App por un lado, DB por otro).',      moleai: 'Ecosistema unificado: App + Cloud + Orquestación de Agentes.' },
  { feature: 'Alcance de la Solución', traditional: 'Software estático que requiere intervención humana.',               moleai: 'Software dinámico que razona, ejecuta y valida procesos.' },
]

function Check() {
  return (
    <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
    </svg>
  )
}

function Cross() {
  return (
    <svg className="w-4 h-4 text-zinc-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
    </svg>
  )
}

export default function ComparisonSection() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="comparison" className="py-28 px-6 border-b border-zinc-200">
      <div className="max-w-7xl mx-auto">

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 flex flex-col sm:flex-row sm:items-end gap-6 justify-between"
        >
          <div className="flex flex-col gap-2.5 max-w-xl">
            <span className="text-[11px] font-mono font-semibold tracking-widest uppercase text-zinc-400">
              Comparative Analysis
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-tight">
              Ingeniería de agentes{' '}
              <span className="text-gradient-teal">vs. consultoría tradicional</span>
            </h2>
          </div>
          <p className="text-[13px] text-zinc-500 max-w-xs leading-relaxed sm:text-right">
            Más que una agencia de desarrollo. Somos una firma de ingeniería que construye ecosistemas de software con inteligencia operativa nativa.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="rounded-xl border border-zinc-200 overflow-hidden bg-white shadow-sm"
        >
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-zinc-200 bg-zinc-50">
            <div className="px-6 py-4">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-400">Dimensión</span>
            </div>
            <div className="px-6 py-4 border-l border-zinc-200">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-500">Consultoría Tradicional</span>
            </div>
            <div className="px-6 py-4 border-l border-zinc-200">
              <div className="flex items-center gap-2">
                <span className="dot-teal"/>
                <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-teal-600">MoleAI</span>
              </div>
            </div>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
              className="grid grid-cols-[1fr_1fr_1fr] border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors duration-150"
            >
              <div className="px-6 py-4">
                <span className="text-[13px] font-medium text-zinc-600">{row.feature}</span>
              </div>
              <div className="px-6 py-4 border-l border-zinc-100 flex items-start gap-2.5">
                <Cross/>
                <span className="text-[13px] text-zinc-400 leading-relaxed">{row.traditional}</span>
              </div>
              <div className="px-6 py-4 border-l border-zinc-100 flex items-start gap-2.5">
                <Check/>
                <span className="text-[13px] text-zinc-700 leading-relaxed font-medium">{row.moleai}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-5 text-[11px] text-zinc-400 font-mono text-center">
          Basado en proyectos de producción entregados · No incluye estimaciones de mercado
        </p>
      </div>
    </section>
  )
}
