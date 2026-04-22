import type { NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import type { DocumentReference, DocumentData } from 'firebase-admin/firestore';
import { verifySession } from '@/lib/auth/verify-session';
import { accessDb } from '@/lib/firebase/admin-access';
import { superadminDb } from '@/lib/firebase/admin-superadmin';
import { banEmployeeSchema } from '@/lib/schemas/employee.schema';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

const EMPLOYEE_COLLECTIONS = ['employees', 'users'] as const;

interface RouteContext {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  const parsed = banEmployeeSchema.safeParse(await req.json());
  if (!parsed.success) return apiError('Reason must be at least 5 characters', 400);

  try {
    let ref: DocumentReference<DocumentData> | null = null;
    let doc = null;

    for (const collectionName of EMPLOYEE_COLLECTIONS) {
      const candidateRef = accessDb().collection(collectionName).doc(params.id);
      const candidateDoc = await candidateRef.get();
      if (candidateDoc.exists) {
        ref = candidateRef;
        doc = candidateDoc;
        break;
      }
    }

    if (!ref || !doc) return apiError('Employee not found', 404);

    await ref.update({
      status: 'banned',
      banReason: parsed.data.reason,
      bannedAt: FieldValue.serverTimestamp(),
      bannedBy: session.uid
    });

    await superadminDb().collection('audit-logs').add({
      type: 'employee_banned',
      targetId: params.id,
      targetName: doc.data()?.name ?? null,
      reason: parsed.data.reason,
      performedBy: session.uid,
      timestamp: FieldValue.serverTimestamp()
    });

    return apiSuccess({ message: 'Employee banned' });
  } catch (err) {
    console.error('[access/employees/ban]', err);
    return apiError('Failed to ban employee', 500);
  }
}
