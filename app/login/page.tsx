"use client";

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (!apiKey) {
      setError('Missing NEXT_PUBLIC_FIREBASE_API_KEY. Configure environment variables and try again.');
      setLoading(false);
      return;
    }

    try {
      const signInResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
            returnSecureToken: true
          })
        }
      );

      if (!signInResponse.ok) {
        setError('Invalid email or password.');
        return;
      }

      const signInData = (await signInResponse.json()) as { idToken?: string };

      if (!signInData.idToken) {
        setError('Could not get ID token from Firebase Auth.');
        return;
      }

      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken: signInData.idToken })
      });

      if (!sessionResponse.ok) {
        if (sessionResponse.status === 403) {
          setError('This user is authenticated, but not in superadmin-users. Ask an admin to add your UID.');
        } else {
          setError('Unable to create session. Please try again.');
        }
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-shell">
      <section className="login-card">
        <img src="/logo.svg" alt="DGEN logo" className="logo login-logo" />
        <p className="eyebrow">Admin Login</p>
        <h1>DGEN SuperAdmin Login</h1>
        <p>Sign in with email and password. Dashboard opens only after your admin user is added.</p>

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
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            className="placeholder-input"
            autoComplete="current-password"
            required
            aria-label="Password"
          />

          {error ? <p className="login-error">{error}</p> : null}

          <button type="submit" className="btn btn-solid full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="hero-actions">
          <Link href="/about" className="btn btn-soft">Open Website</Link>
        </div>
      </section>
    </main>
  );
}
