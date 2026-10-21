import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Component, Suspense, type ReactNode } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

interface BoundaryProps {
  children: ReactNode;
}

interface BoundaryState {
  message: string | null;
}

class ApiBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { message: null };

  static getDerivedStateFromError(error: unknown): BoundaryState {
    return { message: error instanceof Error ? error.message : "The API request failed." };
  }

  render() {
    if (this.state.message) {
      return (
        <main className="grid min-h-svh place-items-center bg-ink px-6 text-paper">
          <div className="max-w-md">
            <h1 className="font-display text-4xl">API unavailable</h1>
            <p className="mt-3 text-muted">{this.state.message}</p>
            <p className="mt-3 text-sm text-muted">Start the API on port 3000, then reload this page.</p>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ApiBoundary>
        <Suspense
          fallback={
            <main className="grid min-h-svh place-items-center bg-ink text-muted">Loading the service graph…</main>
          }
        >
          {children}
        </Suspense>
      </ApiBoundary>
    </QueryClientProvider>
  );
}
