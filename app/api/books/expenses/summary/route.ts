import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { booksDb } from '@/lib/firebase/admin-books';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    const month = req.nextUrl.searchParams.get('month');
    let query: FirebaseFirestore.Query = booksDb().collection('expenses');

    if (month) {
      query = query.where('month', '==', month);
    }

    const snap = await query.limit(1000).get();

    let total = 0;
    const categoryMap = new Map<string, number>();

    for (const doc of snap.docs) {
      const row = doc.data() as { amount?: number; category?: string };
      const amount = row.amount ?? 0;
      const category = row.category ?? 'uncategorized';
      total += amount;
      categoryMap.set(category, (categoryMap.get(category) ?? 0) + amount);
    }

    const byCategory = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount
    }));

    return apiSuccess({
      month,
      total,
      count: snap.size,
      byCategory
    });
  } catch (err) {
    console.error('[books/expenses/summary]', err);
    return apiError('Internal server error', 500);
  }
}
