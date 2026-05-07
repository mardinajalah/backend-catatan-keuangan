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
  title: transaction.title || transaction.description || '',
  category: transaction.category || 'Lainnya',
  note: transaction.note || '',
  amount: transaction.amount,
  description: transaction.title || transaction.description || '',
  date: timestampToIso(transaction.date),
  createdAt: timestampToIso(transaction.createdAt),
  updatedAt: timestampToIso(transaction.updatedAt),
});

export const findTransactionsByUserId = async (userId: string): Promise<Transaction[]> => {
  const snapshot = await transactionsCollection.where('userId', '==', userId).get();

  return snapshot.docs
    .map((doc) => doc.data() as Transaction)
    .sort((a, b) => b.date.toMillis() - a.date.toMillis());
};

export const createTransaction = async (data: {
  userId: string;
  type: TransactionType;
  amount: number;
  title: string;
  category: string;
  note: string;
  date: Date;
}): Promise<Transaction> => {
  const id = randomUUID();
  const now = Timestamp.now();
  const transaction: Transaction = {
    id,
    userId: data.userId,
    type: data.type,
    amount: data.amount,
    title: data.title,
    category: data.category,
    note: data.note,
    description: data.title,
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
  data: Partial<Pick<Transaction, 'type' | 'amount' | 'title' | 'category' | 'note' | 'description' | 'date'>>
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
