import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { accessDb } from '@/lib/firebase/admin-access';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

const ACCESS_LOG_COLLECTIONS = ['access_logs', 'logs'] as const;

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    for (const collectionName of ACCESS_LOG_COLLECTIONS) {
      try {
        const field = collectionName === 'access_logs' ? 'employeeId' : 'userId';
        const snap = await accessDb().collection(collectionName).where(field, '==', params.id).limit(500).get();
        if (!snap.empty) {
          const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data(), _sourceCollection: collectionName }));
          return apiSuccess(data);
        }
      } catch {
        // Try next known collection name.
      }
    }

    return apiSuccess([]);
  } catch (err) {
    console.error('[access/employees/logs]', err);
    return apiError('Internal server error', 500);
  }
}
