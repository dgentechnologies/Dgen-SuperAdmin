// All databases share the same Firebase project — reuse the superadmin app.
import { getFirestore } from 'firebase-admin/firestore';
import { getSuperadminApp } from '@/lib/firebase/admin-superadmin';

// Default to 'books' so this works even if the env var is not set on Vercel.
export const booksDb = () =>
  getFirestore(getSuperadminApp(), process.env.FIREBASE_BOOKS_DATABASE_ID?.trim() ?? 'books');
