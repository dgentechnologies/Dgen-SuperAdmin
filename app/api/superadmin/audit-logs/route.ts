import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { superadminDb } from '@/lib/firebase/admin-superadmin';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    const requestedLimit = Number(req.nextUrl.searchParams.get('limit') ?? '100');
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 200) : 100;
    const type = req.nextUrl.searchParams.get('type');

    let query = superadminDb().collection('audit-logs').orderBy('timestamp', 'desc').limit(limit);

    if (type) {
      query = superadminDb()
        .collection('audit-logs')
        .where('type', '==', type)
        .orderBy('timestamp', 'desc')
        .limit(limit);
    }

    const snap = await query.get();
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return apiSuccess(data);
  } catch (err) {
    console.error('[superadmin/audit-logs]', err);
    return apiError('Internal server error', 500);
  }
}
