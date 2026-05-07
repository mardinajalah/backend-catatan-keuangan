import { randomUUID } from 'crypto';
import { db, Timestamp, timestampToIso } from '../utils/firestore';
import { PublicUser, User } from '../types/models';

const usersCollection = db.collection('users');

const userFromDoc = (doc: FirebaseFirestore.DocumentSnapshot): User | null => {
  if (!doc.exists) {
    return null;
  }

  return doc.data() as User;
};

export const toPublicUser = (user: User): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: timestampToIso(user.createdAt),
});

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const snapshot = await usersCollection.where('email', '==', email).limit(1).get();
  const doc = snapshot.docs[0];

  return doc ? (doc.data() as User) : null;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const doc = await usersCollection.doc(id).get();

  return userFromDoc(doc);
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
}): Promise<User> => {
  const id = randomUUID();
  const now = Timestamp.now();
  const user: User = {
    id,
    name: data.name,
    email: data.email,
    password: data.password,
    createdAt: now,
    updatedAt: now,
  };

  await usersCollection.doc(id).set(user);

  return user;
};
