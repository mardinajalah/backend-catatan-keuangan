import { Timestamp } from 'firebase-admin/firestore';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface User {
  id: string;
  uid: string;
  name: string;
  email: string;
  authProvider: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  title: string;
  category: string;
  note: string;
  amount: number;
  description?: string;
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TransactionResponse {
  id: string;
  userId: string;
  type: TransactionType;
  title: string;
  category: string;
  note: string;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}
