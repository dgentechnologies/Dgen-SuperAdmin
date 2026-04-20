import { cookies } from 'next/headers';
import { superadminAuth } from '@/lib/firebase/admin-superadmin';

export interface AdminSession {
  uid: string;
  email: string;
}

export async function verifySession(): Promise<AdminSession | null> {
  try {
    const cookie = cookies().get(process.env.SESSION_COOKIE_NAME!)?.value;
    if (!cookie) return null;

    const decoded = await superadminAuth().verifySessionCookie(cookie, true);
    return {
      uid: decoded.uid,
      email: decoded.email ?? ''
    };
  } catch {
    return null;
  }
}
