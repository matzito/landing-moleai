'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

// ─── Layout constants ────────────────────────────────────────────────────────
const NH  = 42
const NS  = 51
const NY0 = 55
const NW  = 200
const NX_L = 10
const NX_R = 734

const nodeCY = (i: number): number => NY0 + i * NS + NH / 2

type HighlightColor = 'teal' | 'orange'

type IconType =
  | 'phone' | 'globe' | 'database' | 'zap' | 'salesforce' | 'buoy' | 'building'
  | 'layers' | 'bell' | 'lock' | 'hubspot' | 'layout' | 'chart' | 'webhook'

type NodeDef = {
  id: string
  label: string
  type: IconType
  hl?: HighlightColor
  connLabel?: string
}

const LEFT_NODES: NodeDef[] = [
  { id: 'app',  label: 'Proprietary Mobile/Web Apps', type: 'phone',    connLabel: 'HTTPS/2' },
  { id: 'ecom', label: 'E-commerce Infrastructure',   type: 'database'                       },
  { id: 'log',  label: 'Logistics Data Assets',       type: 'building', connLabel: 'REST'    },
  { id: 'hub',  label: 'Unified Communication Hubs',  type: 'globe'                          },
  { id: 'sf',   label: 'Salesforce Enterprise Core',  type: 'salesforce', hl: 'teal', connLabel: 'OAuth2' },
  { id: 'tkt',  label: 'Service Ticket Pipelines',    type: 'buoy'                           },
  { id: 'erp',  label: 'Enterprise Legacy / ERP',     type: 'zap',      connLabel: 'gRPC'   },
]

const RIGHT_NODES: NodeDef[] = [
  { id: 'msrv',  label: 'Scalable Microservices',   type: 'layers'                           },
  { id: 'notif', label: 'Push Notifications / SMS', type: 'bell',    connLabel: 'encrypted' },
  { id: 'gate',  label: 'Enterprise API Gateway',   type: 'lock',    connLabel: 'gRPC'      },
  { id: 'hs',    label: 'HubSpot Ecosystem',        type: 'hubspot', hl: 'orange', connLabel: 'OAuth2' },
  { id: 'dash',  label: 'Custom Admin Dashboard',   type: 'layout'                          },
  { id: 'bi',    label: 'BI & Analytics Reporting', type: 'chart'                           },
  { id: 'webh',  label: 'Secure Event Webhooks',    type: 'webhook', connLabel: 'mTLS'      },
]

// ─── SVG Icon Library ─────────────────────────────────────────────────────────
interface SvgIconProps {
  type: IconType
  cx: number
  cy: number
}

function SvgIcon({ type, cx, cy }: SvgIconProps) {
  const t = `translate(${cx - 8},${cy - 8})`
  const base = { fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: '1.35' }
  const dim  = { stroke: '#52525b', ...base }
  const teal = { stroke: '#14b8a6', ...base }
  const org  = { stroke: '#f97316', ...base }

  switch (type) {
    case 'phone': return (
      <g transform={t} {...dim}>
        <rect x="3" y="1" width="10" height="14" rx="2" />
        <line x1="7" y1="12.5" x2="9" y2="12.5" />
      </g>
    )
    case 'globe': return (
      <g transform={t} {...dim}>
        <circle cx="8" cy="8" r="7" />
        <path d="M1 8h14M8 1a7 7 0 0 0 0 14M8 1a7 7 0 0 1 0 14" />
      </g>
    )
    case 'database': return (
      <g transform={t} {...dim}>
        <ellipse cx="8" cy="3.5" rx="6" ry="2.5" />
        <path d="M2 3.5v9c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-9" />
        <path d="M2 8c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5" />
      </g>
    )
    case 'zap': return (
      <g transform={t} {...dim}>
        <polygon points="9.5 1 1.5 9 7.5 9 6.5 15 14.5 7 8.5 7 9.5 1" />
      </g>
    )
    case 'salesforce': return (
      <g transform={t} {...teal}>
        <path d="M5.5 12.5Q2.5 12.5 2.5 9.5Q2.5 7 5 7Q5 4.5 8 4.5Q11 4.5 11 7Q13 7 13 9.5Q13 12.5 10.5 12.5Z"/>
      </g>
    )
    case 'buoy': return (
      <g transform={t} {...dim}>
        <circle cx="8" cy="8" r="7" />
        <circle cx="8" cy="8" r="3" />
        <line x1="5.5" y1="5.5" x2="3" y2="3" />
        <line x1="10.5" y1="10.5" x2="13" y2="13" />
        <line x1="10.5" y1="5.5" x2="13" y2="3" />
        <line x1="5.5" y1="10.5" x2="3" y2="13" />
      </g>
    )
    case 'building': return (
      <g transform={t} {...dim}>
        <rect x="2" y="1" width="12" height="14" rx="1" />
        <line x1="5" y1="4" x2="6" y2="4" /><line x1="10" y1="4" x2="11" y2="4" />
        <line x1="5" y1="7" x2="6" y2="7" /><line x1="10" y1="7" x2="11" y2="7" />
        <line x1="5" y1="10" x2="6" y2="10" /><line x1="10" y1="10" x2="11" y2="10" />
      </g>
    )
    case 'layers': return (
      <g transform={t} {...dim}>
        <polygon points="8 1 1 4.5 8 8 15 4.5 8 1" />
        <path d="M1 8.5l7 3.5 7-3.5M1 12.5l7 3.5 7-3.5" />
      </g>
    )
    case 'bell': return (
      <g transform={t} {...dim}>
        <path d="M11 5a3 3 0 1 0-6 0v4l-2 2h10l-2-2V5Z" />
        <path d="M6.5 13a1.5 1.5 0 0 0 3 0" />
      </g>
    )
    case 'lock': return (
      <g transform={t} {...dim}>
        <rect x="2.5" y="7" width="11" height="8" rx="1.5" />
        <path d="M4.5 7V4a3.5 3.5 0 0 1 7 0v3" />
      </g>
    )
    case 'hubspot': return (
      <g transform={t} {...org}>
        <circle cx="8" cy="8" r="2.5" />
        <path d="M8 1v3M8 12v3M1 8h3M12 8h3" />
        <circle cx="12.5" cy="3.5" r="1.5" />
        <circle cx="3.5" cy="12.5" r="1.5" />
      </g>
    )
    case 'layout': return (
      <g transform={t} {...dim}>
        <rect x="1" y="1" width="14" height="14" rx="1.5" />
        <line x1="1" y1="5" x2="15" y2="5" />
        <line x1="5" y1="5" x2="5" y2="15" />
      </g>
    )
    case 'chart': return (
      <g transform={t} {...dim}>
        <line x1="2" y1="14" x2="2" y2="7" />
        <line x1="6" y1="14" x2="6" y2="2" />
        <line x1="10" y1="14" x2="10" y2="10" />
        <line x1="14" y1="14" x2="14" y2="5" />
      </g>
    )
    case 'webhook': return (
      <g transform={t} {...dim}>
        <path d="M10 2l4 4-4 4" />
        <path d="M14 6H6a3 3 0 0 0-3 3v5" />
      </g>
    )
    default: return null
  }
}

// ─── Main SVG Diagram ─────────────────────────────────────────────────────────
function ArchDiagram() {
  const [sel, setSel]         = useState<string | null>(null)
  const [hov, setHov]         = useState<string | null>(null)
  const [hovItem, setHovItem] = useState<number | null>(null)

  const toggle = (key: string) => setSel(p => p === key ? null : key)

  const busL  = 250
  const hubX  = 335
  const hubW  = 300
  const hubX2 = hubX + hubW
  const busR  = 710
  const busTop = nodeCY(0)
  const busBot = nodeCY(6)
  const midY   = (busTop + busBot) / 2

  return (
    <svg
      viewBox="0 0 960 452"
      className="w-full h-auto"
      role="img"
      aria-labelledby="arch-svg-title arch-svg-desc"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id="arch-svg-title">Mole AI Agent Orchestration Architecture</title>
      <desc id="arch-svg-desc">
        Diagram showing left-side integrations feeding into the Mole AI orchestration hub, which outputs to right-side services.
      </desc>

      <defs>
        <filter id="glow-teal" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#14b8a6" floodOpacity="0.55"/>
        </filter>
        <filter id="glow-orange" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f97316" floodOpacity="0.55"/>
        </filter>
        <filter id="glow-hub" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#14b8a6" floodOpacity="0.2"/>
        </filter>
        <linearGradient id="hub-header-bg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#0d9488"/>
          <stop offset="100%" stopColor="#0f766e"/>
        </linearGradient>
        <linearGradient id="hub-body-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#f8f9fa"/>
        </linearGradient>
        <marker id="arrow-teal" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0L7 3.5L0 7z" fill="#14b8a6" opacity="0.9"/>
        </marker>
        <marker id="arrow-purple" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0 0L7 3.5L0 7z" fill="#0369a1" opacity="0.7"/>
        </marker>
        <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".7" fill="#d4d4d8"/>
        </pattern>
      </defs>

      <rect width="960" height="452" rx="0" fill="#f8f9fa"/>
      <rect width="960" height="452" fill="url(#dots)" opacity="1"/>

      {/* Central data highway */}
      <line x1={busL} y1={midY} x2={busR} y2={midY} stroke="#14b8a6" strokeWidth="1.5" opacity="0.25" strokeDasharray="6 4"/>
      <rect x="441" y={midY - 10} width="78" height="13" rx="4" fill="#f0fdf9" stroke="#14b8a6" strokeWidth="0.75" opacity="0.9"/>
      <text x="480" y={midY - 0.5} textAnchor="middle" fontFamily="'JetBrains Mono', 'Courier New', monospace" fontSize="6.5" fontWeight="600" fill="#0d9488">
        protocol: gRPC · TLS 1.3
      </text>

      {/* Left vertical bus */}
      <line x1={busL} y1={busTop} x2={busL} y2={busBot} stroke="#0369a1" strokeWidth="1" strokeDasharray="3 2" opacity="0.5"/>
      <line x1={busL} y1={midY} x2={hubX - 6} y2={midY} stroke="#14b8a6" strokeWidth="1" opacity="0.9" markerEnd="url(#arrow-teal)"/>

      {/* Right vertical bus */}
      <line x1={busR} y1={busTop} x2={busR} y2={busBot} stroke="#0369a1" strokeWidth="1" strokeDasharray="3 2" opacity="0.5"/>
      <line x1={hubX2 + 2} y1={midY} x2={busR - 6} y2={midY} stroke="#14b8a6" strokeWidth="1" opacity="0.9" markerEnd="url(#arrow-teal)"/>

      {/* Left nodes */}
      {LEFT_NODES.map((node, i) => {
        const y       = NY0 + i * NS
        const cy      = y + NH / 2
        const isTeal  = node.hl === 'teal'
        const midX    = NX_L + NW + (busL - NX_L - NW) / 2
        const nodeKey = `L:${node.id}`
        const active  = sel === nodeKey
        const hovered = hov === nodeKey
        return (
          <g key={node.id} onClick={() => toggle(nodeKey)} style={{ cursor: 'pointer' }}>
            <line
              x1={NX_L + NW} y1={cy} x2={busL} y2={cy}
              stroke={active ? '#14b8a6' : '#0369a1'}
              strokeWidth={active ? 0.75 : 1}
              strokeDasharray={active ? undefined : '3 2'}
              opacity={active ? 1 : 0.5}
              style={{ transition: 'stroke 0.2s, opacity 0.2s, stroke-width 0.2s' }}
            />
            {node.connLabel && (
              <text x={midX} y={cy - 4} textAnchor="middle"
                fontFamily="'JetBrains Mono', 'Courier New', monospace"
                fontSize="6" fill={active ? '#0d9488' : isTeal ? '#0d9488' : '#0369a1'}>
                {node.connLabel}
              </text>
            )}
            <g
              onMouseEnter={() => setHov(nodeKey)}
              onMouseLeave={() => setHov(null)}
              style={{
                transform: hovered ? 'scale(1.04)' : 'scale(1)',
                transformBox: 'fill-box' as React.CSSProperties['transformBox'],
                transformOrigin: 'center',
                transition: 'transform 0.15s ease',
              }}
            >
              <rect
                x={NX_L} y={y} width={NW} height={NH} rx="7"
                fill={active ? (isTeal ? 'rgba(13,148,136,0.24)' : 'rgba(13,148,136,0.13)') : isTeal ? 'rgba(13,148,136,0.08)' : '#ffffff'}
                stroke={active || isTeal ? '#0d9488' : '#d4d4d8'}
                strokeWidth={active ? (isTeal ? 2.5 : 2) : isTeal ? 1.5 : 1}
                filter={(active || isTeal) ? 'url(#glow-teal)' : undefined}
                style={{ transition: 'fill 0.2s, stroke-width 0.2s' }}
              />
              <SvgIcon type={node.type} cx={NX_L + 22} cy={cy}/>
              <text
                x={NX_L + 40} y={cy + 4.5}
                fontFamily="Inter, system-ui, sans-serif"
                fontSize="9.5"
                fontWeight={active || isTeal ? '600' : '500'}
                fill={active ? '#0a6b62' : isTeal ? '#0d7a70' : '#52525b'}
              >
                {node.label}
              </text>
            </g>
          </g>
        )
      })}

      {/* Right nodes */}
      {RIGHT_NODES.map((node, i) => {
        const y       = NY0 + i * NS
        const cy      = y + NH / 2
        const isOrg   = node.hl === 'orange'
        const midX    = busR + (NX_R - busR) / 2
        const nodeKey = `R:${node.id}`
        const active  = sel === nodeKey
        const hovered = hov === nodeKey
        return (
          <g key={node.id} onClick={() => toggle(nodeKey)} style={{ cursor: 'pointer' }}>
            <line
              x1={busR} y1={cy} x2={NX_R} y2={cy}
              stroke={active ? (isOrg ? '#f97316' : '#14b8a6') : '#0369a1'}
              strokeWidth={active ? 0.75 : 1}
              strokeDasharray={active ? undefined : '3 2'}
              opacity={active ? 1 : 0.5}
              style={{ transition: 'stroke 0.2s, opacity 0.2s, stroke-width 0.2s' }}
            />
            {node.connLabel && (
              <text x={midX} y={cy - 4} textAnchor="middle"
                fontFamily="'JetBrains Mono', 'Courier New', monospace"
                fontSize="6" fill={active ? (isOrg ? '#f97316' : '#0d9488') : isOrg ? '#f97316' : '#0369a1'}>
                {node.connLabel}
              </text>
            )}
            <g
              onMouseEnter={() => setHov(nodeKey)}
              onMouseLeave={() => setHov(null)}
              style={{
                transform: hovered ? 'scale(1.04)' : 'scale(1)',
                transformBox: 'fill-box' as React.CSSProperties['transformBox'],
                transformOrigin: 'center',
                transition: 'transform 0.15s ease',
              }}
            >
              <rect
                x={NX_R} y={y} width={NW} height={NH} rx="7"
                fill={active ? (isOrg ? 'rgba(249,115,22,0.24)' : 'rgba(13,148,136,0.13)') : isOrg ? 'rgba(249,115,22,0.07)' : '#ffffff'}
                stroke={active ? (isOrg ? '#f97316' : '#0d9488') : isOrg ? '#f97316' : '#d4d4d8'}
                strokeWidth={active ? (isOrg ? 2.5 : 2) : isOrg ? 1.5 : 1}
                filter={(active || isOrg) ? `url(#glow-${isOrg ? 'orange' : 'teal'})` : undefined}
                style={{ transition: 'fill 0.2s, stroke-width 0.2s' }}
              />
              <SvgIcon type={node.type} cx={NX_R + 22} cy={cy}/>
              <text
                x={NX_R + 40} y={cy + 4.5}
                fontFamily="Inter, system-ui, sans-serif"
                fontSize="9.5"
                fontWeight={active || isOrg ? '600' : '500'}
                fill={active ? (isOrg ? '#9a3412' : '#0a6b62') : isOrg ? '#c2410c' : '#52525b'}
              >
                {node.label}
              </text>
            </g>
          </g>
        )
      })}

      {/* Central Hub */}
      {(() => {
        const hx = hubX
        const hy = 70
        const hw = hubW
        const hh = 266
        const headerH = 72
        const bodyY = hy + headerH

        type CheckItem = { icon: string; text: string }
        const checkItems: CheckItem[] = [
          { icon: '1', text: 'Coordina múltiples tareas a la vez'           },
          { icon: '2', text: 'Toma decisiones lógicas y resuelve problemas' },
          { icon: '3', text: 'Mueve información entre todos tus sistemas'   },
        ]
        const bodyH    = hh - headerH
        const itemStep = bodyH / (checkItems.length + 0.5)

        const hubActive  = sel === 'hub'
        const hubHovered = hov === 'hub'

        return (
          <g
            onClick={() => toggle('hub')}
            onMouseEnter={() => setHov('hub')}
            onMouseLeave={() => setHov(null)}
            style={{
              cursor: 'pointer',
              transform: hubHovered ? 'scale(1.018)' : 'scale(1)',
              transformBox: 'fill-box' as React.CSSProperties['transformBox'],
              transformOrigin: 'center',
              transition: 'transform 0.2s ease',
            }}
          >
            <g filter="url(#glow-hub)">
              {hubActive && (
                <rect x={hx - 6} y={hy - 6} width={hw + 12} height={hh + 12} rx="19"
                  fill="none" stroke="#14b8a6" strokeWidth="1.5" opacity="0.45" strokeDasharray="8 4"/>
              )}
              <rect x={hx} y={hy} width={hw} height={hh} rx="14" fill="url(#hub-body-bg)"/>
              <clipPath id="hub-header-clip">
                <rect x={hx} y={hy} width={hw} height={headerH + 20} rx="14"/>
              </clipPath>
              <rect x={hx} y={hy} width={hw} height={headerH} fill="url(#hub-header-bg)" clipPath="url(#hub-header-clip)"/>
              <line x1={hx} y1={hy + headerH} x2={hx + hw} y2={hy + headerH} stroke="#0d9488" strokeWidth="1" opacity="0.5"/>
              <rect x={hx} y={hy} width={hw} height={hh} rx="14" fill="none" stroke="#0d9488"
                strokeWidth={hubActive ? 2.5 : 1.5}
                opacity={hubActive ? 1 : 0.6}
                style={{ transition: 'stroke-width 0.2s, opacity 0.2s' }}
              />
              <text x={hx + 20} y={hy + 33} fontFamily="Inter, system-ui, sans-serif" fontSize="16" fontWeight="800" fill="white" letterSpacing="-0.3">
                Mole AI
              </text>
              <text x={hx + 20} y={hy + 50} fontFamily="Inter, system-ui, sans-serif" fontSize="9" fontWeight="400" fill="rgba(255,255,255,0.65)">
                El Cerebro de Operaciones Digitales
              </text>
              <rect x={hx + hw - 48} y={hy + 18} width="32" height="32" rx="8" fill="rgba(0,0,0,0.25)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
              <text x={hx + hw - 32} y={hy + 40} textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="13" fontWeight="900" fill="white" letterSpacing="-0.4">
                AI
              </text>

              {checkItems.map(({ icon, text }, idx) => {
                const iy      = bodyY + itemStep * (idx + 0.6)
                const ix      = hx + 30
                const itemHov = hovItem === idx
                const ic      = itemHov ? '#f97316' : '#14b8a6'
                const circleFill   = itemHov ? 'rgba(249,115,22,0.12)' : 'rgba(13,148,136,0.08)'
                const circleStroke = itemHov ? '#f97316' : '#0d9488'
                const textFill     = itemHov ? '#ea580c' : '#3f3f46'
                const textWeight   = itemHov ? '600' : '500'
                return (
                  <g
                    key={icon}
                    onMouseEnter={() => setHovItem(idx)}
                    onMouseLeave={() => setHovItem(null)}
                    style={{
                      transform: itemHov ? 'scale(1.04)' : 'scale(1)',
                      transformBox: 'fill-box' as React.CSSProperties['transformBox'],
                      transformOrigin: 'center',
                      transition: 'transform 0.15s ease',
                      cursor: 'default',
                    }}
                  >
                    <circle cx={ix} cy={iy} r="14"
                      fill={circleFill} stroke={circleStroke} strokeWidth="1" opacity="0.7"
                      style={{ transition: 'fill 0.2s, stroke 0.2s' }}
                    />
                    <text x={ix} y={iy + 4.5} textAnchor="middle"
                      fontFamily="'JetBrains Mono', 'Fira Code', monospace"
                      fontSize="9" fontWeight="700" fill={ic}
                      style={{ transition: 'fill 0.2s' }}
                    >
                      {icon}
                    </text>
                    <text x={hx + 56} y={iy + 5}
                      fontFamily="Inter, system-ui, sans-serif"
                      fontSize="9" fontWeight={textWeight} fill={textFill}
                      style={{ transition: 'fill 0.2s' }}
                    >
                      {text}
                    </text>
                    {idx < checkItems.length - 1 && (
                      <line x1={hx + 20} y1={iy + itemStep / 2} x2={hx + hw - 20} y2={iy + itemStep / 2} stroke="#e4e4e7" strokeWidth="1"/>
                    )}
                  </g>
                )
              })}
            </g>
          </g>
        )
      })()}
    </svg>
  )
}

// ─── Step card icons ──────────────────────────────────────────────────────────
function BlueprintIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" aria-hidden>
      <rect x="4" y="4" width="56" height="56" rx="8" fill="rgba(13,148,136,0.08)" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="4 2"/>
      <rect x="10" y="44" width="44" height="8" rx="2" stroke="#0d9488" strokeWidth="1.5"/>
      <line x1="16" y1="44" x2="16" y2="52" stroke="#0d9488" strokeWidth="1"/>
      <line x1="22" y1="44" x2="22" y2="49" stroke="#0d9488" strokeWidth="1"/>
      <line x1="28" y1="44" x2="28" y2="52" stroke="#0d9488" strokeWidth="1"/>
      <line x1="34" y1="44" x2="34" y2="49" stroke="#0d9488" strokeWidth="1"/>
      <line x1="40" y1="44" x2="40" y2="52" stroke="#0d9488" strokeWidth="1"/>
      <line x1="46" y1="44" x2="46" y2="49" stroke="#0d9488" strokeWidth="1"/>
      <circle cx="32" cy="24" r="8" stroke="#0d9488" strokeWidth="1.5"/>
      <circle cx="32" cy="24" r="3" stroke="#0d9488" strokeWidth="1.5"/>
      <line x1="32" y1="12" x2="32" y2="16" stroke="#0d9488" strokeWidth="2"/>
      <line x1="32" y1="32" x2="32" y2="36" stroke="#0d9488" strokeWidth="2"/>
      <line x1="20" y1="24" x2="24" y2="24" stroke="#0d9488" strokeWidth="2"/>
      <line x1="40" y1="24" x2="44" y2="24" stroke="#0d9488" strokeWidth="2"/>
      <path d="M44 10l4 4-16 16h-4v-4Z" stroke="#0d9488" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M16 12v6c0 3 2 5 4 6 2-1 4-3 4-6v-6l-4-2Z" stroke="#0d9488" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

function OrchestrationIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" aria-hidden>
      <rect x="4" y="4" width="56" height="56" rx="8" fill="rgba(13,148,136,0.08)" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="4 2"/>
      <circle cx="20" cy="26" r="8" stroke="#0d9488" strokeWidth="1.5"/>
      <circle cx="20" cy="26" r="3" fill="rgba(13,148,136,0.2)" stroke="#0d9488" strokeWidth="1"/>
      <line x1="20" y1="14" x2="20" y2="18" stroke="#0d9488" strokeWidth="2"/>
      <line x1="20" y1="34" x2="20" y2="38" stroke="#0d9488" strokeWidth="2"/>
      <line x1="8"  y1="26" x2="12" y2="26" stroke="#0d9488" strokeWidth="2"/>
      <line x1="28" y1="26" x2="32" y2="26" stroke="#0d9488" strokeWidth="2"/>
      <circle cx="44" cy="38" r="8" stroke="#0d9488" strokeWidth="1.5"/>
      <circle cx="44" cy="38" r="3" fill="rgba(13,148,136,0.2)" stroke="#0d9488" strokeWidth="1"/>
      <line x1="44" y1="26" x2="44" y2="30" stroke="#0d9488" strokeWidth="2"/>
      <line x1="44" y1="46" x2="44" y2="50" stroke="#0d9488" strokeWidth="2"/>
      <line x1="32" y1="38" x2="36" y2="38" stroke="#0d9488" strokeWidth="2"/>
      <line x1="52" y1="38" x2="56" y2="38" stroke="#0d9488" strokeWidth="2"/>
      <path d="M28 28Q36 28 36 36" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="3 2"/>
      <path d="M34 34l2 2 2-2" stroke="#0d9488" strokeWidth="1.5"/>
      <path d="M32 12l4 4-4 4-4-4Z" stroke="#0d9488" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

function DeployIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none" aria-hidden>
      <rect x="4" y="4" width="56" height="56" rx="8" fill="rgba(13,148,136,0.08)" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="4 2"/>
      <rect x="8"  y="10" width="28" height="8" rx="2" stroke="#0d9488" strokeWidth="1.5"/>
      <rect x="8"  y="21" width="28" height="8" rx="2" stroke="#0d9488" strokeWidth="1.5"/>
      <rect x="8"  y="32" width="28" height="8" rx="2" stroke="#0d9488" strokeWidth="1.5"/>
      <circle cx="32" cy="14" r="1.5" fill="#0d9488"/>
      <circle cx="32" cy="25" r="1.5" fill="#0d9488"/>
      <circle cx="32" cy="36" r="1.5" fill="#0d9488"/>
      <rect x="40" y="26" width="18" height="14" rx="2" stroke="#0d9488" strokeWidth="1.5"/>
      <polyline points="42,36 46,30 50,34 54,28 56,32" stroke="#0d9488" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="48" cy="14" r="5" stroke="#0d9488" strokeWidth="1.5"/>
      <line x1="52" y1="18" x2="56" y2="22" stroke="#0d9488" strokeWidth="2" strokeLinecap="round"/>
      <rect x="8" y="44" width="18" height="14" rx="2" stroke="#0d9488" strokeWidth="1.5"/>
      <line x1="8" y1="50" x2="26" y2="50" stroke="#0d9488" strokeWidth="1" opacity="0.5"/>
      <path d="M11 54l2 2 5-5" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Step card component ──────────────────────────────────────────────────────
interface StepCardProps {
  number: string
  title: string
  description: string
  Icon: React.ComponentType
  index: number
  inView: boolean
}

function StepCard({ number, title, description, Icon, index, inView }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="card-hover flex flex-col gap-5 p-6 rounded-xl border border-zinc-200 bg-white shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <Icon/>
        <span
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-[11px] font-black font-mono text-[#14b8a6] border border-[#0d9488]/40"
          style={{ backgroundColor: 'rgba(13,148,136,0.08)' }}
        >
          {number}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[15px] font-bold text-zinc-800 tracking-tight">{title}</h3>
        <p className="text-[13px] text-zinc-500 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────
export default function ArchitectureSection() {
  const diagramRef    = useRef<HTMLDivElement>(null)
  const diagramInView = useInView(diagramRef, { once: true, margin: '-40px' })

  return (
    <section id="architecture" className="py-28 px-6 border-b border-zinc-200">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-mono font-semibold tracking-widest uppercase text-zinc-400">
            Ecosystem Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 leading-tight">
            Integraciones nativas,{' '}
            <span className="text-gradient-teal">orquestación determinista.</span>
          </h2>
        </div>

        <motion.div
          ref={diagramRef}
          initial={{ opacity: 0, y: 24 }}
          animate={diagramInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-zinc-200 overflow-hidden bg-white shadow-sm"
          role="region"
          aria-label="Agent architecture diagram"
        >
          {/* Diagram header bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 bg-zinc-50 gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]"/>
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"/>
              <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]"/>
              <span className="text-[11px] font-mono text-zinc-400 ml-1">architecture.live</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono">
              <span className="text-zinc-400">env:</span>
              <span className="text-teal-600 font-semibold">production</span>
              <span className="text-zinc-300">·</span>
              <span className="px-1.5 py-0.5 rounded border border-zinc-200 text-zinc-500 bg-white">v2.1.0-stable</span>
              <span className="text-zinc-300">·</span>
              <span className="text-zinc-400">latency: <span className="text-teal-600 font-semibold">42ms</span></span>
              <span className="text-zinc-300">·</span>
              <span className="text-zinc-400">region: <span className="text-zinc-600">Azure-West-US</span></span>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="dot-teal"/>
                <span className="text-[10px] font-mono text-zinc-500">live</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400">
                <span>inputs: <span className="text-zinc-600">7</span></span>
                <span>outputs: <span className="text-zinc-600">7</span></span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[700px] p-2">
              <ArchDiagram/>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-5 px-5 py-3 border-t border-zinc-100 bg-zinc-50">
            {[
              { color: '#0369a1', dash: true,  label: 'Data connections'          },
              { color: '#14b8a6', dash: false, label: 'Orchestration flow'         },
              { color: '#14b8a6', dash: false, label: 'Highlighted integration'    },
              { color: '#f97316', dash: false, label: 'Highlighted output'         },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <svg width="24" height="8">
                  <line x1="0" y1="4" x2="24" y2="4" stroke={item.color} strokeWidth="2" strokeDasharray={item.dash ? '3 2' : undefined}/>
                </svg>
                <span className="text-[10px] font-mono text-zinc-600">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  )
}
