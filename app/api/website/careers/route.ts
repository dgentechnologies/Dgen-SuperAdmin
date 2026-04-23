import type { NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { verifySession } from '@/lib/auth/verify-session';
import { websiteDb } from '@/lib/firebase/admin-website';
import { superadminDb } from '@/lib/firebase/admin-superadmin';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { z } from 'zod';

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

// ── POST – create a new career listing ───────────────────────

const createCareerSchema = z.object({
  title: z.string().min(1).max(300),
  department: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  status: z.enum(['open', 'paused', 'closed', 'draft']).default('draft'),
  description: z.string().max(5000).optional(),
  workMode: z.enum(['remote', 'onsite', 'hybrid']).optional(),
  type: z.enum(['full-time', 'part-time', 'internship', 'contract']).optional(),
  compensation: z.string().max(200).optional(),
  requirements: z.array(z.string().max(500)).max(20).optional(),
});

export async function POST(req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  const parsed = createCareerSchema.safeParse(await req.json());
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? 'Invalid payload', 400);

  try {
    const db = websiteDb();

    // Use the first collection that already exists, otherwise default to 'careerListings'
    let targetCollection = 'careerListings';
    for (const colName of CAREER_COLLECTIONS) {
      try {
        const probe = await db.collection(colName).limit(1).get();
        if (!probe.empty) { targetCollection = colName; break; }
      } catch { /* try next */ }
    }

    const { data } = parsed;
    const doc = await db.collection(targetCollection).add({
      title: data.title,
      department: data.department ?? null,
      location: data.location ?? null,
      status: data.status,
      description: data.description ?? null,
      workMode: data.workMode ?? null,
      type: data.type ?? null,
      compensation: data.compensation ?? null,
      requirements: data.requirements ?? [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: session.uid,
    });

    await superadminDb().collection('audit-logs').add({
      type: 'website_career_created',
      targetId: doc.id,
      title: data.title,
      performedBy: session.uid,
      timestamp: FieldValue.serverTimestamp(),
    });

    return apiSuccess({ id: doc.id, message: 'Career listing created' }, 201);
  } catch (err) {
    console.error('[website/careers POST]', err);
    return apiError('Internal server error', 500);
  }
}
