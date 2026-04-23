import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { websiteDb } from '@/lib/firebase/admin-website';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

// Comprehensive list of possible collection names for career/job listings.
// The discovery endpoint /api/system/database-collections will reveal the actual name.
const CAREER_COLLECTIONS = [
  'careers',
  'careerListings',
  'jobListings',
  'jobs',
  'jobPostings',
  'positions',
  'openings',
  'vacancies'
] as const;

type RawCareer = {
  title?: string;
  role?: string;
  position?: string;
  jobTitle?: string;
  department?: string;
  team?: string;
  location?: string;
  city?: string;
  status?: string;
  state?: string;
  isOpen?: boolean;
  active?: boolean;
  createdAt?: unknown;
  postedAt?: unknown;
};

function normalizeCareer(id: string, raw: RawCareer) {
  return {
    id,
    title: raw.title ?? raw.role ?? raw.position ?? raw.jobTitle ?? 'Untitled role',
    role: raw.role ?? raw.title ?? raw.position ?? raw.jobTitle ?? 'Untitled role',
    department: raw.department ?? raw.team ?? 'General',
    location: raw.location ?? raw.city ?? '-',
    status: raw.status ?? raw.state ?? (raw.isOpen === false || raw.active === false ? 'paused' : 'open'),
    createdAt: raw.createdAt ?? raw.postedAt ?? null
  };
}

export async function GET(_req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    const db = websiteDb();

    for (const collectionName of CAREER_COLLECTIONS) {
      try {
        const snap = await db.collection(collectionName).limit(500).get();

        if (!snap.empty) {
          const data = snap.docs.map((doc) => normalizeCareer(doc.id, doc.data() as RawCareer));
          return apiSuccess(data);
        }
      } catch {
        // Collection does not exist or access error – try next
      }
    }

    return apiSuccess([]);
  } catch (err) {
    console.error('[website/careers]', err);
    return apiError('Internal server error', 500);
  }
}
