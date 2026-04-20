import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

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
        projectId: process.env.FIREBASE_WEBSITE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_WEBSITE_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_WEBSITE_PRIVATE_KEY!.replace(/\\n/g, '\n')
      }),
      storageBucket: process.env.FIREBASE_WEBSITE_STORAGE_BUCKET!
    },
    'website'
  );

  return websiteApp;
}

export const websiteDb = () => getFirestore(getWebsiteApp());
export const websiteStorage = () => getStorage(getWebsiteApp());
