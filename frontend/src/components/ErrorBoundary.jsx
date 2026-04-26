import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          borderRadius: '12px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          margin: '20px'
        }}>
          <h2 style={{ color: '#dc2626', marginBottom: '12px' }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            The application encountered an error. Please try refreshing the page.
          </p>
          <details style={{ 
            textAlign: 'left', 
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            marginTop: '16px'
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: '600' }}>Error details</summary>
            <pre style={{ 
              marginTop: '8px', 
              padding: '12px', 
              background: 'rgba(0, 0, 0, 0.05)',
              borderRadius: '6px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {this.state.error && this.state.error.toString()}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 24px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
