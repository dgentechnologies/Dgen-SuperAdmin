import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getFirestore } from 'firebase-admin/firestore';

let accessApp: App;

function getAccessApp(): App {
  if (accessApp) return accessApp;

  const existing = getApps().find((app) => app.name === 'access');
  if (existing) {
    accessApp = existing;
    return accessApp;
  }

  accessApp = initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_ACCESS_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ACCESS_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_ACCESS_PRIVATE_KEY!.replace(/\\n/g, '\n')
      }),
      databaseURL: process.env.FIREBASE_ACCESS_DATABASE_URL!
    },
    'access'
  );

  return accessApp;
}

export const accessDb = () => getFirestore(getAccessApp());
export const accessRealtimeDb = () => getDatabase(getAccessApp());
