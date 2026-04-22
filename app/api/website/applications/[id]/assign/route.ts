import type { NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import type { DocumentReference, DocumentData } from 'firebase-admin/firestore';
import { verifySession } from '@/lib/auth/verify-session';
import { sendEmail } from '@/lib/email/send-email';
import { websiteDb } from '@/lib/firebase/admin-website';
import { superadminDb } from '@/lib/firebase/admin-superadmin';
import { assignApplicationSchema } from '@/lib/schemas/application.schema';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

const APPLICATION_COLLECTIONS = ['applications', 'jobApplications'] as const;

interface RouteContext {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  const parsed = assignApplicationSchema.safeParse(await req.json());
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? 'Invalid payload', 400);

  const { employeeId, employeeName, employeeEmail, note, startDate } = parsed.data;

  try {
    let appRef: DocumentReference<DocumentData> | null = null;
    let appDoc = null;

    for (const collectionName of APPLICATION_COLLECTIONS) {
      const candidateRef = websiteDb().collection(collectionName).doc(params.id);
      const candidateDoc = await candidateRef.get();
      if (candidateDoc.exists) {
        appRef = candidateRef;
        appDoc = candidateDoc;
        break;
      }
    }

    if (!appRef || !appDoc) return apiError('Application not found', 404);

    const app = appDoc.data();

    await appRef.update({
      status: 'assigned',
      assignedTo: { employeeId, employeeName, employeeEmail },
      assignedAt: FieldValue.serverTimestamp(),
      assignedBy: session.uid
    });

    await sendEmail({
      to: employeeEmail,
      subject: `Intern Assignment - ${(app?.applicantName as string) ?? 'Candidate'}`,
      html: `<p>Hi ${employeeName},</p>
             <p>Intern <strong>${(app?.applicantName as string) ?? 'Candidate'}</strong> (${(app?.applicantEmail as string) ?? '-'}) has been assigned to work under you for the role of <strong>${(app?.roleApplied as string) ?? '-'}</strong>.</p>
             ${startDate ? `<p>Start Date: ${startDate}</p>` : ''}
             ${note ? `<p>Note from Admin: ${note}</p>` : ''}
             <p>Please reach out to coordinate onboarding.</p>
             <p>- Dgen Technologies SuperAdmin</p>`
    });

    await superadminDb().collection('audit-logs').add({
      type: 'intern_assigned',
      applicationId: params.id,
      assignedTo: employeeId,
      performedBy: session.uid,
      timestamp: FieldValue.serverTimestamp()
    });

    return apiSuccess({ message: 'Intern assigned and employee notified' });
  } catch (err) {
    console.error('[website/applications/assign]', err);
    return apiError('Failed to assign intern', 500);
  }
}
