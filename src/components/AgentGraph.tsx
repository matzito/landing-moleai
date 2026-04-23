'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

type NodeType = 'core' | 'agent' | 'system' | 'infra'

type GraphNode = {
  id: string
  x: number
  y: number
  label: string
  type: NodeType
  color: string
}

type Edge = [string, string]

type Size = {
  w: number
  h: number
}

const NODES: GraphNode[] = [
  { id: 'orchestrator', x: 50, y: 50, label: 'Orchestrator', type: 'core',   color: '#06b6d4' },
  { id: 'planner',      x: 22, y: 22, label: 'Planner',      type: 'agent',  color: '#818cf8' },
  { id: 'executor',     x: 78, y: 22, label: 'Executor',     type: 'agent',  color: '#818cf8' },
  { id: 'memory',       x: 15, y: 65, label: 'Memory',       type: 'system', color: '#34d399' },
  { id: 'retrieval',    x: 85, y: 65, label: 'Retrieval',    type: 'system', color: '#34d399' },
  { id: 'tools',        x: 50, y: 82, label: 'Tool Layer',   type: 'infra',  color: '#f59e0b' },
  { id: 'llm',          x: 30, y: 40, label: 'LLM Core',     type: 'core',   color: '#06b6d4' },
  { id: 'router',       x: 70, y: 40, label: 'Router',       type: 'agent',  color: '#818cf8' },
]

const EDGES: Edge[] = [
  ['orchestrator', 'planner'],
  ['orchestrator', 'executor'],
  ['orchestrator', 'llm'],
  ['orchestrator', 'router'],
  ['planner', 'memory'],
  ['executor', 'tools'],
  ['router', 'retrieval'],
  ['llm', 'memory'],
  ['retrieval', 'tools'],
  ['memory', 'tools'],
]

function nodePosition(node: GraphNode, w: number, h: number): { x: number; y: number } {
  return { x: (node.x / 100) * w, y: (node.y / 100) * h }
}

export default function AgentGraph() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState<Size>({ w: 600, h: 400 })
  const [activeEdge, setActiveEdge] = useState<number>(0)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  useEffect(() => {
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ w: width, h: height })
    })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveEdge(prev => (prev + 1) % EDGES.length)
    }, 900)
    return () => clearInterval(interval)
  }, [])

  const { w, h } = size

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[320px]">
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        className="absolute inset-0"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#06b6d4" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"    />
          </radialGradient>
          <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-strong" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="rgba(6,182,212,0.4)" />
          </marker>
          <marker id="arrowhead-active" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#06b6d4" />
          </marker>
        </defs>

        <ellipse cx={w * 0.5} cy={h * 0.5} rx={w * 0.45} ry={h * 0.45} fill="url(#bg-glow)" />

        {EDGES.map(([fromId, toId], i) => {
          const from = NODES.find(n => n.id === fromId)
          const to   = NODES.find(n => n.id === toId)
          if (!from || !to) return null
          const fp = nodePosition(from, w, h)
          const tp = nodePosition(to, w, h)
          const isActive = i === activeEdge
          return (
            <g key={`${fromId}-${toId}`}>
              <line x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
              {isActive && (
                <motion.line
                  x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
                  stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4 3"
                  markerEnd="url(#arrowhead-active)" filter="url(#glow-filter)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
                />
              )}
            </g>
          )
        })}

        {NODES.map(node => {
          const pos       = nodePosition(node, w, h)
          const isHovered = hoveredNode === node.id
          const isCoreNode = node.type === 'core'
          const r = isCoreNode ? 22 : 16
          return (
            <motion.g
              key={node.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              style={{ cursor: 'pointer' }}
              onHoverStart={() => setHoveredNode(node.id)}
              onHoverEnd={() => setHoveredNode(null)}
              whileHover={{ scale: 1.15 }}
            >
              {isCoreNode && (
                <motion.circle
                  r={r + 8} fill="none" stroke={node.color} strokeWidth={0.5}
                  initial={{ scale: 0.8, opacity: 0.6 }}
                  animate={{ scale: [0.8, 1.6], opacity: [0.5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                />
              )}
              <circle r={r + 4} fill={node.color} opacity={isHovered ? 0.12 : 0.04} filter="url(#glow-filter)" />
              <circle r={r} fill="rgba(5,5,5,0.9)" stroke={node.color} strokeWidth={isHovered ? 1.5 : 1} filter={isHovered ? 'url(#glow-strong)' : undefined} />
              <circle r={3} fill={node.color} opacity={0.9} />
              <text
                y={r + 14} textAnchor="middle"
                fill={isHovered ? node.color : 'rgba(148,163,184,0.8)'}
                fontSize={w < 400 ? '7' : '9'}
                fontFamily="'JetBrains Mono', monospace"
                fontWeight="500" letterSpacing="0.5"
              >
                {node.label}
              </text>
            </motion.g>
          )
        })}
      </svg>

      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 px-2 py-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-slate-500 font-mono">
          agent.status: <span className="text-emerald-400">RUNNING</span> · nodes: {NODES.length} · edges: {EDGES.length}
        </span>
      </div>
    </div>
  )
}
