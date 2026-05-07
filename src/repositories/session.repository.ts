import { createHash, randomUUID } from 'crypto';
import { db, Timestamp } from '../utils/firestore';
import { Session } from '../types/models';

const sessionsCollection = db.collection('sessions');

const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');

const sessionFromDoc = (doc: FirebaseFirestore.DocumentSnapshot): Session | null => {
  if (!doc.exists) {
    return null;
  }

  return doc.data() as Session;
};

export const createSession = async (data: {
  userId: string;
  token: string;
  expiresAt?: Date | null;
}): Promise<Session> => {
  const tokenHash = hashToken(data.token);
  const session: Session = {
    id: randomUUID(),
    userId: data.userId,
    tokenHash,
    createdAt: Timestamp.now(),
    expiresAt: data.expiresAt ? Timestamp.fromDate(data.expiresAt) : null,
  };

  await sessionsCollection.doc(tokenHash).set(session);

  return session;
};

export const findSessionByToken = async (token: string): Promise<Session | null> => {
  const doc = await sessionsCollection.doc(hashToken(token)).get();

  return sessionFromDoc(doc);
};

export const deleteSessionByToken = async (token: string): Promise<void> => {
  await sessionsCollection.doc(hashToken(token)).delete();
};
