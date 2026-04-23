import type { NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { verifySession } from '@/lib/auth/verify-session';
import { websiteDb } from '@/lib/firebase/admin-website';
import { superadminDb } from '@/lib/firebase/admin-superadmin';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { z } from 'zod';

const MESSAGE_COLLECTIONS = ['messages', 'contactMessages', 'contacts', 'inquiries', 'submissions', 'forms'] as const;

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateMessageSchema = z.object({
  isRead: z.boolean().optional(),
  replied: z.boolean().optional(),
  status: z.enum(['unread', 'read', 'replied', 'archived']).optional(),
}).refine((d) => d.isRead !== undefined || d.replied !== undefined || d.status !== undefined, {
  message: 'At least one field must be provided',
});

// ── DELETE – remove a message ─────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  const { id } = await params;

  try {
    const db = websiteDb();

    for (const colName of MESSAGE_COLLECTIONS) {
      const ref = db.collection(colName).doc(id);
      const snap = await ref.get();

      if (snap.exists) {
        await ref.delete();

        await superadminDb().collection('audit-logs').add({
          type: 'website_message_deleted',
          targetId: id,
          sourceCollection: colName,
          performedBy: session.uid,
          timestamp: FieldValue.serverTimestamp(),
        });

        return apiSuccess({ message: 'Message deleted' });
      }
    }

    return apiError('Message not found', 404);
  } catch (err) {
    console.error('[website/messages/id DELETE]', err);
    return apiError('Internal server error', 500);
  }
}

// ── PATCH – mark as read / replied ───────────────────────────
export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  const { id } = await params;

  const parsed = updateMessageSchema.safeParse(await req.json());
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? 'Invalid payload', 400);

  try {
    const db = websiteDb();

    for (const colName of MESSAGE_COLLECTIONS) {
      const ref = db.collection(colName).doc(id);
      const snap = await ref.get();

      if (snap.exists) {
        const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
        if (parsed.data.isRead !== undefined) updates.isRead = parsed.data.isRead;
        if (parsed.data.replied !== undefined) updates.replied = parsed.data.replied;
        if (parsed.data.status !== undefined) updates.status = parsed.data.status;

        await ref.update(updates);

        await superadminDb().collection('audit-logs').add({
          type: 'website_message_updated',
          targetId: id,
          changes: parsed.data,
          performedBy: session.uid,
          timestamp: FieldValue.serverTimestamp(),
        });

        return apiSuccess({ message: 'Message updated' });
      }
    }

    return apiError('Message not found', 404);
  } catch (err) {
    console.error('[website/messages/id PATCH]', err);
    return apiError('Internal server error', 500);
  }
}
