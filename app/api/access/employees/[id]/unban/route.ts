import type { NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { verifySession } from '@/lib/auth/verify-session';
import { accessDb } from '@/lib/firebase/admin-access';
import { superadminDb } from '@/lib/firebase/admin-superadmin';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

interface RouteContext {
  params: { id: string };
}

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    const ref = accessDb().collection('employees').doc(params.id);
    const doc = await ref.get();
    if (!doc.exists) return apiError('Employee not found', 404);

    await ref.update({
      status: 'active',
      banReason: null,
      unbannedAt: FieldValue.serverTimestamp(),
      unbannedBy: session.uid
    });

    await superadminDb().collection('audit-logs').add({
      type: 'employee_unbanned',
      targetId: params.id,
      targetName: doc.data()?.name ?? null,
      performedBy: session.uid,
      timestamp: FieldValue.serverTimestamp()
    });

    return apiSuccess({ message: 'Employee unbanned' });
  } catch (err) {
    console.error('[access/employees/unban]', err);
    return apiError('Failed to unban employee', 500);
  }
}
