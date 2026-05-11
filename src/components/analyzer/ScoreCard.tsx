'use client'

import { ReactNode } from 'react'
import { SectionAnalysis } from '@/types/analyzer'

interface ScoreCardProps {
  title: string
  icon: ReactNode
  data: SectionAnalysis
  description?: string
}

function statusStyles(status: string) {
  switch (status) {
    case 'EXCELENTE':        return { dot: 'bg-green-500', text: 'text-green-600' }
    case 'BUENA':            return { dot: 'bg-amber-400', text: 'text-amber-500' }
    case 'REGULAR':          return { dot: 'bg-orange-400', text: 'text-orange-500' }
    case 'NECESITA TRABAJO': return { dot: 'bg-red-500',   text: 'text-red-600'   }
    default:                 return { dot: 'bg-gray-400',  text: 'text-gray-500'  }
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-amber-500'
  return 'text-red-500'
}

export default function ScoreCard({ title, icon, data, description }: ScoreCardProps) {
  const styles = statusStyles(data.status)

  const isPositive = data.score >= 70

  return (
    <div className="glass-card rounded-2xl flex flex-col">

      {/* Top: label + score + icon */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="group relative flex-1 min-w-0 pr-2">
            <p className="text-[12px] font-black tracking-widest uppercase cursor-default">{title}</p>
            {description && (
              <div className="pointer-events-none absolute left-0 top-full mt-1.5 z-50 w-56 rounded-xl bg-zinc-900 px-3 py-2.5 text-[11px] text-zinc-200 leading-relaxed shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {description}
                <div className="absolute -top-1 left-3 w-2 h-2 bg-zinc-900 rotate-45" />
              </div>
            )}
          </div>
          <div className="group relative w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-gray-700 -mt-0.5 cursor-default"
            style={{ backgroundColor: '#fafafa' }}>
            {icon}
            {description && (
              <div className="pointer-events-none absolute right-0 top-full mt-1.5 z-50 w-56 rounded-xl bg-zinc-900 px-3 py-2.5 text-[11px] text-zinc-200 leading-relaxed shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                {description}
                <div className="absolute -top-1 right-3 w-2 h-2 bg-zinc-900 rotate-45" />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-4xl font-black font-mono leading-none ${scoreColor(data.score)}`}>
            {data.score}
          </span>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${styles.dot}`} />
              <span className={`text-[11px] font-bold tracking-wide ${styles.text}`}>{data.status}</span>
            </div>
            <span className="text-[11px] text-gray-800">/ 100</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-100 mx-5" />

      {/* Points as rows */}
      <div className="flex flex-col divide-y divide-zinc-100">
        {(data.points ?? []).map((p, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-2">
            {isPositive ? (
              <svg className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
            ) : (
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
            )}
            <span className="text-[13px] text-gray-800 leading-snug">{p}</span>
          </div>
        ))}
      </div>

      {/* AI observation */}
      {data.observation && (
        <div className="mt-3 mx-5 mb-4 border-t border-zinc-300 pt-3">
          <p className="text-[13px] text-gray-600 leading-relaxed">{data.observation}</p>
        </div>
      )}

    </div>
  )
}
