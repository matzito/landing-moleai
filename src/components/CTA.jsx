import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const PROOF_POINTS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    title: 'Diagnóstico Express',
    desc:  'Sesión técnica de 60 min con el equipo de arquitectura.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
      </svg>
    ),
    title: 'Roadmap Personalizado',
    desc:  'Plan de implementación adaptado a tu stack y objetivos.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
      </svg>
    ),
    title: 'Sin Compromiso',
    desc:  'Entregamos valor real en la primera sesión. Sin letra pequeña.',
  },
]

export default function CTA() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="contact" className="py-28 px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm"
        >
          {/* Top stripe — teal */}
          <div className="h-[3px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"/>

          <div className="px-8 sm:px-12 py-14 flex flex-col items-center gap-10 text-center">

            <span className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold tracking-widest uppercase text-zinc-400">
              <span className="dot-teal"/>
              Start Engagement
            </span>

            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.02em] text-zinc-900 leading-tight">
                ¿Tu empresa está lista para{' '}
                <span className="text-gradient-teal">operar con agentes</span>?
              </h2>
            </div>

            <p className="text-[14px] text-zinc-500 max-w-xl leading-relaxed -mt-4">
              En una sesión técnica de 60 minutos evaluamos tu stack, identificamos los procesos
              de mayor impacto y entregamos un roadmap de orquestación sin compromiso.
            </p>

            {/* Proof points */}
            <div className="grid sm:grid-cols-3 gap-4 w-full">
              {PROOF_POINTS.map(p => (
                <div
                  key={p.title}
                  className="card-hover flex flex-col gap-3 p-5 rounded-xl border border-zinc-200 bg-zinc-50 text-left"
                >
                  <span className="text-zinc-400">{p.icon}</span>
                  <div>
                    <div className="text-[13px] font-bold text-zinc-700 mb-1">{p.title}</div>
                    <div className="text-[12px] text-zinc-500 leading-relaxed">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:hola@moleai.com"
                className="btn-persimmon inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-bold rounded-xl"
              >
                Agendar Consultoría Técnica
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </a>
              <a
                href="mailto:hola@moleai.com"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-medium text-zinc-500 hover:text-zinc-800 border border-zinc-200 hover:border-zinc-300 rounded-xl transition-all duration-150 bg-white"
              >
                Iniciar Diagnóstico de Arquitectura
              </a>
            </div>

            <p className="text-[11px] text-zinc-300 font-mono -mt-4">
              Respuesta en &lt; 24h · NDA disponible · LATAM & USA
            </p>
          </div>

          {/* Bottom stripe — persimmon */}
          <div className="h-[3px] bg-gradient-to-r from-transparent via-persimmon/30 to-transparent"/>
        </motion.div>
      </div>
    </section>
  )
}
