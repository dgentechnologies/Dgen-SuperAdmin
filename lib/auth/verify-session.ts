import { cookies } from 'next/headers';
import { isAuthorizedSuperadmin } from '@/lib/auth/superadmin-access';
import { superadminAuth } from '@/lib/firebase/admin-superadmin';
import { getSessionCookieName } from '@/lib/utils/env';

export interface AdminSession {
  uid: string;
  email: string;
}

export async function verifySession(): Promise<AdminSession | null> {
  try {
    const cookie = cookies().get(getSessionCookieName())?.value;
    if (!cookie) return null;

    const decoded = await superadminAuth().verifySessionCookie(cookie, true);

    const authorized = await isAuthorizedSuperadmin(decoded.uid);
    if (!authorized) {
      return null;
    }

    return {
      uid: decoded.uid,
      email: decoded.email ?? ''
    };
  } catch {
    return null;
  }
}
