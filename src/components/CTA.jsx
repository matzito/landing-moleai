import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'

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

const SERVICES = [
  'Orquestación de Agentes IA',
  'Integración de Sistemas (ERP/CRM)',
  'Automatización de Procesos',
  'Arquitectura Cloud',
  'Otro',
]

function ContactForm({ onBack }) {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', company: '', email: '', service: '', message: '' })
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => { setLoading(false); setSubmitted(true) }, 1200)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-5 py-10 text-center"
      >
        <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center">
          <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xl font-black text-zinc-900 tracking-tight">Mensaje recibido</h3>
          <p className="text-[14px] text-zinc-500 max-w-sm leading-relaxed">
            Te contactamos en menos de 24h para coordinar la sesión técnica.
          </p>
        </div>
        <span className="text-[11px] font-mono text-zinc-300">LATAM & USA · NDA disponible</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      {/* Form header */}
      <div className="flex items-center gap-3 mb-7">
        <button
          onClick={onBack}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-colors text-zinc-400 hover:text-zinc-600"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <p className="text-[11px] font-mono font-semibold tracking-widest uppercase text-zinc-400">Agendar Consultoría</p>
          <h3 className="text-lg font-black text-zinc-900 tracking-tight leading-tight">Cuéntanos sobre tu proyecto</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Nombre *</label>
            <input
              required
              value={form.name}
              onChange={set('name')}
              placeholder="Juan García"
              className="px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-[13px] text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/10 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Empresa *</label>
            <input
              required
              value={form.company}
              onChange={set('company')}
              placeholder="Acme Corp"
              className="px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-[13px] text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/10 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Email corporativo *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="juan@empresa.com"
            className="px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-[13px] text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/10 transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Área de interés</label>
          <select
            value={form.service}
            onChange={set('service')}
            className="px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-[13px] text-zinc-800 focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/10 transition-all appearance-none cursor-pointer"
          >
            <option value="">Selecciona un área…</option>
            {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">¿Cuál es el reto? <span className="normal-case font-normal text-zinc-400">(opcional)</span></label>
          <textarea
            value={form.message}
            onChange={set('message')}
            rows={3}
            placeholder="Describe brevemente el proceso o problema que quieres resolver…"
            className="px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-[13px] text-zinc-800 placeholder-zinc-300 focus:outline-none focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-500/10 transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-persimmon mt-1 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-bold rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Enviando…
            </>
          ) : (
            <>
              Solicitar Consultoría Técnica
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </>
          )}
        </button>

        <p className="text-[11px] text-zinc-300 font-mono text-center">
          Respuesta en &lt; 24h · NDA disponible · LATAM & USA
        </p>
      </form>
    </motion.div>
  )
}

export default function CTA() {
  const ref      = useRef(null)
  const inView   = useInView(ref, { once: true, margin: '-60px' })
  const [showForm, setShowForm] = useState(false)

  return (
    <section id="contact" className="py-28 px-6" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm"
        >
          <div className="h-[3px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"/>

          <div className="px-8 sm:px-12 py-14">
            <AnimatePresence mode="wait">
              {!showForm ? (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-10 text-center"
                >
                  <span className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold tracking-widest uppercase text-zinc-400">
                    <span className="dot-teal"/>
                    Start Engagement
                  </span>

                  <div className="max-w-2xl">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-[-0.02em] text-zinc-900 leading-tight">
                      ¿Tu empresa está lista para{' '}
                      <span className="text-gradient-teal">la autonomía operativa impulsada por IA</span>?
                    </h2>
                  </div>

                  <p className="text-[14px] text-zinc-500 max-w-xl leading-relaxed -mt-4">
                    En una sesión técnica de 60 minutos evaluamos tu tecnología, detectamos dónde la IA genera más valor
                    y te entregamos una ruta de ejecución para escalar tu negocio.
                  </p>

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

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setShowForm(true)}
                      className="btn-persimmon inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-bold rounded-xl"
                    >
                      Agendar Consultoría Técnica
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center justify-center gap-2 px-7 py-4 text-sm font-medium text-zinc-500 hover:text-zinc-800 border border-zinc-200 hover:border-zinc-300 rounded-xl transition-all duration-150 bg-white"
                    >
                      Iniciar Diagnóstico de Arquitectura
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-300 font-mono -mt-4">
                    Respuesta en &lt; 24h · NDA disponible · LATAM & USA
                  </p>
                </motion.div>
              ) : (
                <motion.div key="form">
                  <ContactForm onBack={() => setShowForm(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-[3px] bg-gradient-to-r from-transparent via-persimmon/30 to-transparent"/>
        </motion.div>
      </div>
    </section>
  )
}
