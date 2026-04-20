import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let superadminApp: App;

function getSuperadminApp(): App {
  if (superadminApp) return superadminApp;

  const existing = getApps().find((app) => app.name === 'superadmin');
  if (existing) {
    superadminApp = existing;
    return superadminApp;
  }

  superadminApp = initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_SUPERADMIN_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_SUPERADMIN_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_SUPERADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n')
      })
    },
    'superadmin'
  );

  return superadminApp;
}

export const superadminAuth = () => getAuth(getSuperadminApp());
export const superadminDb = () =>
  getFirestore(getSuperadminApp(), process.env.FIREBASE_SUPERADMIN_DATABASE_ID ?? '(default)');
