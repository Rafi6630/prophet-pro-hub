import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error:    Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);

    // In production, forward to your error tracking service (e.g. Sentry)
    if (typeof window !== "undefined" && (window as any).__SENTRY__) {
      (window as any).__SENTRY__.captureException(error, { extra: info });
    }

    console.error("[ErrorBoundary] Caught:", error.message, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 px-4 py-12 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Something went wrong</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <p className="mt-2 rounded-lg bg-secondary/50 px-3 py-2 font-mono text-xs text-muted-foreground">
                {this.state.error.message}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={this.handleReset}
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
