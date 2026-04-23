// All databases share the same Firebase project — reuse the superadmin app.
import { getDatabase } from 'firebase-admin/database';
import { getFirestore } from 'firebase-admin/firestore';
import { getSuperadminApp } from '@/lib/firebase/admin-superadmin';

// Default to 'access' so this works even if the env var is not set on Vercel.
export const accessDb = () =>
  getFirestore(getSuperadminApp(), process.env.FIREBASE_ACCESS_DATABASE_ID?.trim() ?? 'access');

export const accessRealtimeDb = () => {
  const databaseURL = process.env.FIREBASE_ACCESS_DATABASE_URL?.trim();
  if (!databaseURL) {
    throw new Error('[env] FIREBASE_ACCESS_DATABASE_URL is not set');
  }
  return getDatabase(getSuperadminApp());
};
