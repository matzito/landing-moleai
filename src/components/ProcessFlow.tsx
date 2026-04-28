'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

type Step = {
  step: string
  label: string
  title: string
  description: string
  bg: string
  accent: string
}

const STEPS: Step[] = [
  {
    step: '01',
    label: 'Auditoría y Diagnóstico',
    title: 'Diagnóstico de Viabilidad Técnica',
    description: 'Mapeamos sus flujos críticos e identificamos puntos de fricción para definir una estrategia de integración de IA con impacto medible.',
    bg: 'bg-slate-700',
    accent: 'text-slate-400',
  },
  {
    step: '02',
    label: 'Arquitectura',
    title: 'Blueprint y Diseño de Sistemas',
    description: 'Definimos la arquitectura técnica punta a punta: desde la estructura de datos hasta los roles específicos de cada agente en el ecosistema.',
    bg: 'bg-teal-700',
    accent: 'text-teal-400',
  },
  {
    step: '03',
    label: 'Ejecución',
    title: 'Orquestación y Despliegue',
    description: 'Conectamos su stack empresarial (ERP, CRM, APIs) en un flujo de trabajo unificado y determinista mediante el motor propietario Mole AI.',
    bg: 'bg-orange-600',
    accent: 'text-orange-300',
  },
  {
    step: '04',
    label: 'Gobernanza',
    title: 'Auditoría y Escalabilidad',
    description: 'Lanzamos en infraestructura cloud de grado empresarial con monitoreo en tiempo real y logs de auditoría para cada decisión del sistema.',
    bg: 'bg-sky-700',
    accent: 'text-indigo-400',
  },
]

export default function ProcessFlow() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="process" className="py-28 px-6 border-b border-zinc-200 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-14">

        {/* Section heading */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 max-w-2xl"
        >
          <span className="text-[11px] font-mono font-semibold tracking-widest uppercase text-zinc-400">
            Delivery Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-[1.1]">
            Diseñamos, construimos y orquestamos su {' '}
            <span className="text-gradient-teal">ecosistema inteligente.</span>
          </h2>
        </motion.div>

        {/* 4-card bento grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={`relative overflow-hidden flex flex-col justify-between gap-14 p-8 rounded-3xl ${s.bg}`}
              style={{ minHeight: '22rem' }}
            >
              <span
                aria-hidden="true"
                className="absolute -bottom-5 -right-2 font-black font-mono leading-none select-none pointer-events-none text-white/5"
                style={{ fontSize: '9rem' }}
              >
                {s.step}
              </span>

              <span className={`font-mono text-[11px] font-semibold tracking-widest ${s.accent}`}>
                {s.step}
              </span>

              <div className="relative z-10 flex flex-col gap-3">
                <p className="text-[10px] font-mono font-semibold tracking-[0.18em] uppercase text-white/40">
                  {s.label}
                </p>
                <h3 className="text-[17px] font-bold text-white leading-snug tracking-tight">
                  {s.title}
                </h3>
                <p className="text-[13px] text-white/60 leading-relaxed">
                  {s.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
