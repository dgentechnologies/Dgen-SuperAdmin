import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { websiteDb } from '@/lib/firebase/admin-website';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

const APPLICATION_COLLECTIONS = ['applications', 'jobApplications'] as const;

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    for (const collectionName of APPLICATION_COLLECTIONS) {
      const doc = await websiteDb().collection(collectionName).doc(params.id).get();
      if (doc.exists) {
        return apiSuccess({ id: doc.id, ...doc.data(), _sourceCollection: collectionName });
      }
    }

    return apiError('Application not found', 404);
  } catch (err) {
    console.error('[website/applications/id]', err);
    return apiError('Internal server error', 500);
  }
}
