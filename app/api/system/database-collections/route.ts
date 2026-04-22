import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { accessDb } from '@/lib/firebase/admin-access';
import { booksDb } from '@/lib/firebase/admin-books';
import { websiteDb } from '@/lib/firebase/admin-website';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

async function listTopCollections(db: ReturnType<typeof websiteDb>) {
  const refs = await db.listCollections();
  return refs.map((ref) => ref.id).sort((a, b) => a.localeCompare(b));
}

export async function GET(_req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    const [websiteCollections, accessCollections, booksCollections] = await Promise.all([
      listTopCollections(websiteDb()),
      listTopCollections(accessDb() as ReturnType<typeof websiteDb>),
      listTopCollections(booksDb() as ReturnType<typeof websiteDb>)
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
