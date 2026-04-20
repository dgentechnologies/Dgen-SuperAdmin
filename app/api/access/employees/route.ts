import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth/verify-session';
import { accessDb } from '@/lib/firebase/admin-access';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function GET(req: NextRequest) {
  const session = await verifySession();
  if (!session) return apiError('Unauthorized', 401);

  try {
    const status = req.nextUrl.searchParams.get('status');
    let query: FirebaseFirestore.Query = accessDb().collection('employees');

    if (status) {
      query = query.where('status', '==', status);
    }

    const snap = await query.get();
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return apiSuccess(data);
  } catch (err) {
    console.error('[access/employees]', err);
    return apiError('Internal server error', 500);
  }
}
