/**
 * 3×3 grid logo forming an "M" shape.
 *
 * Grid math (viewBox 40×40):
 *   padding = 5  |  tileSize = 8  |  gap = 3
 *   col x: 0→5  1→16  2→27
 *   row y: 0→5  1→16  2→27
 *
 * M pattern  (■ = filled, · = inactive):
 *   ■ · ■
 *   ■ ■ ■
 *   ■ · ■
 */

const ALL_TILES = [
  [0, 0], [0, 1], [0, 2],
  [1, 0], [1, 1], [1, 2],
  [2, 0], [2, 1], [2, 2],
]

const ACTIVE = new Set(['0-0', '0-2', '1-0', '1-1', '1-2', '2-0', '2-2'])

const PAD     = 5
const TILE    = 8
const GAP     = 3
const TILE_RX = 1.8
const VIEWBOX = 40

export default function LogoMark({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      fill="none"
      className={className}
      aria-label="Mole Engineering logo"
    >
      {/* Squircle background */}
      <rect
        width={VIEWBOX}
        height={VIEWBOX}
        rx="9"
        fill="white"
        stroke="#e4e4e7"
        strokeWidth="0.9"
      />

      {/* All 9 tiles — active teal, inactive muted */}
      {ALL_TILES.map(([row, col]) => {
        const key    = `${row}-${col}`
        const active = ACTIVE.has(key)
        const x = PAD + col * (TILE + GAP)
        const y = PAD + row * (TILE + GAP)
        return (
          <rect
            key={key}
            x={x}
            y={y}
            width={TILE}
            height={TILE}
            rx={TILE_RX}
            fill={active ? '#0d9488' : '#e2f4f2'}
          />
        )
      })}
    </svg>
  )
}
