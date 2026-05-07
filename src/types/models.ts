import { Timestamp } from 'firebase-admin/firestore';

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Session {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: Timestamp;
  expiresAt: Timestamp | null;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TransactionResponse {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}
