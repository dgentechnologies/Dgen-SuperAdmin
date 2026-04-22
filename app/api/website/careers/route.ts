import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { websiteDb } from '@/lib/firebase/admin-website';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

const CAREER_COLLECTIONS = ['careers', 'careerListings'] as const;

type RawCareer = {
  title?: string;
  role?: string;
  position?: string;
  department?: string;
  location?: string;
  status?: string;
  state?: string;
  isOpen?: boolean;
  createdAt?: unknown;
};

function normalizeCareer(id: string, raw: RawCareer) {
  return {
    id,
    title: raw.title ?? raw.role ?? raw.position ?? 'Untitled role',
    role: raw.role ?? raw.title ?? raw.position ?? 'Untitled role',
    department: raw.department ?? 'General',
    location: raw.location ?? '-',
    status: raw.status ?? raw.state ?? (raw.isOpen === false ? 'paused' : 'open'),
    createdAt: raw.createdAt ?? null
  };
}

export async function GET(_req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    for (const collectionName of CAREER_COLLECTIONS) {
      try {
        let snap;
        try {
          snap = await websiteDb().collection(collectionName).orderBy('createdAt', 'desc').limit(500).get();
        } catch {
          snap = await websiteDb().collection(collectionName).limit(500).get();
        }

        if (!snap.empty) {
          const data = snap.docs.map((doc) => normalizeCareer(doc.id, doc.data() as RawCareer));
          return apiSuccess(data);
        }
      } catch {
        // Try next known collection name.
      }
    }

    return apiSuccess([]);
  } catch (err) {
    console.error('[website/careers]', err);
    return apiError('Internal server error', 500);
  }
}
