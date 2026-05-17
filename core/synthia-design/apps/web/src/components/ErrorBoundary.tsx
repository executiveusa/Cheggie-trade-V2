'use client'

import { Component, type ReactNode, type ComponentType } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid rgba(232,112,112,0.25)',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'var(--font-body)',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: '1.25rem',
            color: '#e87070',
            marginBottom: '0.75rem',
          }}>
            Algo salió mal
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--color-muted)',
            background: 'var(--color-dark)',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            marginBottom: '1.25rem',
            wordBreak: 'break-all',
            textAlign: 'left',
          }}>
            {this.state.error.message}
          </div>
          <button
            onClick={this.reset}
            style={{
              padding: '0.625rem 1.5rem',
              background: 'var(--color-primary)',
              color: 'var(--color-dark)',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>
): ComponentType<P> {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component'
  function WithBoundary(props: P) {
    return (
      <ErrorBoundary>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    )
  }
  WithBoundary.displayName = `withErrorBoundary(${displayName})`
  return WithBoundary
}
