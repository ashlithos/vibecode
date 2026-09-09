import { createContext, useContext, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, UnauthorizedError, type AuthUser } from './api';
import { SignIn } from './screens/SignIn';

/**
 * Gates the whole app on a session.
 *
 * A 401 is an expected state here, not an error — it means "show the sign-in
 * screen", so it must not be retried or surfaced as a failure.
 */
const AuthContext = createContext<AuthUser | null>(null);

export function useAuth(): AuthUser {
  const user = useContext(AuthContext);
  if (!user) throw new Error('useAuth used outside an authenticated tree');
  return user;
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return async () => {
    await api.logout();
    // Drop every cached query — otherwise the next account to sign in on this
    // device briefly sees the previous one's workouts.
    queryClient.clear();
    window.location.href = '/';
  };
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: api.me,
    retry: false,
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="screen">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (error) {
    const unauthorized = error instanceof UnauthorizedError;
    return (
      <SignIn
        configured={unauthorized ? error.signInConfigured : true}
        message={unauthorized ? undefined : (error as Error).message}
      />
    );
  }

  return <AuthContext.Provider value={data!.user}>{children}</AuthContext.Provider>;
}
