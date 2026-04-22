const DEFAULT_SESSION_COOKIE_NAME = 'dgen_superadmin_session';

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }
  return value;
}

export function getSessionCookieName(): string {
  return process.env.SESSION_COOKIE_NAME?.trim() || DEFAULT_SESSION_COOKIE_NAME;
}

export function getSuperadminEnvUidAllowlist(): Set<string> {
  return new Set(
    (process.env.SUPERADMIN_UID ?? '')
      .split(',')
      .map((uid) => uid.trim())
      .filter(Boolean)
  );
}
