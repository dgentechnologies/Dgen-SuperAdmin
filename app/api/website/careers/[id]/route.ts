import type { NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { verifySession } from '@/lib/auth/verify-session';
import { websiteDb } from '@/lib/firebase/admin-website';
import { superadminDb } from '@/lib/firebase/admin-superadmin';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { z } from 'zod';

const CAREER_COLLECTIONS = ['careers', 'careerListings', 'jobListings', 'jobs', 'jobPostings', 'positions', 'openings', 'vacancies'] as const;

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateCareerSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  status: z.enum(['open', 'paused', 'closed', 'draft']).optional(),
  department: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
}).refine((d) => Object.values(d).some((v) => v !== undefined), {
  message: 'At least one field must be provided',
});

// ── DELETE ────────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  const { id } = await params;

  try {
    const db = websiteDb();

    for (const colName of CAREER_COLLECTIONS) {
      const ref = db.collection(colName).doc(id);
      const snap = await ref.get();

      if (snap.exists) {
        await ref.delete();

        await superadminDb().collection('audit-logs').add({
          type: 'website_career_deleted',
          targetId: id,
          sourceCollection: colName,
          performedBy: session.uid,
          timestamp: FieldValue.serverTimestamp(),
        });

        return apiSuccess({ message: 'Career listing deleted' });
      }
    }

    return apiError('Career listing not found', 404);
  } catch (err) {
    console.error('[website/careers/id DELETE]', err);
    return apiError('Internal server error', 500);
  }
}

// ── PATCH – update status / title ────────────────────────────
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  const { id } = await params;

  const parsed = updateCareerSchema.safeParse(await req.json());
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? 'Invalid payload', 400);

  try {
    const db = websiteDb();

    for (const colName of CAREER_COLLECTIONS) {
      const ref = db.collection(colName).doc(id);
      const snap = await ref.get();

      if (snap.exists) {
        const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
        if (parsed.data.title) updates.title = parsed.data.title;
        if (parsed.data.status) updates.status = parsed.data.status;
        if (parsed.data.department) updates.department = parsed.data.department;
        if (parsed.data.location) updates.location = parsed.data.location;

        await ref.update(updates);

        await superadminDb().collection('audit-logs').add({
          type: 'website_career_updated',
          targetId: id,
          changes: parsed.data,
          performedBy: session.uid,
          timestamp: FieldValue.serverTimestamp(),
        });

        return apiSuccess({ message: 'Career listing updated' });
      }
    }

    return apiError('Career listing not found', 404);
  } catch (err) {
    console.error('[website/careers/id PATCH]', err);
    return apiError('Internal server error', 500);
  }
}
