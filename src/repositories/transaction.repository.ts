import { randomUUID } from 'crypto';
import { db, Timestamp, timestampToIso } from '../utils/firestore';
import { Transaction, TransactionResponse, TransactionType } from '../types/models';

const transactionsCollection = db.collection('transactions');

const transactionFromDoc = (doc: FirebaseFirestore.DocumentSnapshot): Transaction | null => {
  if (!doc.exists) {
    return null;
  }

  return doc.data() as Transaction;
};

export const toTransactionResponse = (transaction: Transaction): TransactionResponse => ({
  id: transaction.id,
  userId: transaction.userId,
  type: transaction.type,
  amount: transaction.amount,
  description: transaction.description,
  date: timestampToIso(transaction.date),
  createdAt: timestampToIso(transaction.createdAt),
  updatedAt: timestampToIso(transaction.updatedAt),
});

export const findTransactionsByUserId = async (userId: string): Promise<Transaction[]> => {
  const snapshot = await transactionsCollection
    .where('userId', '==', userId)
    .orderBy('date', 'desc')
    .get();

  return snapshot.docs.map((doc) => doc.data() as Transaction);
};

export const createTransaction = async (data: {
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: Date;
}): Promise<Transaction> => {
  const id = randomUUID();
  const now = Timestamp.now();
  const transaction: Transaction = {
    id,
    userId: data.userId,
    type: data.type,
    amount: data.amount,
    description: data.description,
    date: Timestamp.fromDate(data.date),
    createdAt: now,
    updatedAt: now,
  };

  await transactionsCollection.doc(id).set(transaction);

  return transaction;
};

export const findTransactionByIdAndUserId = async (
  id: string,
  userId: string
): Promise<Transaction | null> => {
  const doc = await transactionsCollection.doc(id).get();
  const transaction = transactionFromDoc(doc);

  if (!transaction || transaction.userId !== userId) {
    return null;
  }

  return transaction;
};

export const updateTransaction = async (
  id: string,
  data: Partial<Pick<Transaction, 'type' | 'amount' | 'description' | 'date'>>
): Promise<Transaction | null> => {
  const docRef = transactionsCollection.doc(id);
  const currentDoc = await docRef.get();
  const currentTransaction = transactionFromDoc(currentDoc);

  if (!currentTransaction) {
    return null;
  }

  const updatedData = {
    ...data,
    updatedAt: Timestamp.now(),
  };

  await docRef.update(updatedData);

  const updatedDoc = await docRef.get();

  return transactionFromDoc(updatedDoc);
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await transactionsCollection.doc(id).delete();
};
