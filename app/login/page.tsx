import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="login-shell">
      <section className="login-card">
        <img src="/logo.svg" alt="DGEN logo" className="logo login-logo" />
        <p className="eyebrow">Login Placeholder</p>
        <h1>DGEN SuperAdmin Login</h1>
        <p>This screen is intentionally frontend-only for now. Inputs and actions are placeholders.</p>
        <div className="placeholder-form">
          <div className="placeholder-input">Email address</div>
          <div className="placeholder-input">Password</div>
          <button type="button" className="btn btn-solid full">Sign In Placeholder</button>
        </div>
        <div className="hero-actions">
          <Link href="/dashboard" className="btn btn-soft">Open Dashboard</Link>
          <Link href="/" className="btn btn-soft">Back to Website</Link>
        </div>
      </section>
    </main>
  );
}
