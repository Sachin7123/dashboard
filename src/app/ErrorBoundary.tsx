import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void error;
    void info;
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh items-center justify-center bg-obsidian-bg px-4 text-text-primary">
          <div className="glass-panel max-w-lg p-8 text-center">
            <div className="text-[11px] uppercase tracking-[0.3em] text-text-muted">
              Platform Error
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-white">
              ReMorph ran into an unexpected issue.
            </h1>
            <p className="mt-4 text-sm leading-7 text-text-muted">
              Refresh the page to restart the application shell.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
