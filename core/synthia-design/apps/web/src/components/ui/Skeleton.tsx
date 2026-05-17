'use client'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  style?: React.CSSProperties
}

export function Skeleton({ width = '100%', height = '1rem', borderRadius = '4px', style }: SkeletonProps) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: 'var(--color-surface)',
      backgroundImage: 'linear-gradient(90deg, var(--color-surface) 0%, var(--color-border) 50%, var(--color-surface) 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  )
}

export function GenerationCardSkeleton() {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <Skeleton height="200px" borderRadius="0" />
      <div style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Skeleton height="0.875rem" width="60%" />
        <Skeleton height="0.75rem" width="80%" />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
          <Skeleton height="1.75rem" width="48%" borderRadius="6px" />
          <Skeleton height="1.75rem" width="48%" borderRadius="6px" />
        </div>
      </div>
    </div>
  )
}

export function PortfolioGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div style={{
      columns: '3 280px',
      gap: '1rem',
    }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ breakInside: 'avoid', marginBottom: '1rem' }}>
          <Skeleton
            height={`${180 + (i % 3) * 60}px`}
            borderRadius="10px"
          />
        </div>
      ))}
    </div>
  )
}
