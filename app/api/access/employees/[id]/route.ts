import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { accessDb } from '@/lib/firebase/admin-access';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

const EMPLOYEE_COLLECTIONS = ['employees', 'users'] as const;

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    for (const collectionName of EMPLOYEE_COLLECTIONS) {
      const doc = await accessDb().collection(collectionName).doc(params.id).get();
      if (doc.exists) {
        return apiSuccess({ id: doc.id, ...doc.data(), _sourceCollection: collectionName });
      }
    }

    return apiError('Employee not found', 404);
  } catch (err) {
    console.error('[access/employees/id]', err);
    return apiError('Internal server error', 500);
  }
}
