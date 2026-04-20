import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_SUPERADMIN_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_SUPERADMIN_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_SUPERADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n')
  })
});

async function seed() {
  const auth = getAuth(app);
  const db = getFirestore(app);

  const email = 'tirtha@dgentechnologies.com';
  const user = await auth.createUser({
    email,
    password: 'ChangeThisImmediately!'
  });

  await db.collection('superadmin-users').doc(user.uid).set({
    email,
    name: 'Tirthankar',
    role: 'super_admin',
    createdAt: new Date()
  });

  console.log('Done. Change the password immediately.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
