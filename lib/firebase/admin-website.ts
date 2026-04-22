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

  websiteApp = initializeApp(
    {
      credential: cert({
        projectId: requireEnv('FIREBASE_WEBSITE_PROJECT_ID'),
        clientEmail: requireEnv('FIREBASE_WEBSITE_CLIENT_EMAIL'),
        privateKey: requireEnv('FIREBASE_WEBSITE_PRIVATE_KEY').replace(/\\n/g, '\n')
      }),
      storageBucket: requireEnv('FIREBASE_WEBSITE_STORAGE_BUCKET')
    },
    'website'
  );

  return websiteApp;
}

export const websiteDb = () =>
  getFirestore(getWebsiteApp(), process.env.FIREBASE_WEBSITE_DATABASE_ID ?? '(default)');
export const websiteStorage = () => getStorage(getWebsiteApp());
