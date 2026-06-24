interface LoadingSpinnerProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
}

export default function LoadingSpinner({ message = 'Loading...', size = 'medium' }: LoadingSpinnerProps) {
  const sizeMap = {
    small: { width: '24px', height: '24px' },
    medium: { width: '48px', height: '48px' },
    large: { width: '64px', height: '64px' },
  }

  const sizeStyle = sizeMap[size]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '32px 0' }}>
      <div style={{ position: 'relative', ...sizeStyle }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid var(--border)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: 'var(--accent)',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
      {message && (
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
          {message}
        </p>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
