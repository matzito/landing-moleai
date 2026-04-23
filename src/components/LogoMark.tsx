interface LogoMarkProps {
  size?: number
  className?: string
}

const ALL_TILES: [number, number][] = [
  [0, 0], [0, 1], [0, 2],
  [1, 0], [1, 1], [1, 2],
  [2, 0], [2, 1], [2, 2],
]

const ACTIVE = new Set<string>(['0-0', '0-2', '1-0', '1-1', '1-2', '2-0', '2-2'])

const PAD     = 5
const TILE    = 8
const GAP     = 3
const TILE_RX = 1.8
const VIEWBOX = 40

export default function LogoMark({ size = 28, className = '' }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      fill="none"
      className={className}
      aria-label="Mole Engineering logo"
    >
      <rect width={VIEWBOX} height={VIEWBOX} rx="9" fill="white" stroke="#e4e4e7" strokeWidth="0.9" />
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
