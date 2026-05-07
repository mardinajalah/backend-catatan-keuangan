import { cert, getApps, initializeApp, applicationDefault } from 'firebase-admin/app';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID || 'catatan-keuangan-985ec';
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

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
    initializeApp({
      credential: applicationDefault(),
      projectId: firebaseProjectId,
    });
  }
}
