/**
 * Sign-in screen.
 *
 * Also the place OAuth failures land: the callback redirects to /?auth_error=…
 * rather than rendering a raw error, so a rejected sign-in reads as a sentence
 * instead of a stack trace.
 */
const AUTH_ERRORS: Record<string, string> = {
  not_allowed:
    "That Google account isn't on the access list. Ask the owner to add your email, or sign in with a different account.",
  unverified:
    "That Google account's email address isn't verified, so it can't be used to sign in.",
  no_email: "Google didn't return an email address for that account.",
  exchange: 'Sign-in with Google failed part way through. Please try again.',
};

export function SignIn({
  configured,
  message,
}: {
  configured: boolean;
  message?: string;
}) {
  const params = new URLSearchParams(window.location.search);
  const authError = params.get('auth_error');
  const errorText = message ?? (authError ? (AUTH_ERRORS[authError] ?? AUTH_ERRORS.exchange) : null);

  return (
    <div className="signin">
      <div className="signin-card">
        <div className="signin-mark" aria-hidden="true">
          ▪▪
        </div>
        <h1>Gym Copilot</h1>
        <p className="muted" style={{ margin: '0 0 22px' }}>
          Your workout plan, your history, and what to do next — without having to
          remember any of it.
        </p>

        {errorText && (
          <div className="banner error" style={{ marginBottom: 16, textAlign: 'left' }}>
            {errorText}
          </div>
        )}

        {configured ? (
          <a className="btn" href="/api/auth/google">
            <GoogleMark />
            Continue with Google
          </a>
        ) : (
          <div className="banner" style={{ textAlign: 'left' }}>
            Google sign-in isn't configured on this deployment yet.
            <code style={{ display: 'block', marginTop: 8, fontSize: 12.5 }}>
              GOOGLE_CLIENT_ID · GOOGLE_CLIENT_SECRET · AUTH_SECRET
            </code>
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
