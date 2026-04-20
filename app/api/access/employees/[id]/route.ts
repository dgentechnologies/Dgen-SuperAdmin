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
    const doc = await accessDb().collection('employees').doc(params.id).get();
    if (!doc.exists) return apiError('Employee not found', 404);

    return apiSuccess({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('[access/employees/id]', err);
    return apiError('Internal server error', 500);
  }
}
