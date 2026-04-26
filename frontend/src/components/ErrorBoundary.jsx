import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[KnowIt ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-base flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14
                          rounded-2xl bg-red-900/20 border border-red-700/30
                          mb-5 mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#f87171" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>

          <h2 className="font-display font-bold text-lg text-tx-1 mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-tx-2 mb-1">
            An unexpected error occurred in the dashboard.
          </p>
          {this.state.error && (
            <p className="font-mono text-xs text-tx-3 mb-6 px-4 py-2
                           bg-raised border border-bd-sub rounded-lg">
              {this.state.error.message}
            </p>
          )}

          <div className="flex gap-3 justify-center">
            <button
              className="btn-primary px-6 py-2.5 text-sm"
              onClick={() => this.setState({ hasError: false, error: null })}>
              Try Again
            </button>
            <button
              className="btn-ghost px-6 py-2.5 text-sm"
              onClick={() => window.location.href = "/dashboard"}>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
}
