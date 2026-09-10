import React, { Component, ErrorInfo, ReactNode } from "react";
import { ArrowClockwise, WarningCircle } from "@phosphor-icons/react";
import { Button } from "./Button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled render error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="max-w-md w-full p-8 rounded-xl border border-slate-200 bg-white shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-700">
              <WarningCircle size={28} weight="bold" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                {this.props.fallbackTitle || "Unable to load this view"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                An unexpected interface state occurred. The session and inspection data remain preserved.
              </p>
            </div>
            {this.state.error?.message && (
              <div className="p-3 rounded bg-slate-50 border border-slate-150 text-left">
                <p className="font-mono text-2xs text-slate-600 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={this.handleReset}
                icon={<ArrowClockwise size={14} weight="bold" />}
                className="w-full text-xs"
              >
                Reload View
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
