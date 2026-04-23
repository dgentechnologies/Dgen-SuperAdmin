import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { booksDb } from '@/lib/firebase/admin-books';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

const EXPENSE_COLLECTIONS = ['expenses', 'purchases'] as const;

type RawExpense = {
  amount?: number;
  category?: string;
  month?: string;
  date?: string;
  createdAt?: unknown;
};

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

  const month = req.nextUrl.searchParams.get('month');

  try {
    const db = booksDb();

    for (const collectionName of EXPENSE_COLLECTIONS) {
      try {
        const snap = await db.collectionGroup(collectionName).limit(1000).get();

        if (!snap.empty) {
          let total = 0;
          const categoryMap = new Map<string, number>();
          let count = 0;

          for (const doc of snap.docs) {
            const row = doc.data() as RawExpense;
            if (month && getMonthKey(row) !== month) continue;
            const amount = row.amount ?? 0;
            const category = row.category ?? 'uncategorized';
            total += amount;
            categoryMap.set(category, (categoryMap.get(category) ?? 0) + amount);
            count += 1;
          }

          const byCategory = Array.from(categoryMap.entries()).map(([category, amount]) => ({
            category,
            amount
          }));

          return apiSuccess({ month, total, count, byCategory });
        }
      } catch {
        // Collection not accessible – try next
      }
    }

    // No data found – return zero summary (not an error)
    return apiSuccess({ month, total: 0, count: 0, byCategory: [] });
  } catch (err) {
    console.error('[books/expenses/summary]', err);
    return apiError('Internal server error', 500);
  }
}
