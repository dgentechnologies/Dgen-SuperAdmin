import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { websiteDb } from '@/lib/firebase/admin-website';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

const MESSAGE_COLLECTIONS = ['messages', 'contactMessages'] as const;

type RawMessage = {
  name?: string;
  fullName?: string;
  email?: string;
  subject?: string;
  topic?: string;
  message?: string;
  body?: string;
  status?: string;
  isRead?: boolean;
  replied?: boolean;
  priority?: string;
  createdAt?: unknown;
};

function normalizeMessage(id: string, raw: RawMessage) {
  const status = raw.status?.toLowerCase();

  return {
    id,
    name: raw.name ?? raw.fullName ?? 'Unknown sender',
    email: raw.email ?? null,
    subject: raw.subject ?? raw.topic ?? 'No subject',
    message: raw.message ?? raw.body ?? '',
    status: raw.status ?? (raw.replied ? 'replied' : raw.isRead ? 'read' : 'unread'),
    isRead: raw.isRead ?? status === 'read',
    replied: raw.replied ?? status === 'replied',
    priority: raw.priority ?? 'medium',
    createdAt: raw.createdAt ?? null
  };
}

export async function GET(_req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    for (const collectionName of MESSAGE_COLLECTIONS) {
      try {
        let snap;
        try {
          snap = await websiteDb().collection(collectionName).orderBy('createdAt', 'desc').limit(500).get();
        } catch {
          snap = await websiteDb().collection(collectionName).limit(500).get();
        }

        if (!snap.empty) {
          const data = snap.docs.map((doc) => normalizeMessage(doc.id, doc.data() as RawMessage));
          return apiSuccess(data);
        }
      } catch {
        // Try next known collection name.
      }
    }

    return apiSuccess([]);
  } catch (err) {
    console.error('[website/messages]', err);
    return apiError('Internal server error', 500);
  }
}
