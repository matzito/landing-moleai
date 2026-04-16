import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const STEPS = [
  {
    step: '01',
    title: 'Arquitectura y Diseño de Sistemas',
    description:
      'Definimos el blueprint técnico: desde la estructura de datos y las interfaces de usuario hasta los roles específicos de cada agente.',
    tag: 'Blueprint',
  },
  {
    step: '02',
    title: 'Integración Inteligente',
    description:
      'Conectamos su stack empresarial (ERP, CRM, APIs) en un flujo de trabajo unificado y determinista mediante orquestación agéntica.',
    tag: 'Orchestration',
  },
  {
    step: '03',
    title: 'Despliegue Escalable y Auditoría',
    description:
      'Desplegamos en infraestructura cloud de alta disponibilidad con monitoreo en tiempo real y logs de auditoría para cada decisión del sistema.',
    tag: 'Production',
  },
]

export default function ProcessFlow() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="process" className="py-20 px-6 border-b border-zinc-200 bg-white">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">

        {/* ── Section heading ── */}
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
          <h2
            className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-[1.1]"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            Diseñamos, construimos y orquestamos su{' '}
            <span className="text-gradient-teal">ecosistema inteligente.</span>
          </h2>
        </motion.div>

        {/* ── Bento grid ── */}
        <div className="grid sm:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.52, delay: 0.12 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden flex flex-col justify-between gap-12 p-8 rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm transition-all duration-200"
            >
              {/* Watermark number — decorative background */}
              <span
                className="absolute -bottom-4 -right-1 font-black font-mono leading-none select-none pointer-events-none"
                style={{ fontSize: '7.5rem', color: '#f4f4f5' }}
                aria-hidden="true"
              >
                {s.step}
              </span>

              {/* Top row: step badge + tag */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-200 bg-zinc-50 text-[11px] font-black font-mono text-zinc-500 tabular-nums flex-shrink-0">
                  {s.step}
                </span>
                <span className="text-[9px] font-mono font-semibold tracking-[0.15em] uppercase text-zinc-300">
                  {s.tag}
                </span>
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col gap-3">
                <h3 className="text-[17px] font-bold text-zinc-900 leading-snug tracking-tight">
                  {s.title}
                </h3>
                <p className="text-[13.5px] text-zinc-500 leading-relaxed">
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
