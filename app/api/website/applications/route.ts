import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { websiteDb } from '@/lib/firebase/admin-website';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

const APPLICATION_COLLECTIONS = ['applications', 'jobApplications', 'applicants', 'candidates', 'submissions'] as const;

type RawApplication = {
  applicantName?: string;
  fullName?: string;
  applicantEmail?: string;
  email?: string;
  roleApplied?: string;
  role?: string;
  coverNote?: string;
  message?: string;
  resumeUrl?: string;
  resume?: string;
  status?: 'pending' | 'reviewed' | 'shortlisted' | 'assigned' | 'rejected';
  createdAt?: unknown;
  assignedTo?: {
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
  };
};

function normalizeApplication(id: string, raw: RawApplication) {
  return {
    id,
    applicantName: raw.applicantName ?? raw.fullName ?? 'Unknown applicant',
    applicantEmail: raw.applicantEmail ?? raw.email ?? '-',
    roleApplied: raw.roleApplied ?? raw.role ?? 'Unspecified role',
    coverNote: raw.coverNote ?? raw.message ?? '',
    resumeUrl: raw.resumeUrl ?? raw.resume ?? '',
    status: raw.status ?? 'pending',
    createdAt: raw.createdAt ?? null,
    assignedTo: raw.assignedTo ?? null
  };
}

export async function GET(_req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    const db = websiteDb();
    for (const collectionName of APPLICATION_COLLECTIONS) {
      try {
        let snap;
        try {
          snap = await db.collection(collectionName).orderBy('createdAt', 'desc').limit(500).get();
        } catch {
          snap = await db.collection(collectionName).limit(500).get();
        }

        if (!snap.empty) {
          const data = snap.docs.map((doc) => normalizeApplication(doc.id, doc.data() as RawApplication));
          return apiSuccess(data);
        }
      } catch {
        // Try next known collection name.
      }
    }

    return apiSuccess([]);
  } catch (err) {
    console.error('[website/applications]', err);
    return apiError('Internal server error', 500);
  }
}
