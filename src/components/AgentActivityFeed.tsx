'use client'

import { motion } from 'framer-motion'

const FEED = [
  {
    name: 'Planner',
    initials: 'PL',
    color: '#0d9488',
    action: 'started a new execution plan',
    time: 'now',
    live: true,
    badge: { text: '⚡ Planning', fg: '#2dd4bf', bg: 'rgba(13,148,136,0.18)', border: 'rgba(13,148,136,0.45)' },
  },
  {
    name: 'Executor',
    initials: 'EX',
    color: '#0891b2',
    action: 'called tool',
    time: '3s',
    badge: { text: '▶ web_search', fg: '#38bdf8', bg: 'rgba(8,145,178,0.18)', border: 'rgba(8,145,178,0.45)' },
  },
  {
    name: 'Validator',
    initials: 'VA',
    color: '#6366f1',
    action: 'set output status to',
    time: '8s',
    badge: { text: '✓ Passed', fg: '#4ade80', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.38)' },
  },
  {
    name: 'Response',
    initials: 'RE',
    color: '#8b5cf6',
    action: 'posted result in',
    time: '14s',
    badge: { text: '#output', fg: '#a78bfa', bg: 'rgba(139,92,246,0.18)', border: 'rgba(139,92,246,0.45)' },
    preview: 'Task completed. 14 results retrieved from API. Confidence score: 0.94. Ready for downstream processing.',
  },
  {
    name: 'Data Source',
    initials: 'DS',
    color: '#f97316',
    action: 'ingested 1,247 new records',
    time: '1m',
  },
  {
    name: 'Planner',
    initials: 'PL',
    color: '#0d9488',
    action: 'joined the pipeline',
    time: '2m',
  },
]

export default function AgentActivityFeed() {
  return (
    <div
      style={{
        height: 290,
        overflowY: 'auto',
        background: '#202020',
        scrollbarWidth: 'none',
      }}
    >
      {FEED.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3, ease: 'easeOut' }}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '10px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: `${item.color}22`,
              border: `1.5px solid ${item.color}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'ui-monospace, monospace',
              fontSize: 9,
              fontWeight: 700,
              color: item.color,
              letterSpacing: '0.05em',
            }}>
              {item.initials}
            </div>
            {item.live && (
              <motion.div
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#22c55e',
                  border: '1.5px solid #202020',
                }}
              />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginBottom: 2 }}>
              <span style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 11,
                fontWeight: 700,
                color: '#e2e8f0',
                whiteSpace: 'nowrap',
              }}>
                {item.name}
              </span>
              <span style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: 10,
                color: '#64748b',
              }}>
                {item.action}
              </span>
              {item.badge && (
                <span style={{
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 9,
                  fontWeight: 600,
                  color: item.badge.fg,
                  background: item.badge.bg,
                  border: `1px solid ${item.badge.border}`,
                  borderRadius: 4,
                  padding: '1px 6px',
                  whiteSpace: 'nowrap',
                }}>
                  {item.badge.text}
                </span>
              )}
            </div>

            {item.preview && (
              <div style={{
                marginTop: 6,
                padding: '7px 10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 6,
                fontFamily: 'ui-monospace, monospace',
                fontSize: 9.5,
                color: '#94a3b8',
                lineHeight: 1.55,
              }}>
                {item.preview}
              </div>
            )}
          </div>

          <span style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 9,
            color: '#475569',
            flexShrink: 0,
            paddingTop: 2,
          }}>
            {item.time}
          </span>
        </motion.div>
      ))}
    </div>
  )
}