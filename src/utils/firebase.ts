import { cert, getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID || 'catatan-keuangan-985ec';
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

export const getFirebaseAdminConfigStatus = () => ({
  projectIdConfigured: Boolean(firebaseProjectId),
  clientEmailConfigured: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
  privateKeyConfigured: Boolean(process.env.FIREBASE_PRIVATE_KEY),
  usingApplicationDefault: !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY,
});

if (!getApps().length) {
  if (process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    initializeApp({
      credential: cert({
        projectId: firebaseProjectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
      projectId: firebaseProjectId,
    });
  } else {
    console.warn('Firebase Admin credentials are incomplete. Falling back to application default credentials.');
    initializeApp({
      credential: applicationDefault(),
      projectId: firebaseProjectId,
    });
  }
}
