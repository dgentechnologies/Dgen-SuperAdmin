import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { accessDb } from '@/lib/firebase/admin-access';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    const snap = await accessDb()
      .collection('access_logs')
      .where('employeeId', '==', params.id)
      .orderBy('timestamp', 'desc')
      .limit(500)
      .get();

    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return apiSuccess(data);
  } catch (err) {
    console.error('[access/employees/logs]', err);
    return apiError('Internal server error', 500);
  }
}
