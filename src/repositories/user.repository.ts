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

export const createOrUpdateUserFromFirebaseAuth = async (data: {
  uid: string;
  name: string;
  email: string;
  authProvider?: string;
}): Promise<User> => {
  const currentUser = await findUserById(data.uid);
  const now = Timestamp.now();

  if (currentUser) {
    const updatedUser: User = {
      ...currentUser,
      uid: currentUser.uid || data.uid,
      name: data.name || currentUser.name,
      email: data.email || currentUser.email,
      authProvider: data.authProvider || currentUser.authProvider || 'password',
      updatedAt: now,
    };

    await usersCollection.doc(data.uid).set(updatedUser, { merge: true });

    return updatedUser;
  }

  const user: User = {
    id: data.uid,
    uid: data.uid,
    name: data.name,
    email: data.email,
    authProvider: data.authProvider || 'password',
    createdAt: now,
    updatedAt: now,
  };

  await usersCollection.doc(data.uid).set(user);

  return user;
};
