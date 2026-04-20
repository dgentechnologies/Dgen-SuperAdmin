import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { accessDb } from '@/lib/firebase/admin-access';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    const employeeId = req.nextUrl.searchParams.get('employeeId');

    let query: FirebaseFirestore.Query = accessDb()
      .collection('access_logs')
      .orderBy('timestamp', 'desc')
      .limit(500);

    if (employeeId) {
      query = accessDb()
        .collection('access_logs')
        .where('employeeId', '==', employeeId)
        .orderBy('timestamp', 'desc')
        .limit(500);
    }

    const snap = await query.get();
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return apiSuccess(data);
  } catch (err) {
    console.error('[access/logs]', err);
    return apiError('Internal server error', 500);
  }
}
