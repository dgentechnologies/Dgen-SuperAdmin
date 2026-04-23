import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { accessDb } from '@/lib/firebase/admin-access';
import { booksDb } from '@/lib/firebase/admin-books';
import { websiteDb } from '@/lib/firebase/admin-website';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import type { Firestore } from 'firebase-admin/firestore';

async function listTopCollections(db: Firestore) {
  try {
    const refs = await db.listCollections();
    return refs.map((ref) => ref.id).sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

export async function GET(_req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    const [websiteCollections, accessCollections, booksCollections] = await Promise.all([
      listTopCollections(websiteDb()),
      listTopCollections(accessDb()),
      listTopCollections(booksDb())
    ]);

    return apiSuccess({
      website: websiteCollections,
      access: accessCollections,
      books: booksCollections
    });
  } catch (err) {
    console.error('[system/database-collections]', err);
    return apiError('Unable to list database collections', 500);
  }
}
