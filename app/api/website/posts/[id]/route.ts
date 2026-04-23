import type { NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { verifySession } from '@/lib/auth/verify-session';
import { websiteDb } from '@/lib/firebase/admin-website';
import { superadminDb } from '@/lib/firebase/admin-superadmin';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { z } from 'zod';

const POST_COLLECTIONS = ['posts', 'blogPosts', 'articles', 'blogs', 'news', 'content'] as const;

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updatePostSchema = z.object({
  status: z.enum(['draft', 'published', 'scheduled', 'archived']).optional(),
  title: z.string().min(1).max(500).optional(),
}).refine((d) => d.status !== undefined || d.title !== undefined, {
  message: 'At least one field must be provided',
});

// ── DELETE – remove a post ────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  const { id } = await params;

  try {
    const db = websiteDb();

    for (const colName of POST_COLLECTIONS) {
      const ref = db.collection(colName).doc(id);
      const snap = await ref.get();

      if (snap.exists) {
        await ref.delete();

        await superadminDb().collection('audit-logs').add({
          type: 'website_post_deleted',
          targetId: id,
          sourceCollection: colName,
          performedBy: session.uid,
          timestamp: FieldValue.serverTimestamp(),
        });

        return apiSuccess({ message: 'Post deleted' });
      }
    }

    return apiError('Post not found', 404);
  } catch (err) {
    console.error('[website/posts/id DELETE]', err);
    return apiError('Internal server error', 500);
  }
}

// ── PATCH – update post status or title ──────────────────────
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  const { id } = await params;

  const parsed = updatePostSchema.safeParse(await req.json());
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? 'Invalid payload', 400);

  try {
    const db = websiteDb();

    for (const colName of POST_COLLECTIONS) {
      const ref = db.collection(colName).doc(id);
      const snap = await ref.get();

      if (snap.exists) {
        const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
        if (parsed.data.status) updates.status = parsed.data.status;
        if (parsed.data.title) updates.title = parsed.data.title;

        await ref.update(updates);

        await superadminDb().collection('audit-logs').add({
          type: 'website_post_updated',
          targetId: id,
          changes: parsed.data,
          performedBy: session.uid,
          timestamp: FieldValue.serverTimestamp(),
        });

        return apiSuccess({ message: 'Post updated' });
      }
    }

    return apiError('Post not found', 404);
  } catch (err) {
    console.error('[website/posts/id PATCH]', err);
    return apiError('Internal server error', 500);
  }
}
