'use client'

import { useState, useRef, useEffect, useCallback, ReactElement } from 'react'
import { AnalisisResult, Prioridad, PageSpeedData } from '@/types/analyzer'
import DonutChart from './DonutChart'
import ScoreCard from './ScoreCard'

const TABS = [
  { id: 'resumen',    label: 'Vista General' },
  { id: 'scores',    label: 'Puntuaciones' },
  { id: 'auditoria', label: 'Auditoría' },
  { id: 'ideas',     label: 'Ideas de Mejora' },
  { id: 'seo',       label: 'SEO Técnico' },
] as const

type TabId = typeof TABS[number]['id']

const S = 'w-5 h-5'
const SECTION_ICONS: Record<string, ReactElement> = {
  topOfPage: (
    <svg className={S} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25M3 13.5h18M3.75 5.25h16.5A1.5 1.5 0 0121.75 6.75v8.25a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5z"/>
    </svg>
  ),
  propuestaDeValor: (
    <svg className={S} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
    </svg>
  ),
  copywriting: (
    <svg className={S} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>
    </svg>
  ),
  confianza: (
    <svg className={S} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
    </svg>
  ),
  disenoUX: (
    <svg className={S} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
    </svg>
  ),
  conversion: (
    <svg className={S} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>
    </svg>
  ),
  experienciaMovil: (
    <svg className={S} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/>
    </svg>
  ),
  velocidadPagina: (
    <svg className={S} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
    </svg>
  ),
}

const SECCIONES_CONFIG = [
  { key: 'topOfPage',        titulo: 'Top of Page'              },
  { key: 'propuestaDeValor', titulo: 'Propuesta de Valor'       },
  { key: 'copywriting',      titulo: 'Copywriting'              },
  { key: 'confianza',        titulo: 'Confianza y Credibilidad' },
  { key: 'disenoUX',         titulo: 'Diseño & UX'              },
  { key: 'conversion',       titulo: 'Conversión'               },
  { key: 'experienciaMovil', titulo: 'Experiencia Móvil'        },
  { key: 'velocidadPagina',  titulo: 'Velocidad de Página'      },
] as const

const PSI_METRICS: { key: keyof PageSpeedData['mobile']; label: string }[] = [
  { key: 'fcp', label: 'First Contentful Paint' },
  { key: 'lcp', label: 'Largest Contentful Paint' },
  { key: 'cls', label: 'Cumulative Layout Shift' },
  { key: 'tbt', label: 'Total Blocking Time' },
  { key: 'si',  label: 'Speed Index' },
]

const SCREENSHOT_TOPS = ['4%', '16%', '27%', '39%', '52%', '64%', '76%', '88%']

function prioridadStyles(p: Prioridad) {
  switch (p) {
    case 'ALTA':  return 'bg-red-600 text-white'
    case 'MEDIA': return 'bg-amber-500 text-white'
    case 'BAJA':  return 'bg-zinc-500 text-white'
  }
}

function estadoDetectadoStyles(estado: string) {
  switch (estado) {
    case 'presente':        return 'bg-green-500'
    case 'mejorar':         return 'bg-amber-500'
    case 'necesita mejora': return 'bg-red-500'
    default:                return 'bg-gray-400'
  }
}


function psiScoreColor(score: number) {
  if (score >= 90) return 'text-green-600'
  if (score >= 50) return 'text-amber-500'
  return 'text-red-600'
}

function SectionTitle({ icon, title, subtitle }: { icon: ReactElement; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-1 mb-4">
      <div className="w-8 h-8 flex items-center justify-center text-zinc-900 flex-shrink-0">
        {icon}
      </div>
      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 uppercase">{title}</h2>
    </div>
  )
} 

interface Props {
  result: AnalisisResult
  onRelaunch: () => void
  resultId?: string
  relaunchesLeft?: number
  onRate?: (rating: number, feedback: string) => Promise<void>
  onExpandSidebar?: () => void
}

export default function AnalyzerReport({ result, onRelaunch, resultId, relaunchesLeft = 3, onRate, onExpandSidebar }: Props) {
  const [activeTab, setActiveTab]                 = useState<TabId>('resumen')
  const [expanded, setExpanded]                   = useState<number | null>(null)
  const [copied, setCopied]                       = useState(false)
  const [shareCopied, setShareCopied]             = useState(false)
  const [screenshotStatus, setScreenshotStatus]   = useState<'loading' | 'loaded' | 'failed'>('loading')
  const [rating, setRating]                       = useState(0)
  const [feedbackText, setFeedbackText]           = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  const scrollRef   = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<TabId, HTMLElement | null>>({
    resumen: null, scores: null, auditoria: null, ideas: null, seo: null,
  })

  const scrollToSection = (id: TabId) => {
    const el = sectionRefs.current[id]
    const container = scrollRef.current
    if (!el || !container) return
    const offset = el.offsetTop - 108 // top bar + tab bar height
    container.scrollTo({ top: offset, behavior: 'smooth' })
    setActiveTab(id)
  }

  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    const scrollTop = container.scrollTop + 120
    let current: TabId = 'resumen'
    for (const { id } of TABS) {
      const el = sectionRefs.current[id]
      if (el && el.offsetTop <= scrollTop) current = id
    }
    setActiveTab(current)
  }, [])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const hostname = (() => {
    try { return new URL(result.url).hostname } catch { return result.url }
  })()

  const handleCopy = () => {
    const text = result.ideasMejora
      .map((i, n) => `${n + 1}. [${i.seccion}] ${i.titulo}\n   ${i.detalle}`)
      .join('\n\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    const shareUrl = resultId
      ? `${window.location.origin}/analizador?id=${resultId}`
      : result.url
    navigator.clipboard.writeText(shareUrl)
    setShareCopied(true)
    setTimeout(() => setShareCopied(false), 2000)
  }

  const handleExportPDF = () => {
    window.print()
  }

  const handleFeedbackSubmit = async () => {
    if (rating === 0 || !onRate) return
    setSubmittingFeedback(true)
    await onRate(rating, feedbackText)
    setFeedbackSubmitted(true)
    setSubmittingFeedback(false)
  }

  const psd = result.pageSpeedData

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden font-sans print:block print:h-auto print:overflow-visible print:rounded-none" style={{ boxShadow: '0 2px 24px 0 rgba(0,0,0,0.08)' }}>

      {/* ── Top bar ── */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between bg-white flex-shrink-0 gap-2 print:hidden border-b border-zinc-100">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {onExpandSidebar && (
            <button onClick={onExpandSidebar}
              className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors flex-shrink-0"
              title="Mostrar panel">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
              </svg>
            </button>
          )}
          <a href={result.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-gray-900 hover:underline truncate min-w-0">
            <span className="truncate">{hostname}</span>
            <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleCopy}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-full text-[13px] font-medium text-gray-600 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
            {copied ? 'Copiado' : 'Copiar ideas'}
          </button>
          <button onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-full text-[13px] font-medium text-gray-600 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
            {shareCopied ? 'Copiado' : 'Compartir'}
          </button>
          <button onClick={handleExportPDF}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-full text-[13px] font-medium text-gray-600 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            PDF
          </button>
          <button onClick={onRelaunch}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#F4623A] hover:bg-[#e05530] text-white rounded-full text-[13px] font-semibold transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span className="hidden sm:inline">Nuevo Análisis</span>
          </button>
        </div>
      </div>

      {/* ── Tab nav (pill style) ── */}
      <div className="px-4 sm:px-6 py-3 bg-white flex-shrink-0 border-b border-zinc-100 print:hidden">
        <div className="bg-zinc-100 rounded-full p-1 flex items-center gap-0.5 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => scrollToSection(t.id)}
              className={`px-3 sm:px-4 py-1.5 text-[12px] sm:text-[13px] font-semibold rounded-full transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === t.id
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto print:overflow-visible print:h-auto" style={{ backgroundColor: '#d6d6d6' }}>
        <div id="report-print-content" className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex flex-col gap-8">

          {/* ══ 1. RESUMEN EJECUTIVO ══ */}
          <section ref={el => { sectionRefs.current.resumen = el }}>
            <SectionTitle icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/></svg>} title="Vista General" />
            <div className="flex flex-col gap-4">

              {/* Top row: dark score card + meta + summary */}
              <div className="grid lg:grid-cols-[260px_1fr] gap-4">

                {/* Dark score card */}
                <div className="glass-card-clipped rounded-2xl overflow-hidden p-6 flex flex-col items-center justify-center gap-4">
                  <p className="text-[18px] font-black tracking-widest text-gray-700 uppercase">Puntuación</p>
                  <DonutChart score={result.puntuacionGeneral} etiqueta={result.etiqueta} />
                  <div className="w-full bg-zinc-200 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all" style={{ width: `${result.puntuacionGeneral}%`, background: 'linear-gradient(90deg,#0d9488,#0369a1)' }} />
                  </div>
                </div>

                {/* Meta + summary + fortalezas/a mejorar */}
                <div className="glass-card-clipped rounded-2xl overflow-hidden flex flex-col">
                  <div className="p-6 flex flex-col gap-4 border-b border-zinc-200">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'TIPO',      value: result.tipo },
                        { label: 'OBJETIVO',  value: result.objetivo },
                        { label: 'PERSONA',   value: result.persona },
                        { label: 'INDUSTRIA', value: result.industria },
                      ].map(m => (
                        <span key={m.label} className="bg-zinc-100 rounded-full px-2.5 py-1 text-[12px]">
                          <span className="font-bold text-gray-900 mr-1">{m.label}:</span>
                          <span className="text-gray-900">{m.value}</span>
                        </span>
                      ))}
                    </div>
                    <blockquote className="border-l-4 border-teal-500 pl-4 text-[15px] text-gray-700 leading-relaxed italic">
                      {result.resumenEjecutivo}
                    </blockquote>
                  </div>
                  <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 flex-1">
                    <div>
                      <div className="px-5 py-3 border-b border-zinc-100 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-green-500"/>
                        <span className="text-green-600 font-black text-[11px] tracking-widest uppercase">Fortalezas</span>
                      </div>
                      <ul className="flex flex-col divide-y divide-zinc-100">
                        {result.fortalezas.map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5 px-5 py-3 text-[13px] text-gray-700">
                            <svg className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                            </svg>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="px-5 py-3 border-b border-zinc-100 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm bg-red-500"/>
                        <span className="text-red-600 font-black text-[11px] tracking-widest uppercase">A Mejorar</span>
                      </div>
                      <ul className="flex flex-col divide-y divide-zinc-100">
                        {result.aMejorar.map((m, i) => (
                          <li key={i} className="flex items-start gap-2.5 px-5 py-3 text-[13px] text-gray-700">
                            <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </section>

          <hr className="border-zinc-200/50" />

          {/* ══ 2. PUNTUACIONES ══ */}
          <section ref={el => { sectionRefs.current.scores = el }}>
            <SectionTitle icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z"/></svg>} title="Puntuaciones" subtitle="Evaluadas en más de 60 criterios de conversión" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SECCIONES_CONFIG.map(s => (
                <ScoreCard
                  key={s.key}
                  titulo={s.titulo}
                  icono={SECTION_ICONS[s.key]}
                  datos={result.secciones[s.key as keyof typeof result.secciones]}
                />
              ))}
            </div>
          </section>

          <hr className="border-zinc-200/50" />

          {/* ══ 3. AUDITORÍA ══ */}
          <section ref={el => { sectionRefs.current.auditoria = el }}>
            <SectionTitle icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>} title="Diagnóstico de Rendimiento" subtitle="Secciones detectadas y su estado" />

            {/* PageSpeed */}
            {psd ? (
              <div className="glass-card-clipped rounded-2xl overflow-hidden mb-6">
                <div className="text-gray-800 px-5 py-3 flex items-center justify-between">
                  <span className="font-black text-sm tracking-wide">⚡ PageSpeed Insights - Datos Reales</span>
                  <span className="text-[11px] text-black font-mono">Google Lighthouse</span>
                </div>
                <div className="grid grid-cols-2 divide-x divide-zinc-100 border-b border-zinc-100">
                  {[
                    { label: 'Desktop', score: psd.desktopScore },
                    { label: 'Mobile',  score: psd.mobileScore  },
                  ].map(({ label, score }) => (
                    <div key={label} className="flex flex-col items-center py-5 gap-1">
                      <span className="text-[14px] font-black tracking-widest text-gray-800 uppercase">{label}</span>
                      <span className={`text-4xl font-black font-mono ${psiScoreColor(score)}`}>{score}</span>
                      <div className="mt-1 w-20 bg-zinc-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${score >= 90 ? 'bg-green-500' : score >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="grid grid-cols-[1fr_130px_130px] px-5 py-2 border-b border-zinc-100 bg-zinc-50">
                    <span className="text-[13px] font-black tracking-widest text-gray-600 uppercase">Métrica</span>
                    <span className="text-[13px] font-black tracking-widest text-gray-600 uppercase text-center">Desktop</span>
                    <span className="text-[13px] font-black tracking-widest text-gray-600 uppercase text-center">Mobile</span>
                  </div>
                  {PSI_METRICS.map(({ key, label }) => (
                    <div key={key} className="grid grid-cols-[1fr_130px_130px] px-5 py-3 border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors">
                      <span className="text-[14px] text-gray-700 font-medium">{label}</span>
                      <span className="text-[14px] font-mono text-gray-900 text-center">{psd.desktop[key]}</span>
                      <span className="text-[14px] font-mono text-gray-900 text-center">{psd.mobile[key]}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="glass-card-clipped rounded-2xl px-5 py-4 flex items-center gap-3 text-gray-400 mb-6">
                <span className="text-lg">⚡</span>
                <span className="text-[13px]">Los datos reales de PageSpeed no estuvieron disponibles. Velocidad estimada por IA.</span>
              </div>
            )}

            <div className="grid lg:grid-cols-[260px_1fr] gap-6 items-start">
              <div className="flex flex-col gap-3">
                <div className="text-[11px] font-black tracking-widest text-gray-400 uppercase">Vista previa analizada</div>
                <div className="relative rounded-2xl overflow-hidden bg-zinc-200" style={{ paddingBottom: '150%' }}>
                  {screenshotStatus !== 'failed' && (
                    <img
                      src={`https://s0.wordpress.com/mshots/v1/${encodeURIComponent(result.url)}?w=600&h=900`}
                      alt="Vista previa"
                      onLoad={() => setScreenshotStatus('loaded')}
                      onError={() => setScreenshotStatus('failed')}
                      className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ${
                        screenshotStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  )}
                  {screenshotStatus !== 'loaded' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-gray-400 text-xs text-center px-4">
                        {screenshotStatus === 'loading' ? 'Cargando vista previa...' : 'Vista previa no disponible'}
                      </span>
                    </div>
                  )}
                  {screenshotStatus === 'loaded' && result.seccionesDetectadas.map((s, i) => (
                    <div key={s.numero} className="absolute left-2 flex items-center"
                      style={{ top: SCREENSHOT_TOPS[i] ?? `${8 + i * 12}%` }}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow ${
                        s.estado === 'presente' ? 'bg-green-500' : s.estado === 'mejorar' ? 'bg-amber-500' : 'bg-red-500'
                      }`}>
                        {s.numero}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="glass-card-clipped rounded-2xl overflow-hidden">
                  <div className="text-gray-800 px-5 py-3 font-black text-sm tracking-widest uppercase">
                    Mapa de Secciones
                  </div>
                  <div className="divide-y divide-zinc-100">
                    {result.seccionesDetectadas.map(s => (
                      <div key={s.numero} className="flex items-center gap-4 px-5 py-3.5">
                        <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center text-xs font-black flex-shrink-0">
                          {s.numero}
                        </div>
                        <span className="flex-1 text-[14px] font-medium text-gray-700">{s.nombre}</span>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${estadoDetectadoStyles(s.estado)}`}/>
                          <span className="text-[12px] font-medium text-gray-500">
                            {s.estado === 'presente' ? 'Presente' : s.estado === 'mejorar' ? 'A mejorar' : 'Necesita mejora'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-[13px] text-gray-500 flex-wrap">
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500"/><span>Presente y efectiva</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"/><span>A mejorar</span></div>
                  <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500"/><span>Necesita mejora</span></div>
                </div>
              </div>
            </div>
          </section>

          <hr className="border-zinc-200/50" />

          {/* ══ 4. IDEAS DE MEJORA ══ */}
          <section ref={el => { sectionRefs.current.ideas = el }}>
            <SectionTitle icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/></svg>} title="Ideas de Mejora" subtitle="Ordenadas por prioridad — expande para ver el detalle" />
            <div className="glass-card-clipped rounded-2xl overflow-hidden divide-y divide-zinc-100">
              {result.ideasMejora.map((idea, i) => (
                <div key={i} className="bg-transparent">
                  <button
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-zinc-50 transition-colors"
                    onClick={() => setExpanded(expanded === i ? null : i)}
                  >
                    <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-sm font-black flex-shrink-0">
                      {i + 1}
                    </div>
                    <span className="flex-1 text-[14px] font-semibold text-gray-800 leading-snug">{idea.titulo}</span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block mr-3">{idea.seccion}</span>
                    <span className={`${prioridadStyles(idea.prioridad)} text-[11px] font-black px-2.5 py-1 rounded tracking-widest flex-shrink-0 mr-2`}>
                      {idea.prioridad}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expanded === i ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                  {expanded === i && (
                    <div className="px-5 pb-5 pl-[72px] border-t border-zinc-100 pt-3 flex flex-col gap-3">
                      <p className="text-[13px] text-gray-600 leading-relaxed">{idea.detalle}</p>
                      {idea.inspiracion && idea.inspiracion.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Inspírate en:</span>
                          {idea.inspiracion.map(name => (
                            <a key={name}
                              href={`https://www.google.com/search?q=${encodeURIComponent(name + ' landing page')}`}
                              target="_blank" rel="noopener noreferrer"
                              className="bg-zinc-100 hover:bg-teal-50 rounded-full px-2.5 py-0.5 text-[12px] text-zinc-600 font-medium hover:text-teal-700 transition-colors">
                              {name} ↗
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <hr className="border-zinc-200/50" />

          {/* ══ 5. SEO TÉCNICO ══ */}
          <section ref={el => { sectionRefs.current.seo = el }}>
            <SectionTitle icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25M3 13.5h18M3.75 5.25h16.5A1.5 1.5 0 0121.75 6.75v8.25a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6.75a1.5 1.5 0 011.5-1.5z"/></svg>} title="SEO Técnico" />
            <div className="glass-card-clipped rounded-2xl overflow-hidden mb-8">
              <div className="hidden sm:grid grid-cols-[2fr_120px_3fr] text-black px-5 py-3 gap-4">
                <span className="text-[11px] font-black tracking-widest uppercase">Problema</span>
                <span className="text-[11px] font-black tracking-widest uppercase">Prioridad</span>
                <span className="text-[11px] font-black tracking-widest uppercase">Solución</span>
              </div>
              <div className="divide-y divide-zinc-100">
                {result.seoTecnico.map((item, i) => (
                  <div key={i} className="flex flex-col sm:grid sm:grid-cols-[2fr_120px_3fr] px-5 py-4 gap-2 sm:gap-4 items-start hover:bg-zinc-50 transition-colors">
                    <span className="text-[14px] text-gray-800 font-medium">{item.problema}</span>
                    <span className={`${prioridadStyles(item.prioridad)} text-[11px] font-black px-2.5 py-1 rounded tracking-widest self-start`}>
                      {item.prioridad}
                    </span>
                    <span className="text-[13px] text-gray-500 leading-relaxed">{item.solucion}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Re-analizar */}
            <div className="glass-card-clipped rounded-2xl p-6 flex flex-col overflow-hidden sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 print:hidden">
              <div>
                <h3 className="font-black text-zinc-900 text-lg">¿Hiciste cambios?</h3>
                <p className="text-gray-500 text-[13px] mt-1">Vuelve a analizar para ver cómo mejoró tu puntuación.</p>
                <p className="text-gray-400 text-[12px] mt-1">{relaunchesLeft} de 3 re-análisis restantes</p>
              </div>
              <button onClick={onRelaunch}
                className="flex items-center gap-2 px-5 py-3 bg-[#F4623A] hover:bg-[#e05530] text-white rounded-full font-bold text-sm transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
                Re-analizar
              </button>
            </div>

            {/* Feedback */}
            {onRate && (
              <div className="glass-card-clipped rounded-2xl p-6 flex flex-col gap-4 overflow-hidden print:hidden">
                <div>
                  <h3 className="font-black text-zinc-900 text-lg">Califica tu experiencia</h3>
                  <p className="text-gray-500 text-[13px] mt-0.5">Cuéntanos qué tan útil fue este análisis.</p>
                </div>
                {feedbackSubmitted ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                    <span className="text-green-600 font-medium text-[14px]">¡Gracias por tu feedback!</span>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-[13px] font-medium text-gray-700 mb-2">¿Cómo calificarías el análisis?</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} onClick={() => setRating(star)}
                            className={`text-2xl leading-none transition-colors ${star <= rating ? 'text-amber-400' : 'text-gray-200 hover:text-amber-300'}`}>
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
                      placeholder="¿Qué te gustó o no te gustó? ¿Cómo podríamos mejorar?"
                      rows={3}
                      className="w-full border border-zinc-200 rounded-xl px-3 py-2 text-[13px] text-gray-700 placeholder-gray-400 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/10 resize-none"/>
                    <button onClick={handleFeedbackSubmit}
                      disabled={rating === 0 || submittingFeedback}
                      className="self-start px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-full font-bold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      {submittingFeedback ? 'Enviando...' : 'Enviar opinión'}
                    </button>
                  </>
                )}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}
