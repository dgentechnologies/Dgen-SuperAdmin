"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<{ message: string; uid?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!apiKey) {
      setError({ message: 'Missing NEXT_PUBLIC_FIREBASE_API_KEY. Configure environment variables and try again.' });
      setLoading(false);
      return;
    }

    try {
      const signInResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password, returnSecureToken: true })
        }
      );

      if (!signInResponse.ok) {
        setError({ message: 'Invalid email or password.' });
        return;
      }

      const signInData = (await signInResponse.json()) as { idToken?: string; localId?: string };

      if (!signInData.idToken) {
        setError({ message: 'Could not get ID token from Firebase Auth.' });
        return;
      }

      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: signInData.idToken })
      });

      if (!sessionResponse.ok) {
        if (sessionResponse.status === 403) {
          const uid = signInData.localId ?? 'unknown';
          setError({
            message: 'Authenticated, but not authorised as SuperAdmin.',
            uid
          });
        } else {
          setError({ message: 'Unable to create session. Please try again.' });
        }
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError({ message: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-shell">
      <section className="login-card">
        <img src="/logo.svg" alt="DGEN logo" className="logo login-logo" />
        <p className="eyebrow">Admin Login</p>
        <h1>DGEN SuperAdmin</h1>
        <p>Sign in with your admin email and password.</p>

        <form className="placeholder-form" onSubmit={handleSubmit}>
          <label htmlFor="email" className="sr-only">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@dgentechnologies.com"
            className="placeholder-input"
            autoComplete="email"
            required
            aria-label="Email"
          />

          <label htmlFor="password" className="sr-only">Password</label>
          <div className="password-wrap">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="placeholder-input password-input"
              autoComplete="current-password"
              required
              aria-label="Password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                /* eye-off */
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                /* eye */
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {error ? (
            <div className="login-error">
              <p>{error.message}</p>
              {error.uid ? (
                <p style={{ marginTop: '6px', fontSize: '0.75rem' }}>
                  Your Firebase UID: <code style={{ userSelect: 'all', fontFamily: 'monospace', background: 'rgba(0,0,0,0.1)', padding: '1px 4px', borderRadius: '3px' }}>{error.uid}</code>
                  <br />
                  Add <code style={{ fontFamily: 'monospace' }}>SUPERADMIN_UID={error.uid}</code> to your environment variables.
                </p>
              ) : null}
            </div>
          ) : null}

          <button type="submit" className="btn btn-solid full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </section>
    </main>
  );
}
