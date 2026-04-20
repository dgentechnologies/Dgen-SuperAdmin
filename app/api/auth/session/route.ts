import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { superadminAuth, superadminDb } from '@/lib/firebase/admin-superadmin';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { idToken?: string };
    if (!body.idToken) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const decoded = await superadminAuth().verifyIdToken(body.idToken);

    const adminDoc = await superadminDb()
      .collection('superadmin-users')
      .doc(decoded.uid)
      .get();

    if (!adminDoc.exists) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await superadminAuth().createSessionCookie(body.idToken, {
      expiresIn
    });

    cookies().set(process.env.SESSION_COOKIE_NAME!, sessionCookie, {
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
  cookies().delete(process.env.SESSION_COOKIE_NAME!);
  return NextResponse.json({ success: true });
}
