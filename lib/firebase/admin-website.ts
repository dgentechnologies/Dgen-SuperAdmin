import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { requireEnv } from '@/lib/utils/env';

let websiteApp: App;

function getWebsiteApp(): App {
  if (websiteApp) return websiteApp;

  const existing = getApps().find((app) => app.name === 'website');
  if (existing) {
    websiteApp = existing;
    return websiteApp;
  }

  const projectId =
    process.env.FIREBASE_WEBSITE_PROJECT_ID?.trim() || requireEnv('FIREBASE_SUPERADMIN_PROJECT_ID');
  const clientEmail =
    process.env.FIREBASE_WEBSITE_CLIENT_EMAIL?.trim() || requireEnv('FIREBASE_SUPERADMIN_CLIENT_EMAIL');
  const privateKeyRaw =
    process.env.FIREBASE_WEBSITE_PRIVATE_KEY?.trim() || requireEnv('FIREBASE_SUPERADMIN_PRIVATE_KEY');
  const storageBucket =
    process.env.FIREBASE_WEBSITE_STORAGE_BUCKET?.trim() || `${projectId}.firebasestorage.app`;

  websiteApp = initializeApp(
    {
      credential: cert({
        projectId,
        clientEmail,
        privateKey: privateKeyRaw.replace(/\\n/g, '\n')
      }),
      storageBucket
    },
    'website'
  );

  return websiteApp;
}

export const websiteDb = () =>
  getFirestore(getWebsiteApp(), process.env.FIREBASE_WEBSITE_DATABASE_ID ?? '(default)');
export const websiteStorage = () => getStorage(getWebsiteApp());
