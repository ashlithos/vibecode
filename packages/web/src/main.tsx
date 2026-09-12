import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UnauthorizedError } from './api';
import { App } from './App';
import { AuthGate } from './AuthGate';
import './styles.css';

const queryClient = new QueryClient({
  // A session can expire mid-workout. Rather than every screen growing its own
  // 401 branch, one handler invalidates the auth query, which re-runs AuthGate
  // and lands the user back on the sign-in screen.
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (!(error instanceof UnauthorizedError)) return;

      // The auth query 401s by design when signed out. Invalidating it from
      // its own error handler refetches, 401s, and invalidates again — an
      // infinite request loop. Only *other* queries trigger the re-check.
      if (query.queryKey[0] === 'auth') return;

      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  }),
  defaultOptions: {
    queries: {
      // Gym wifi is unreliable and refetching on every window focus mid-set is
      // noise, not freshness.
      refetchOnWindowFocus: false,
      // Never retry a 401 — it is a state, not a transient failure.
      retry: (count, error) => !(error instanceof UnauthorizedError) && count < 1,
      staleTime: 15_000,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthGate>
          <App />
        </AuthGate>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
