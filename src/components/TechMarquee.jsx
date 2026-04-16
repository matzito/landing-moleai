import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const TECHNOLOGIES = [
  { name: 'Azure',      color: '#0089D6' },
  { name: '.NET',       color: '#512BD4' },
  { name: 'Python',     color: '#3776AB' },
  { name: 'React',      color: '#0ea5e9' },
  { name: 'LangChain',  color: '#1a9b6c' },
  { name: 'LangGraph',  color: '#0d9488' },
  { name: 'OpenAI',     color: '#1a7f5a' },
  { name: 'Anthropic',  color: '#b45309' },
  { name: 'Pinecone',   color: '#2D3FE7' },
  { name: 'FastAPI',    color: '#009688' },
  { name: 'Docker',     color: '#2496ED' },
  { name: 'Kubernetes', color: '#326CE5' },
  { name: 'PostgreSQL', color: '#4169E1' },
  { name: 'Redis',      color: '#DC382D' },
  { name: 'Terraform',  color: '#7B42BC' },
  { name: 'TypeScript', color: '#3178C6' },
  { name: 'Weaviate',   color: '#FA0050' },
  { name: 'Grafana',    color: '#F46800' },
]

function TechItem({ tech }) {
  return (
    <div className="group flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 mx-2 rounded-lg border border-zinc-200 bg-white cursor-default transition-all duration-200 hover:border-zinc-300 hover:shadow-sm">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300"
        style={{ backgroundColor: tech.color, filter: 'grayscale(1) opacity(0.4)' }}
        onMouseEnter={e => { e.currentTarget.style.filter = 'grayscale(0) opacity(1)' }}
        onMouseLeave={e => { e.currentTarget.style.filter = 'grayscale(1) opacity(0.4)' }}
      />
      <span
        className="text-[12px] font-medium font-mono whitespace-nowrap transition-colors duration-200 text-zinc-400"
        onMouseEnter={e => { e.currentTarget.style.color = tech.color }}
        onMouseLeave={e => { e.currentTarget.style.color = '' }}
      >
        {tech.name}
      </span>
    </div>
  )
}

export default function TechMarquee() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true })
  const doubled = [...TECHNOLOGIES, ...TECHNOLOGIES]

  return (
    <section id="stack" className="py-20 border-b border-zinc-200 overflow-hidden bg-[#F0F2F3]" ref={ref}>
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between"
        >
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-mono font-semibold tracking-widest uppercase text-zinc-400">
              Technology Stack
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
              El stack que mueve producción real.
            </h2>
          </div>
          <p className="text-[13px] text-zinc-500 max-w-xs sm:text-right leading-relaxed">
           
          </p>
        </motion.div>
      </div>

      <div className="relative">
        {/* Side fades */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, #F0F2F3, transparent)' }}/>
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(-90deg, #F0F2F3, transparent)' }}/>

        <div className="flex overflow-hidden mb-2.5">
          <div className="flex animate-marquee">
            {doubled.map((tech, i) => <TechItem key={`a${i}`} tech={tech}/>)}
          </div>
        </div>
        <div className="flex overflow-hidden">
          <div className="flex" style={{ animation: 'marquee 38s linear infinite reverse' }}>
            {[...doubled].reverse().map((tech, i) => <TechItem key={`b${i}`} tech={tech}/>)}
          </div>
        </div>
      </div>
    </section>
  )
}
