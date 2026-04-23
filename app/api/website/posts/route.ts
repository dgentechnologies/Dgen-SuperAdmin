import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { websiteDb } from '@/lib/firebase/admin-website';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

const POST_COLLECTIONS = ['posts', 'blogPosts', 'articles', 'blogs', 'news', 'content'] as const;

type RawPost = {
  title?: string;
  name?: string;
  headline?: string;
  slug?: string;
  urlSlug?: string;
  status?: string;
  state?: string;
  publishStatus?: string;
  authorName?: string;
  author?: string;
  createdBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  publishedAt?: unknown;
};

function normalizePost(id: string, raw: RawPost) {
  return {
    id,
    title: raw.title ?? raw.name ?? raw.headline ?? 'Untitled post',
    slug: raw.slug ?? raw.urlSlug ?? id,
    status: raw.status ?? raw.state ?? raw.publishStatus ?? 'unknown',
    authorName: raw.authorName ?? raw.author ?? raw.createdBy ?? 'Unknown author',
    createdAt: raw.createdAt ?? raw.publishedAt ?? null,
    updatedAt: raw.updatedAt ?? raw.createdAt ?? raw.publishedAt ?? null
  };
}

export async function GET(_req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    const db = websiteDb();
    for (const collectionName of POST_COLLECTIONS) {
      try {
        let snap;
        try {
          snap = await db.collection(collectionName).orderBy('createdAt', 'desc').limit(500).get();
        } catch {
          snap = await db.collection(collectionName).limit(500).get();
        }

        if (!snap.empty) {
          const data = snap.docs.map((doc) => normalizePost(doc.id, doc.data() as RawPost));
          return apiSuccess(data);
        }
      } catch {
        // Try next known collection name.
      }
    }

    return apiSuccess([]);
  } catch (err) {
    console.error('[website/posts]', err);
    return apiError('Internal server error', 500);
  }
}
