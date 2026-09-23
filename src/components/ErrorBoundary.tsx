'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error('MTShoots Caught UI Exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[500px] flex items-center justify-center p-6 bg-[#FAF8F5]">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E7E1DA] shadow-xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#FFF5F2] border border-[#F3C4B3] flex items-center justify-center mx-auto text-[#C85A32]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-[#181615]">
                Something Went Wrong
              </h2>
              <p className="text-sm text-[#70564d] leading-relaxed">
                We encountered an unexpected display issue while rendering this section. Our database and media systems remain operational.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#C85A32] text-white text-xs font-semibold hover:bg-[#B24E2A] transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" /> Reload Page
              </button>
              <a
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#F4EFEA] text-[#181615] text-xs font-semibold hover:bg-[#EBE3DC] transition-colors border border-[#E7E1DA]"
              >
                <Home className="w-4 h-4" /> Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
