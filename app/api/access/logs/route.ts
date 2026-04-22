import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { accessDb } from '@/lib/firebase/admin-access';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

const ACCESS_LOG_COLLECTIONS = ['access_logs', 'logs'] as const;

type RawAccessLog = {
  employeeName?: string;
  name?: string;
  employeeId?: string;
  userId?: string;
  action?: 'granted' | 'denied' | 'remote_unlock';
  granted?: boolean;
  method?: string;
  source?: string;
  timestamp?: unknown;
  createdAt?: unknown;
};

function normalizeAccessLog(id: string, raw: RawAccessLog) {
  return {
    id,
    employeeName: raw.employeeName ?? raw.name ?? 'Unknown',
    employeeId: raw.employeeId ?? raw.userId ?? '-',
    action: raw.action ?? (raw.granted === false ? 'denied' : 'granted'),
    method: raw.method ?? raw.source ?? 'unknown',
    timestamp: raw.timestamp ?? raw.createdAt ?? null
  };
}

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    const employeeId = req.nextUrl.searchParams.get('employeeId');

    for (const collectionName of ACCESS_LOG_COLLECTIONS) {
      try {
        let query = accessDb().collection(collectionName).limit(500);
        if (employeeId) {
          const field = collectionName === 'access_logs' ? 'employeeId' : 'userId';
          query = accessDb().collection(collectionName).where(field, '==', employeeId).limit(500);
        }

        const snap = await query.get();
        if (!snap.empty) {
          const data = snap.docs.map((doc) => normalizeAccessLog(doc.id, doc.data() as RawAccessLog));
          return apiSuccess(data);
        }
      } catch {
        // Try next known collection name.
      }
    }

    return apiSuccess([]);
  } catch (err) {
    console.error('[access/logs]', err);
    return apiError('Internal server error', 500);
  }
}
