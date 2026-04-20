import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { websiteDb } from '@/lib/firebase/admin-website';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function GET(_req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    const snap = await websiteDb()
      .collection('applications')
      .orderBy('createdAt', 'desc')
      .get();

    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return apiSuccess(data);
  } catch (err) {
    console.error('[website/applications]', err);
    return apiError('Internal server error', 500);
  }
}
