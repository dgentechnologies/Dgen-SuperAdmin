import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { booksDb } from '@/lib/firebase/admin-books';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

// The books database may store expenses under different collection names:
// - top-level 'expenses' (v1 schema)
// - subcollection 'purchases' under each user (v2 user-scoped schema)
const EXPENSE_COLLECTIONS = ['expenses', 'purchases'] as const;

type RawExpense = {
  amount?: number;
  category?: string;
  note?: string;
  description?: string;
  title?: string;
  month?: string;
  date?: string;
  createdAt?: unknown;
  type?: string;
  status?: string;
  addedBy?: string;
  paidById?: string;
};

function normalizeExpense(id: string, raw: RawExpense) {
  return {
    id,
    amount: raw.amount ?? 0,
    category: raw.category ?? 'uncategorized',
    description: raw.description ?? raw.note ?? raw.title ?? '',
    month: raw.month ?? null,
    date: raw.date ?? null,
    createdAt: raw.createdAt ?? null,
    type: raw.type ?? 'debit',
    status: raw.status ?? 'approved',
    addedBy: raw.addedBy ?? raw.paidById ?? null
  };
}

function getMonthKey(raw: RawExpense): string | null {
  if (raw.month) return raw.month;
  if (raw.date) return raw.date.slice(0, 7);
  if (raw.createdAt) {
    try {
      const d =
        typeof (raw.createdAt as { toDate?: () => Date }).toDate === 'function'
          ? (raw.createdAt as { toDate: () => Date }).toDate()
          : new Date(raw.createdAt as string);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}`;
    } catch {
      return null;
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    const month = req.nextUrl.searchParams.get('month');
    const db = booksDb();

    for (const collectionName of EXPENSE_COLLECTIONS) {
      try {
        // Use collectionGroup so we pick up subcollections under user docs too
        const snap = await db.collectionGroup(collectionName).limit(500).get();

        if (!snap.empty) {
          const rawDocs = snap.docs.map((doc) => ({ id: doc.id, raw: doc.data() as RawExpense }));
          const filtered = month
            ? rawDocs.filter(({ raw }) => getMonthKey(raw) === month)
            : rawDocs;

          const data = filtered.map(({ id, raw }) => normalizeExpense(id, raw));
          data.sort((a, b) => {
            const ta = a.createdAt
              ? typeof (a.createdAt as { toDate?: () => Date }).toDate === 'function'
                ? (a.createdAt as { toDate: () => Date }).toDate().getTime()
                : new Date(a.createdAt as string).getTime()
              : 0;
            const tb = b.createdAt
              ? typeof (b.createdAt as { toDate?: () => Date }).toDate === 'function'
                ? (b.createdAt as { toDate: () => Date }).toDate().getTime()
                : new Date(b.createdAt as string).getTime()
              : 0;
            return tb - ta;
          });
          return apiSuccess(data);
        }
      } catch {
        // Collection not accessible – try next
      }
    }

    return apiSuccess([]);
  } catch (err) {
    console.error('[books/expenses]', err);
    return apiError('Internal server error', 500);
  }
}
