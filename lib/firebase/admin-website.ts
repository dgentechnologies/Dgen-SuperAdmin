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

  const projectId = requireEnv('FIREBASE_WEBSITE_PROJECT_ID').trim();
  const clientEmail = requireEnv('FIREBASE_WEBSITE_CLIENT_EMAIL').trim();
  const privateKeyRaw = requireEnv('FIREBASE_WEBSITE_PRIVATE_KEY').trim();
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

export const websiteDb = () => {
  const dbId = process.env.FIREBASE_WEBSITE_DATABASE_ID?.trim() || '(default)';
  try {
    return getFirestore(getWebsiteApp(), dbId);
  } catch {
    return getFirestore(getWebsiteApp(), '(default)');
  }
};
export const websiteStorage = () => getStorage(getWebsiteApp());
