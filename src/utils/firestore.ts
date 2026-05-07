import './firebase';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

export const db = getFirestore();
export { Timestamp };

export const timestampToIso = (value: Timestamp): string => value.toDate().toISOString();
