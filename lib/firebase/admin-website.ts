// All databases share the same Firebase project — reuse the superadmin app.
// Only the named Firestore database ID differs per product.
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getSuperadminApp } from '@/lib/firebase/admin-superadmin';

// Default to 'website' so this works even if the env var is not set on Vercel.
export const websiteDb = () =>
  getFirestore(getSuperadminApp(), process.env.FIREBASE_WEBSITE_DATABASE_ID?.trim() ?? 'website');

export const websiteStorage = () => getStorage(getSuperadminApp());
