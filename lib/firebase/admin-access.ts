import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getFirestore } from 'firebase-admin/firestore';
import { requireEnv } from '@/lib/utils/env';

let accessApp: App;

function getAccessApp(): App {
  if (accessApp) return accessApp;

  const existing = getApps().find((app) => app.name === 'access');
  if (existing) {
    accessApp = existing;
    return accessApp;
  }

  const projectId =
    process.env.FIREBASE_ACCESS_PROJECT_ID?.trim() || requireEnv('FIREBASE_SUPERADMIN_PROJECT_ID');
  const clientEmail =
    process.env.FIREBASE_ACCESS_CLIENT_EMAIL?.trim() || requireEnv('FIREBASE_SUPERADMIN_CLIENT_EMAIL');
  const privateKeyRaw =
    process.env.FIREBASE_ACCESS_PRIVATE_KEY?.trim() || requireEnv('FIREBASE_SUPERADMIN_PRIVATE_KEY');
  const databaseURL = process.env.FIREBASE_ACCESS_DATABASE_URL?.trim();

  accessApp = initializeApp(
    {
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKeyRaw.replace(/\\n/g, '\n')
      }),
      ...(databaseURL ? { databaseURL } : {})
    },
    'access'
  );

  return accessApp;
}

export const accessDb = () =>
  getFirestore(getAccessApp(), process.env.FIREBASE_ACCESS_DATABASE_ID ?? '(default)');

export const accessRealtimeDb = () => {
  const databaseURL = process.env.FIREBASE_ACCESS_DATABASE_URL?.trim();
  if (!databaseURL) {
    throw new Error('[env] Missing required environment variable: FIREBASE_ACCESS_DATABASE_URL');
  }
  return getDatabase(getAccessApp());
};
