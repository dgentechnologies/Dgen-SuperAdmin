import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let booksApp: App | null = null;
let booksAppInitFailed = false;

function getBooksApp(): App | null {
  if (booksApp) return booksApp;
  if (booksAppInitFailed) return null;

  const existing = getApps().find((app) => app.name === 'books');
  if (existing) {
    booksApp = existing;
    return booksApp;
  }

  const projectId = process.env.FIREBASE_BOOKS_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_BOOKS_CLIENT_EMAIL?.trim();
  const privateKeyRaw = process.env.FIREBASE_BOOKS_PRIVATE_KEY?.trim();

  if (!projectId || !clientEmail || !privateKeyRaw) {
    console.warn('[admin-books] Missing Firebase Books env vars – books module disabled');
    booksAppInitFailed = true;
    return null;
  }

  try {
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
  } catch (err) {
    console.error('[admin-books] Firebase init failed:', err);
    booksAppInitFailed = true;
    return null;
  }
}

export const booksDb = (): FirebaseFirestore.Firestore | null => {
  const app = getBooksApp();
  if (!app) return null;

  const dbId = process.env.FIREBASE_BOOKS_DATABASE_ID?.trim() || '(default)';
  try {
    return getFirestore(app, dbId);
  } catch {
    try {
      return getFirestore(app, '(default)');
    } catch {
      return null;
    }
  }
};
