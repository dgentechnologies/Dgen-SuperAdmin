import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { isAuthorizedSuperadmin } from '@/lib/auth/superadmin-access';
import { superadminAuth, superadminDb } from '@/lib/firebase/admin-superadmin';
import { getSessionCookieName } from '@/lib/utils/env';

export async function POST(req: NextRequest) {
  try {
    const sessionCookieName = getSessionCookieName();
    const body = (await req.json()) as { idToken?: string };
    if (!body.idToken) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const decoded = await superadminAuth().verifyIdToken(body.idToken);

    const authorized = await isAuthorizedSuperadmin(decoded.uid);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await superadminAuth().createSessionCookie(body.idToken, {
      expiresIn
    });

    cookies().set(sessionCookieName, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: expiresIn / 1000,
      path: '/'
    });

    await superadminDb().collection('audit-logs').add({
      type: 'login',
      adminUid: decoded.uid,
      adminEmail: decoded.email ?? null,
      timestamp: FieldValue.serverTimestamp(),
      ip: req.headers.get('x-forwarded-for') ?? 'unknown'
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}

export async function DELETE() {
  cookies().delete(getSessionCookieName());
  return NextResponse.json({ success: true });
}
