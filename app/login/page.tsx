"use client";

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { clientAuth } from '@/lib/firebase/client-superadmin';

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

    try {
      const credential = await signInWithEmailAndPassword(clientAuth, email.trim(), password);
      const idToken = await credential.user.getIdToken();

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idToken })
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('This user is authenticated, but not in superadmin-users. Ask an admin to add your UID.');
        } else {
          setError('Unable to create session. Please try again.');
        }

        await clientAuth.signOut();
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Invalid email or password.');
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
