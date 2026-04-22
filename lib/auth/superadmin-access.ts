import { superadminDb } from '@/lib/firebase/admin-superadmin';
import { getSuperadminEnvUidAllowlist } from '@/lib/utils/env';

interface SuperadminUserDoc {
  disabled?: boolean;
  active?: boolean;
}

function isAllowedByEnvironment(uid: string): boolean {
  return getSuperadminEnvUidAllowlist().has(uid);
}

export async function isAuthorizedSuperadmin(uid: string): Promise<boolean> {
  try {
    const adminDoc = await superadminDb().collection('superadmin-users').doc(uid).get();

    if (adminDoc.exists) {
      const data = (adminDoc.data() ?? {}) as SuperadminUserDoc;
      if (data.disabled === true || data.active === false) {
        return false;
      }
      return true;
    }

    return isAllowedByEnvironment(uid);
  } catch (err) {
    console.error('[auth/superadmin-access] Firestore check failed, falling back to env allowlist', err);
    return isAllowedByEnvironment(uid);
  }
}
