import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { accessDb } from '@/lib/firebase/admin-access';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import type { CollectionReference, Query, DocumentData } from 'firebase-admin/firestore';

const EMPLOYEE_COLLECTIONS = ['employees', 'users', 'members', 'staff', 'personnel'] as const;

type RawEmployee = {
  name?: string;
  fullName?: string;
  role?: string;
  designation?: string;
  employeeId?: string;
  rfidUid?: string;
  rfid?: string;
  email?: string;
  status?: 'active' | 'banned';
  banned?: boolean;
  isBanned?: boolean;
  banReason?: string;
  createdAt?: unknown;
};

function normalizeEmployee(id: string, raw: RawEmployee) {
  const isBanned = raw.status === 'banned' || raw.banned === true || raw.isBanned === true;
  return {
    id,
    name: raw.name ?? raw.fullName ?? 'Unknown employee',
    role: raw.role ?? raw.designation ?? 'Employee',
    employeeId: raw.employeeId ?? id,
    rfidUid: raw.rfidUid ?? raw.rfid ?? null,
    email: raw.email ?? null,
    status: isBanned ? 'banned' : 'active',
    banReason: isBanned ? raw.banReason ?? 'Restricted' : null,
    createdAt: raw.createdAt ?? null
  };
}

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    const status = req.nextUrl.searchParams.get('status');

    for (const collectionName of EMPLOYEE_COLLECTIONS) {
      try {
        let query: Query<DocumentData> | CollectionReference<DocumentData> = accessDb().collection(collectionName);

        if (status && collectionName === 'employees') {
          query = query.where('status', '==', status);
        }

        const snap = await query.limit(1000).get();
        if (!snap.empty) {
          let data = snap.docs.map((doc) => normalizeEmployee(doc.id, doc.data() as RawEmployee));
          if (status) {
            data = data.filter((row) => row.status === status);
          }
          return apiSuccess(data);
        }
      } catch {
        // Try next known collection name.
      }
    }

    return apiSuccess([]);
  } catch (err) {
    console.error('[access/employees]', err);
    return apiError('Internal server error', 500);
  }
}
