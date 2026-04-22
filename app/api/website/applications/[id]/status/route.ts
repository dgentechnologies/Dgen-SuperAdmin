import type { NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import type { DocumentReference, DocumentData } from 'firebase-admin/firestore';
import { verifySession } from '@/lib/auth/verify-session';
import { websiteDb } from '@/lib/firebase/admin-website';
import { superadminDb } from '@/lib/firebase/admin-superadmin';
import { updateApplicationStatusSchema } from '@/lib/schemas/application.schema';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

const APPLICATION_COLLECTIONS = ['applications', 'jobApplications'] as const;

interface RouteContext {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  const parsed = updateApplicationStatusSchema.safeParse(await req.json());
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? 'Invalid payload', 400);

  try {
    let ref: DocumentReference<DocumentData> | null = null;

    for (const collectionName of APPLICATION_COLLECTIONS) {
      const candidateRef = websiteDb().collection(collectionName).doc(params.id);
      const candidateDoc = await candidateRef.get();
      if (candidateDoc.exists) {
        ref = candidateRef;
        break;
      }
    }

    if (!ref) return apiError('Application not found', 404);

    await ref.update({
      status: parsed.data.status,
      statusNote: parsed.data.note ?? null,
      statusUpdatedAt: FieldValue.serverTimestamp(),
      statusUpdatedBy: session.uid
    });

    await superadminDb().collection('audit-logs').add({
      type: 'application_status_updated',
      targetId: params.id,
      status: parsed.data.status,
      performedBy: session.uid,
      timestamp: FieldValue.serverTimestamp()
    });

    return apiSuccess({ message: 'Application status updated' });
  } catch (err) {
    console.error('[website/applications/status]', err);
    return apiError('Failed to update status', 500);
  }
}
