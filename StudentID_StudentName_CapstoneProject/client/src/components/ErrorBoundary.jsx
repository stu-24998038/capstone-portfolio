import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-paper px-6">
          <div className="max-w-md text-center">
            <p className="eyebrow">Something broke</p>
            <h1 className="mt-4 font-display text-4xl font-light tracking-[-0.03em]">
              The page hit an unexpected snag.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Reload the page to get back to the portfolio. If it keeps happening, the API may
              be unavailable.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-primary mt-6"
            >
              Reload the page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
