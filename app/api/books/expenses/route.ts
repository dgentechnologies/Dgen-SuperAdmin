import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { booksDb } from '@/lib/firebase/admin-books';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    const month = req.nextUrl.searchParams.get('month');

    let query = booksDb().collection('expenses');
    if (month) {
      query = query.where('month', '==', month);
    }

    const snap = await query.orderBy('createdAt', 'desc').limit(500).get();
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return apiSuccess(data);
  } catch (err) {
    console.error('[books/expenses]', err);
    return apiError('Internal server error', 500);
  }
}
