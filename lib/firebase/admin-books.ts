import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { requireEnv } from '@/lib/utils/env';

let booksApp: App;

function getBooksApp(): App {
  if (booksApp) return booksApp;

  const existing = getApps().find((app) => app.name === 'books');
  if (existing) {
    booksApp = existing;
    return booksApp;
  }

  const projectId = requireEnv('FIREBASE_BOOKS_PROJECT_ID').trim();
  const clientEmail = requireEnv('FIREBASE_BOOKS_CLIENT_EMAIL').trim();
  const privateKeyRaw = requireEnv('FIREBASE_BOOKS_PRIVATE_KEY').trim();

  booksApp = initializeApp(
    {
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKeyRaw.replace(/\\n/g, '\n')
      })
    },
    'books'
  );

  return booksApp;
}

export const booksDb = () =>
  getFirestore(getBooksApp(), process.env.FIREBASE_BOOKS_DATABASE_ID ?? '(default)');
