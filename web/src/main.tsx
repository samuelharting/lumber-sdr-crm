import './style.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ color: '#b91c1c', marginBottom: '1rem' }}>Something went wrong</h1>
          <pre style={{ background: '#fef2f2', padding: '1rem', overflow: 'auto', fontSize: '14px' }}>
            {this.state.error.message}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

const root = document.getElementById('app')
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  )
}
