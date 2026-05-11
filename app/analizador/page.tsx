'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { addDoc, collection, getDoc, setDoc, doc as fsDoc } from 'firebase/firestore'
import { AnalysisResult, HistoryItem } from '@/types/analyzer'
import { fetchPageContent, analyzeWithAI } from '@/lib/analyzeUrl'
import { getPageSpeed } from '@/lib/pageSpeed'
import dynamic from 'next/dynamic'
const AnalyzerReport = dynamic(() => import('@/components/analyzer/AnalyzerReport'), { ssr: false })
import { db } from '@/lib/firebase'
import { auth, googleProvider } from '@/lib/firebaseAuth'
import LogoMark from '@/components/LogoMark'
import { scoreToColor } from '@/lib/scoreColor'

// ── Types ──────────────────────────────────────────────────────────────────

type Phase =
  | 'loading_shared' | 'idle' | 'fetch' | 'extract'
  | 'ai' | 'parse' | 'done' | 'error' | 'auth_required'

const STEPS = [
  { phase: 'fetch'   as Phase, label: 'Accediendo a la página...',                 detail: 'Conectando con Jina Reader'    },
  { phase: 'extract' as Phase, label: 'Extrayendo contenido...',                   detail: 'Convirtiendo a Markdown'       },
  { phase: 'ai'      as Phase, label: 'Analizando con IA y PageSpeed Insights...', detail: 'Corriendo en paralelo'         },
  { phase: 'parse'   as Phase, label: 'Estructurando el reporte...',               detail: 'Validando y combinando datos'  },
]

const PHASE_ORDER: Phase[] = ['fetch', 'extract', 'ai', 'parse', 'done']

// ── Helpers ────────────────────────────────────────────────────────────────

const FREE_KEY    = 'moleai_free_used'
const HISTORY_KEY = 'moleai_historial'
const MAX_HIST    = 10

function phaseIndex(p: Phase)  { return PHASE_ORDER.indexOf(p) }
function todayKey()            { return new Date().toISOString().slice(0, 10) }
function monthKey()            { return `moleai_count_${new Date().toISOString().slice(0, 7)}` }

function normalizeUrl(raw: string): string {
  const t = raw.trim()
  return /^https?:\/\//i.test(t) ? t : `https://${t}`
}
function getHostname(url: string): string {
  try { return new URL(url).hostname } catch { return url }
}
function readHistory(): HistoryItem[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}
function writeHistory(items: HistoryItem[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items)) } catch {}
}
function pushHistory(item: HistoryItem) {
  const cur = readHistory()
  writeHistory([item, ...cur.filter(h => h.id !== item.id)].slice(0, MAX_HIST))
}
function getMonthlyCount(): number {
  try { return parseInt(localStorage.getItem(monthKey()) || '0', 10) } catch { return 0 }
}
function incrementMonthlyCount() {
  try {
    const n = getMonthlyCount() + 1
    localStorage.setItem(monthKey(), String(n))
    return n
  } catch { return 0 }
}
function scoreLabel(s: number) {
  if (s >= 80) return 'EXCELENTE'
  if (s >= 60) return 'BUENA'
  if (s >= 40) return 'REGULAR'
  return 'NECESITA TRABAJO'
}

// ── Firestore ─────────────────────────────────────────────────────────────

async function checkDomainLimit(uid: string, domain: string): Promise<boolean> {
  const snap = await getDoc(fsDoc(db, 'limits', `${uid}_${domain}_${todayKey()}`))
  return !snap.exists()
}
async function setDomainLimit(uid: string, domain: string) {
  await setDoc(fsDoc(db, 'limits', `${uid}_${domain}_${todayKey()}`), {
    uid, domain, date: todayKey(), createdAt: new Date(),
  })
}
async function loadUserHistoryFromFirestore(uid: string): Promise<HistoryItem[]> {
  try {
    const snap = await getDoc(fsDoc(db, 'users', uid))
    if (snap.exists()) return (snap.data().historial as HistoryItem[]) ?? []
  } catch {}
  return []
}
async function saveUserHistoryToFirestore(uid: string, items: HistoryItem[]) {
  try {
    const meta = items.map(({ id, url, hostname, score, label, createdAt }) =>
      ({ id, url, hostname, score, label, createdAt }))
    await setDoc(fsDoc(db, 'users', uid), { historial: meta }, { merge: true })
  } catch {}
}

// ── Small components ───────────────────────────────────────────────────────

function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AnalizadorPage() {
  const [url, setUrl]             = useState('')
  const [phase, setPhase]         = useState<Phase>('idle')
  const [error, setError]         = useState<string | null>(null)
  const [result, setResult]       = useState<AnalysisResult | null>(null)
  const [resultId, setResultId]   = useState<string | null>(null)
  const [logLines, setLogLines]   = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen]           = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [history, setHistory]     = useState<HistoryItem[]>([])
  const [monthlyCount, setMonthlyCount] = useState(0)
  const [activeId, setActiveId]   = useState<string | null>(null)
  const [user, setUser]           = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [signingIn, setSigningIn] = useState(false)

  const inputRef    = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  const analysesLeft = Math.max(0, 3 - monthlyCount)

  // ── Auth ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setAuthLoading(false)
      if (u) {
        const server = await loadUserHistoryFromFirestore(u.uid)
        const local  = readHistory()
        // Local items come first so their full `result` field wins deduplication
        const merged = [...local, ...server]
          .filter((item, idx, arr) => arr.findIndex(h => h.id === item.id) === idx)
          .slice(0, MAX_HIST)
        setHistory(merged)
        writeHistory(merged)
      } else {
        setHistory(readHistory())
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    setMonthlyCount(getMonthlyCount())
    const id = new URLSearchParams(window.location.search).get('id')
    if (id) loadSharedAnalysis(id)
  }, [])

  useEffect(() => {
    if (terminalRef.current)
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [logLines])

  function addLog(line: string) { setLogLines(prev => [...prev, line]) }

  const loadSharedAnalysis = useCallback(async (id: string) => {
    const cached = readHistory().find(h => h.id === id)
    if (cached) {
      setResult(cached.result); setResultId(id); setUrl(cached.url); setActiveId(id); setPhase('done')
      return
    }
    setPhase('loading_shared')
    try {
      const snap = await getDoc(fsDoc(db, 'analisis', id))
      if (snap.exists()) {
        const data = snap.data() as AnalysisResult
        setResult(data); setResultId(id); setUrl(data.url); setActiveId(id); setPhase('done')
      } else { setError('Análisis no encontrado.'); setPhase('error') }
    } catch { setError('No se pudo cargar el análisis.'); setPhase('error') }
  }, [])

  async function handleGoogleLogin() {
    setSigningIn(true)
    try {
      await signInWithPopup(auth, googleProvider)
      if (phase === 'auth_required') setPhase('idle')
    } catch {}
    setSigningIn(false)
  }

  async function handleSignOut() {
    await signOut(auth)
    setHistory(readHistory())
  }

  async function handleAnalyze() {
    const normalized = normalizeUrl(url)
    const domain = getHostname(normalized)

    // RATE LIMITING — uncomment to re-enable
    // if (!user) {
    //   if (localStorage.getItem(FREE_KEY) === 'true') { setPhase('auth_required'); return }
    // } else {
    //   const ok = await checkDomainLimit(user.uid, domain).catch(() => true)
    //   if (!ok) {
    //     setError(`Ya analizaste ${domain} hoy. Vuelve mañana.`)
    //     setPhase('error')
    //     return
    //   }
    // }

    setPhase('fetch'); setError(null); setLogLines([]); setResult(null); setResultId(null); setActiveId(null)
    window.history.pushState({}, '', '/analizador')

    try {
      addLog(`> Iniciando análisis: ${normalized}`)
      addLog('> Conectando con Jina Reader...')
      const content = await fetchPageContent(normalized)

      setPhase('extract')
      addLog(`✓ Página obtenida — ${(content.length / 1024).toFixed(1)} KB`)
      addLog('> Preparando contexto...')

      setPhase('ai')
      addLog('> Enviando a IA via OpenRouter...')
      addLog('> Consultando Google PageSpeed Insights...')
      addLog('  (corriendo en paralelo)')

      const [aiRes, psiRes] = await Promise.allSettled([
        analyzeWithAI(normalized, content),
        getPageSpeed(normalized),
      ])

      if (aiRes.status === 'rejected') throw aiRes.reason
      const data = aiRes.value

      if (psiRes.status === 'fulfilled') {
        const psd = psiRes.value
        addLog(`✓ PageSpeed: Desktop ${psd.desktopScore}  Mobile ${psd.mobileScore}`)
        const avg = Math.round((psd.mobileScore + psd.desktopScore) / 2)
        data.sections.pageSpeed.score   = avg
        data.sections.pageSpeed.status  = scoreLabel(avg) as typeof data.sections.pageSpeed.status
        data.sections.pageSpeed.details = { desktop: psd.desktopScore, mobile: psd.mobileScore }
        data.pageSpeedData = psd

        // Recalculate general score now that pageSpeed has real data
        const scores = Object.values(data.sections).map(s => s.score)
        const recalc = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        data.overallScore = recalc
        data.label = scoreLabel(recalc)
      } else {
        addLog('⚠ PageSpeed no disponible — usando estimación IA')
      }
      addLog('✓ Análisis IA completo')

      setPhase('parse')
      addLog('> Guardando reporte...')

      // Always generate a local ID first so we never skip saving
      const localId = crypto.randomUUID()
      let docId = localId

      try {
        const ref = await addDoc(collection(db, 'analisis'), { ...data, uid: user?.uid ?? null, createdAt: new Date() })
        docId = ref.id
        window.history.replaceState({}, '', `/analizador?id=${docId}`)
      } catch {
        window.history.replaceState({}, '', `/analizador?id=${localId}`)
      }

      // RATE LIMITING — uncomment to re-enable
      // if (!user) localStorage.setItem(FREE_KEY, 'true')
      // else setDomainLimit(user.uid, domain).catch(() => {})

      const newCount = incrementMonthlyCount()
      setMonthlyCount(newCount)

      const item: HistoryItem = {
        id: docId, url: normalized, hostname: domain,
        score: data.overallScore, label: data.label,
        createdAt: new Date().toISOString(), result: data,
      }
      pushHistory(item)
      const updated = readHistory()
      setHistory(updated)
      setResultId(docId); setActiveId(docId)
      if (user) saveUserHistoryToFirestore(user.uid, updated).catch(() => {})

      addLog('> Renderizando resultados...')
      setResult(data)
      setPhase('done')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      addLog(`✗ ${msg}`)
      setError(msg)
      setPhase('error')
    }
  }

  function handleRelaunch() {
    setPhase('idle'); setResult(null); setError(null); setLogLines([])
    setUrl(''); setResultId(null)
    window.history.pushState({}, '', '/analizador')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  async function handleHistoryClick(item: HistoryItem) {
    setSidebarOpen(false)
    if (item.result) {
      setResult(item.result); setResultId(item.id); setUrl(item.url)
      setActiveId(item.id); setPhase('done')
      window.history.replaceState({}, '', `/analizador?id=${item.id}`)
      return
    }
    // Item came from Firestore meta (no result saved locally) — fetch it
    setPhase('loading_shared')
    try {
      const snap = await getDoc(fsDoc(db, 'analisis', item.id))
      if (snap.exists()) {
        const data = snap.data() as AnalysisResult
        // Persist locally so next click is instant
        const full: HistoryItem = { ...item, result: data }
        pushHistory(full)
        setHistory(readHistory())
        setResult(data); setResultId(item.id); setUrl(item.url); setActiveId(item.id); setPhase('done')
        window.history.replaceState({}, '', `/analizador?id=${item.id}`)
      } else { setError('Análisis no encontrado.'); setPhase('error') }
    } catch { setError('No se pudo cargar el análisis.'); setPhase('error') }
  }

  function handleDeleteHistory(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    const updated = readHistory().filter(h => h.id !== id)
    writeHistory(updated)
    setHistory(updated)
    if (activeId === id) { setActiveId(null); setResult(null); setPhase('idle') }
    if (user) saveUserHistoryToFirestore(user.uid, updated).catch(() => {})
  }

  async function handleRate(rating: number, feedback: string) {
    try {
      await addDoc(collection(db, 'feedback'), {
        url: result?.url, resultId, rating, feedback, uid: user?.uid ?? null, createdAt: new Date(),
      })
    } catch {}
  }

  // ── Sidebar ──────────────────────────────────────────────────────────────
  const sidebar = (
    <aside className={[
      'fixed top-0 left-0 bottom-0 z-30 w-64 flex flex-col bg-white border-r border-zinc-200 print:hidden',
      'transition-all duration-300 ease-in-out',
      'lg:relative lg:z-auto lg:translate-x-0',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      sidebarCollapsed ? 'lg:w-0 lg:overflow-hidden lg:border-r-0' : 'lg:w-64',
    ].join(' ')}>

      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-100">
        <a href="/" className="flex items-center gap-2.5">
          <LogoMark size={26}/>
          <span className="text-[15px] font-semibold tracking-tight text-zinc-800">
            mole<span className="text-teal-600">ai</span>
          </span>
        </a>
        <div className="flex items-center gap-1">
          {/* Collapse button — desktop only */}
          <button onClick={() => setSidebarCollapsed(true)}
            className="hidden lg:flex p-1 text-zinc-400 hover:text-zinc-600 rounded hover:bg-zinc-100 transition-colors"
            title="Ocultar panel">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
            </svg>
          </button>
          {/* Close button — mobile only */}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-zinc-400 hover:text-zinc-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* New Analysis */}
      <div className="px-3 py-3 border-b border-zinc-100">
        <button onClick={handleRelaunch}
          className="btn-persimmon w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-bold">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo Análisis
        </button>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto py-3">
        <div className="px-4 pb-2">
          <span className="text-[10px] font-mono font-semibold tracking-widest text-zinc-400 uppercase">Análisis recientes</span>
        </div>
        {history.length === 0 ? (
          <p className="px-4 text-zinc-400 text-[12px] mt-1">Tus análisis aparecerán aquí.</p>
        ) : (
          history.map((item) => {
            const isActive = activeId === item.id
            const date = new Date(item.createdAt).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
            const itemScoreColor = scoreToColor(item.score)
            return (
              <div key={item.id}
                className={`group relative w-full flex items-center gap-3 px-3 py-3 mx-1 rounded-xl text-left transition-colors cursor-pointer ${
                  isActive ? 'bg-teal-50 border border-teal-200' : 'hover:bg-zinc-50'
                }`}
                onClick={() => handleHistoryClick(item)}>
                <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-[13px] font-black text-white"
                  style={{ backgroundColor: itemScoreColor }}>
                  {item.score}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] font-semibold truncate ${isActive ? 'text-teal-700' : 'text-zinc-700'}`}>
                    {item.hostname}
                  </div>
                  <div className="text-[11px] text-zinc-400">{date} · {item.label}</div>
                </div>
                {!item.result && (
                  <svg className="w-3 h-3 text-zinc-300 flex-shrink-0 group-hover:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"/>
                  </svg>
                )}
                <button
                  onClick={(e) => handleDeleteHistory(e, item.id)}
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 rounded-md text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Eliminar">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Auth + usage */}
      <div className="border-t border-zinc-100 flex-shrink-0">
        {authLoading ? (
          <div className="flex items-center justify-center py-4">
            <Spinner className="w-4 h-4 text-zinc-300"/>
          </div>
        ) : user ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full flex-shrink-0"/>
              ) : (
                <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                  {(user.displayName ?? user.email ?? 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-zinc-700 text-[13px] font-medium truncate">
                  {user.displayName ?? user.email}
                </div>
              </div>
              <button onClick={handleSignOut} title="Cerrar sesión" className="text-zinc-300 hover:text-zinc-500 flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>
            </div>
            <div className="px-4 py-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">Análisis este mes</span>
                <span className="text-[11px] font-bold text-zinc-500">{monthlyCount} / 3</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-1">
                <div className="bg-teal-500 h-1 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (monthlyCount / 3) * 100)}%` }}/>
              </div>
              <p className="text-[11px] text-zinc-400">
                {analysesLeft > 0 ? `${analysesLeft} análisis gratis restantes` : 'Límite mensual alcanzado'}
              </p>
              <a href="/#contacto"
                className="mt-1 w-full text-center py-1.5 border border-zinc-200 rounded-lg text-[12px] font-semibold text-zinc-500 hover:border-teal-400 hover:text-teal-600 transition-colors">
                Unlock full access
              </a>
            </div>
          </>
        ) : (
          <div className="px-4 py-4 flex flex-col gap-3">
            <p className="text-zinc-500 text-[12px]">Inicia sesión para guardar tu historial y analizar más páginas.</p>
            <button onClick={handleGoogleLogin} disabled={signingIn}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-zinc-200 rounded-xl text-[13px] font-semibold text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 transition-colors disabled:opacity-60 shadow-sm">
              {signingIn ? <Spinner className="w-4 h-4 text-zinc-400"/> : <GoogleIcon/>}
              {signingIn ? 'Entrando...' : 'Continuar con Google'}
            </button>
          </div>
        )}
      </div>
    </aside>
  )

  // ── Layout ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F2F3] print:block print:h-auto print:overflow-visible">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)}/>
      )}

      {sidebar}

      <main className="flex-1 min-w-0 overflow-y-auto flex flex-col print:block print:overflow-visible print:h-auto">

        {phase === 'done' && result ? (
          <AnalyzerReport
            result={result}
            onRelaunch={handleRelaunch}
            resultId={resultId ?? undefined}
            relaunchesLeft={analysesLeft}
            onRate={handleRate}
            onExpandSidebar={sidebarCollapsed ? () => setSidebarCollapsed(false) : undefined}
          />
        ) : (
          <>
            {/* Nav bar */}
            <div className="bg-white/70 backdrop-blur-md border-b border-zinc-200/60 px-5 py-3.5 flex items-center gap-3 flex-shrink-0 sticky top-0 z-10">
              <button onClick={() => sidebarCollapsed ? setSidebarCollapsed(false) : setSidebarOpen(true)}
                className="p-1 text-zinc-400 hover:text-zinc-600 lg:hidden">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
              {sidebarCollapsed && (
                <button onClick={() => setSidebarCollapsed(false)} className="hidden lg:flex p-1 text-zinc-400 hover:text-zinc-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                </button>
              )}
              <span className="text-[11px] font-mono font-semibold tracking-widest uppercase text-zinc-400">
                Landing Page Analyzer
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">

              {/* Loading shared */}
              {phase === 'loading_shared' && (
                <div className="flex flex-col items-center gap-4">
                  <Spinner className="w-8 h-8 text-teal-500"/>
                  <p className="text-zinc-500 text-sm font-mono">Cargando análisis compartido...</p>
                </div>
              )}

              {/* Auth gate */}
              {phase === 'auth_required' && (
                <div className="w-full max-w-md">
                  <div className="bg-white rounded-2xl border border-zinc-200 border-outer p-8 flex flex-col gap-6 items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center">
                      <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-zinc-900 tracking-tight mb-1">Inicia sesión para continuar</h2>
                      <p className="text-zinc-500 text-[14px] leading-relaxed">
                        Ya usaste tu análisis gratuito. Inicia sesión para analizar más páginas y guardar tu historial.
                      </p>
                    </div>
                    <button onClick={handleGoogleLogin} disabled={signingIn}
                      className="w-full flex items-center justify-center gap-2.5 px-5 py-3 bg-white border border-zinc-200 rounded-xl font-semibold text-[14px] text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 transition-colors shadow-sm disabled:opacity-60">
                      {signingIn ? <Spinner className="w-4 h-4 text-zinc-400"/> : <GoogleIcon/>}
                      {signingIn ? 'Entrando...' : 'Continuar con Google'}
                    </button>
                    <button onClick={() => setPhase('idle')} className="text-zinc-400 text-sm hover:text-zinc-600 transition-colors">
                      Volver
                    </button>
                  </div>
                </div>
              )}

              {/* Input form */}
              {(phase === 'idle' || phase === 'error') && (
                <div className="w-full max-w-2xl flex flex-col gap-6">
                  {/* Header */}
                  <div className="flex flex-col gap-2">
                    <span className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold tracking-widest uppercase text-zinc-400">
                      <span className="dot-teal"/>
                      {user ? 'Activo' : 'Beta — 1 análisis gratis'}
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 leading-[1.05]">
                      Analiza tu Landing<br/>
                      con MOLE <span className="text-gradient-teal">IA ENGINEERING</span>
                    </h1>
                    <p className="text-zinc-500 text-[15px] leading-relaxed max-w-lg mt-1">
                      Reporte de Optimización de Tasa de Conversión (CRO): Auditoría de
                      PageSpeed Insights, Diagnóstico de Core Web Vitals y Plan de Acción SEO Técnico.
                    </p>
                  </div>

                  {/* Input card */}
                  <div className="bg-white rounded-2xl border border-zinc-200 border-outer p-6 flex flex-col gap-4">
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-500/10 transition-all">
                        <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                        </svg>
                        <input
                          ref={inputRef}
                          type="text"
                          value={url}
                          onChange={e => setUrl(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && url.trim() && handleAnalyze()}
                          placeholder="tudominio.com o https://..."
                          className="flex-1 bg-transparent text-zinc-800 placeholder-zinc-400 text-[15px] outline-none font-mono"
                          autoFocus
                        />
                      </div>
                      <button onClick={handleAnalyze} disabled={!url.trim()}
                        className="btn-persimmon px-6 py-3 rounded-xl font-bold text-[14px] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
                        Analizar →
                      </button>
                    </div>

                    {phase === 'error' && error && (
                      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
                        <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span className="text-red-700 text-[13px]">{error}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <p className="text-zinc-400 text-[11px] font-mono">
                        20–40 seg · Solo dominios públicos · 1 por dominio/día
                      </p>
                      {!user && (
                        <button onClick={handleGoogleLogin} disabled={signingIn}
                          className="text-teal-600 text-[12px] font-semibold hover:text-teal-700 transition-colors">
                          Inicia sesión →
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Feature pills */}
                  <div className="flex flex-wrap gap-2">
                    {['8 dimensiones CRO', 'PageSpeed real', 'Auditoría de secciones', 'Ideas priorizadas', 'SEO técnico'].map(f => (
                      <span key={f} className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-zinc-500 text-[12px] font-medium shadow-sm">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading terminal */}
              {(['fetch', 'extract', 'ai', 'parse'] as Phase[]).includes(phase) && (
                <div className="w-full max-w-2xl flex flex-col gap-5">
                  <div>
                    <h2 className="text-zinc-900 font-black text-2xl tracking-tight">Analizando...</h2>
                    <p className="text-zinc-400 text-sm font-mono mt-0.5">{normalizeUrl(url)}</p>
                  </div>

                  {/* Steps card */}
                  <div className="bg-white rounded-2xl border border-zinc-200 border-outer overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-100 flex flex-col gap-3">
                      {STEPS.map(step => {
                        const si = phaseIndex(step.phase)
                        const ci = phaseIndex(phase)
                        const done   = ci > si
                        const active = ci === si
                        return (
                          <div key={step.phase as string} className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {done ? (
                                <div className="w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center">
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                                  </svg>
                                </div>
                              ) : active ? (
                                <Spinner className="w-4 h-4 text-teal-500"/>
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-zinc-200"/>
                              )}
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className={`text-[13px] font-medium ${
                                done ? 'text-zinc-400 line-through' : active ? 'text-zinc-800' : 'text-zinc-300'
                              }`}>
                                {step.label}
                              </span>
                              {active && <span className="text-zinc-400 text-[12px]">{step.detail}</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Terminal log */}
                    {logLines.length > 0 && (
                      <div className="bg-zinc-950 rounded-b-2xl">
                        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-zinc-800">
                          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700"/>
                          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700"/>
                          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700"/>
                          <span className="ml-2 text-zinc-600 text-[11px] font-mono">moleai-analyzer</span>
                        </div>
                        <div ref={terminalRef} className="px-5 py-4 max-h-44 overflow-y-auto">
                          {logLines.map((line, i) => (
                            <div key={i} className={`text-[11px] font-mono leading-relaxed ${
                              line.startsWith('✓') ? 'text-teal-400' :
                              line.startsWith('✗') ? 'text-red-400' :
                              line.startsWith('⚠') ? 'text-amber-400' :
                              line.startsWith('  ') ? 'text-zinc-600' :
                              'text-zinc-500'
                            }`}>{line}</div>
                          ))}
                          <span className="text-teal-400 text-[11px] font-mono animate-pulse">▋</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-zinc-400 text-[11px] font-mono text-center">
                    No cierres esta ventana mientras se procesa el análisis
                  </p>
                </div>
              )}

            </div>
          </>
        )}
      </main>
    </div>
  )
}
