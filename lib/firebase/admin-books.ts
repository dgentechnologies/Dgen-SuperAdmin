import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let booksApp: App;

function getBooksApp(): App {
  if (booksApp) return booksApp;

  const existing = getApps().find((app) => app.name === 'books');
  if (existing) {
    booksApp = existing;
    return booksApp;
  }

  booksApp = initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_BOOKS_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_BOOKS_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_BOOKS_PRIVATE_KEY!.replace(/\\n/g, '\n')
      })
    },
    'books'
  );

  return booksApp;
}

export const booksDb = () => getFirestore(getBooksApp());
