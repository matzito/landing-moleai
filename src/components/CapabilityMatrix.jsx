import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const IconOrchestration = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <circle cx="10" cy="4"  r="2" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="4"  cy="14" r="2" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="16" cy="14" r="2" stroke="currentColor" strokeWidth="1.4"/>
    <line x1="10" y1="6"  x2="4"  y2="12" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="10" y1="6"  x2="16" y2="12" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="4"  y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2"/>
  </svg>
)
const IconLLM = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect x="2" y="4"  width="16" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="2" y="11" width="16" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="16" cy="6.5"  r="1.2" fill="currentColor"/>
    <circle cx="16" cy="13.5" r="1.2" fill="currentColor"/>
    <line x1="5" y1="13.5" x2="12" y2="13.5" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
)
const IconRAG = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <circle cx="10" cy="10" r="7"   stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 2"/>
    <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.4"/>
    <circle cx="10" cy="10" r="1.2" fill="currentColor"/>
  </svg>
)
const IconIntegration = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
    <rect x="1.5" y="1.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="12.5" y="1.5"  width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="1.5"  y="12.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="12.5" y="12.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
    <line x1="7.5" y1="4.5"  x2="12.5" y2="4.5"  stroke="currentColor" strokeWidth="1.2"/>
    <line x1="4.5" y1="7.5"  x2="4.5"  y2="12.5" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="15.5" y1="7.5" x2="15.5" y2="12.5" stroke="currentColor" strokeWidth="1.2"/>
    <line x1="7.5" y1="15.5" x2="12.5" y2="15.5" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
)

const CAPABILITIES = [
  {
    id: 'orchestration', step: '01', icon: <IconOrchestration/>,
    title: 'Multi-Agent Orchestration',
    desc: 'Diseñamos topologías de agentes con coordinación determinista: supervisores, workers y evaluadores en pipelines de ejecución paralela y secuencial con state machines auditables.',
    tags: ['LangGraph', 'CrewAI', 'AutoGen', 'Custom Runtimes'],
    span: 'lg:col-span-2',
    extra: (
      <div className="mt-auto pt-5 flex items-center gap-2 text-[10px] font-mono text-zinc-400">
        {['Planner', 'Retrieval', 'Executor', 'Evaluator'].map((n, i, arr) => (
          <span key={n} className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-500">{n}</span>
            {i < arr.length - 1 && <span className="text-zinc-300">→</span>}
          </span>
        ))}
      </div>
    ),
  },
  {
    id: 'llm-infra', step: '02', icon: <IconLLM/>,
    title: 'LLM Infrastructure',
    desc: 'Desplegamos y optimizamos infraestructura de modelos: fine-tuning, serving sub-100ms, observabilidad de tokens y fallback routing entre proveedores.',
    tags: ['Azure OpenAI', 'Bedrock', 'vLLM', 'LiteLLM'],
    span: 'lg:col-span-1',
    extra: null,
  },
  {
    id: 'rag', step: '03', icon: <IconRAG/>,
    title: 'Agentic RAG',
    desc: 'Sistemas de recuperación aumentada con re-ranking semántico, query decomposition, hybrid search y chunking adaptativo para bases de conocimiento empresarial.',
    tags: ['Pinecone', 'Weaviate', 'pgvector', 'Cohere'],
    span: 'lg:col-span-1',
    extra: null,
  },
  {
    id: 'integration', step: '04', icon: <IconIntegration/>,
    title: 'Enterprise Integration',
    desc: 'Conectamos sistemas de agentes a ecosistemas empresariales existentes: ERPs, CRMs, APIs REST/GraphQL, data warehouses con gestión de identidad y SSO.',
    tags: ['.NET', 'Azure', 'SAP', 'Salesforce'],
    span: 'lg:col-span-2',
    extra: (
      <div className="mt-auto pt-5 flex flex-wrap items-center gap-2 text-[10px] font-mono">
        {[
          { label: 'REST / GraphQL', icon: '⇄' },
          { label: 'OAuth 2.0 / SSO', icon: '🔐' },
          { label: 'Event Streams',   icon: '⟶' },
        ].map(item => (
          <span key={item.label} className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-500">
            <span>{item.icon}</span>{item.label}
          </span>
        ))}
      </div>
    ),
  },
]

function BentoCard({ cap, index }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className={`card-hover group flex flex-col gap-5 p-7 rounded-xl border border-zinc-200 bg-white shadow-sm ${cap.span}`}
    >
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-400 group-hover:text-teal-brand group-hover:border-teal-brand/20 group-hover:bg-teal-brand/5 transition-colors duration-200">
          {cap.icon}
        </div>
        <span className="text-[11px] font-mono font-bold text-zinc-300 tracking-widest tabular-nums">{cap.step}</span>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-[15px] font-bold text-zinc-800 tracking-tight leading-snug">{cap.title}</h3>
        <p className="text-[13px] text-zinc-500 leading-relaxed">{cap.desc}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {cap.tags.map(t => (
          <span key={t} className="text-[10px] font-mono px-2 py-1 rounded-md text-zinc-500 border border-zinc-200 bg-zinc-50">
            {t}
          </span>
        ))}
      </div>

      {cap.extra}
    </motion.article>
  )
}

export default function CapabilityMatrix() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true })

  return (
    <section id="capabilities" className="py-24 px-6 border-b border-zinc-200">
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
              Capability Matrix
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-tight">
              Cuatro dominios.{' '}
              <span className="text-gradient-teal">Un sistema coherente.</span>
            </h2>
          </div>
          <p className="text-[13px] text-zinc-500 max-w-xs leading-relaxed sm:text-right">
            Cada capacidad es un bloque diseñado para producción, no para demos aislados.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CAPABILITIES.map((cap, i) => (
            <BentoCard key={cap.id} cap={cap} index={i}/>
          ))}
        </div>
      </div>
    </section>
  )
}
