"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Rendered instead of the failed subtree; null hides it silently (per-planet use). */
  fallback?: ReactNode;
  label?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render/runtime errors so one failed planet or panel cannot crash the
 * whole simulation. Used both around individual 3D objects (fallback null) and
 * around the full application shell (fallback message).
 */
export class SimulationErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error): void {
    console.error(`[solar-system-orbits] ${this.props.label ?? "component"} failed:`, error);
  }

  render(): ReactNode {
    if (this.state.error !== null) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }
      return (
        <div className="panel-section" role="alert">
          <strong>Something went wrong in {this.props.label ?? "this panel"}.</strong>
          <p className="disclosure">{this.state.error.message}</p>
          <button
            className="control-button"
            type="button"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
