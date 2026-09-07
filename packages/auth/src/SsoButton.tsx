'use client';

export interface SsoButtonProps {
  /** Public OAuth client id. Absent means the button does not render at all. */
  clientId?: string;
  /** Where the provider sends the browser back to. */
  redirectUri: string;
  /** Overridden in tests; defaults to a real navigation. */
  navigate?: (url: string) => void;
}

const GOOGLE_AUTHORIZE = 'https://accounts.google.com/o/oauth2/v2/auth';

/** Builds the provider's authorize URL. Exported so a test can read it. */
export function googleAuthorizeUrl(clientId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    /* Only what the API maps onto a profile: subject, email, name. */
    scope: 'openid email profile',
    state,
    /* Ask for an account each time rather than silently reusing whichever
       Google session the browser happens to hold. */
    prompt: 'select_account',
  });

  return `${GOOGLE_AUTHORIZE}?${params.toString()}`;
}

/**
 * Starts a Google sign-in.
 *
 * Renders nothing when no client id is configured. A visible button that
 * cannot work is worse than an absent one — the visitor cannot tell the
 * difference between "misconfigured" and "my account is broken".
 *
 * The `state` value is stored before leaving and must be compared on return;
 * without that check the callback would accept a code obtained elsewhere,
 * which is CSRF against the sign-in itself.
 */
export function SsoButton({ clientId, redirectUri, navigate }: SsoButtonProps) {
  if (!clientId) return null;

  function start() {
    const state = crypto.randomUUID();

    try {
      sessionStorage.setItem('rakuxon.sso.state', state);
    } catch {
      /* Storage blocked. The redirect still works; the callback will refuse
         because it cannot match the state, which is the safe direction. */
    }

    const url = googleAuthorizeUrl(clientId as string, redirectUri, state);
    if (navigate) navigate(url);
    else window.location.assign(url);
  }

  return (
    <button
      type="button"
      onClick={start}
      className="inline-flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-md border border-border bg-surface px-6 py-4 text-base font-semibold text-text transition-colors duration-fast ease-standard hover:bg-accent-soft focus-visible:outline-none focus-visible:ring focus-visible:ring-offset-2 motion-reduce:transition-none"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M12 11v3.2h5.3a4.6 4.6 0 0 1-1.98 3l3.2 2.48A9.7 9.7 0 0 0 21.6 12c0-.7-.06-1.36-.18-2Z"
        />
        <path
          fill="currentColor"
          d="M12 21.6c2.7 0 4.96-.9 6.6-2.42l-3.2-2.48c-.9.6-2.04.96-3.4.96-2.6 0-4.8-1.76-5.6-4.12l-3.3 2.55A9.6 9.6 0 0 0 12 21.6Z"
        />
        <path
          fill="currentColor"
          d="M6.4 13.54a5.8 5.8 0 0 1 0-3.68L3.1 7.3a9.6 9.6 0 0 0 0 8.8Z"
        />
        <path
          fill="currentColor"
          d="M12 6.16c1.47 0 2.78.5 3.82 1.5l2.84-2.84A9.6 9.6 0 0 0 3.1 7.3l3.3 2.56C7.2 7.9 9.4 6.16 12 6.16Z"
        />
      </svg>
      Continue with Google
    </button>
  );
}
