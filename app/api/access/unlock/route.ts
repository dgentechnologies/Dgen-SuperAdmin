import type { NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { verifySession } from '@/lib/auth/verify-session';
import { accessRealtimeDb } from '@/lib/firebase/admin-access';
import { superadminDb } from '@/lib/firebase/admin-superadmin';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function POST(_req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    await accessRealtimeDb().ref('access_control/remote_unlock').set({
      command: 'unlock',
      triggeredBy: session.uid,
      timestamp: Date.now(),
      expiresAt: Date.now() + 10000
    });

    await superadminDb().collection('audit-logs').add({
      type: 'remote_unlock',
      performedBy: session.uid,
      timestamp: FieldValue.serverTimestamp()
    });

    return apiSuccess({ message: 'Unlock command sent' });
  } catch (err) {
    console.error('[access/unlock]', err);
    return apiError('Failed to send unlock command', 500);
  }
}
