import { Request, Response } from 'express';
import { Timestamp } from '../utils/firestore';
import { TransactionType } from '../types/models';
import {
  createTransaction as createTransactionRecord,
  deleteTransaction as deleteTransactionRecord,
  findTransactionByIdAndUserId,
  findTransactionsByUserId,
  toTransactionResponse,
  updateTransaction as updateTransactionRecord,
} from '../repositories/transaction.repository';

const transactionTypes: TransactionType[] = ['INCOME', 'EXPENSE'];

const isTransactionType = (value: unknown): value is TransactionType =>
  typeof value === 'string' && transactionTypes.includes(value as TransactionType);

export const getTransactions = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const transactions = await findTransactionsByUserId(userId);

    res.json(transactions.map(toTransactionResponse));
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const createTransaction = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { type, amount, description, date } = req.body;

    if (!type || amount === undefined || amount === null || !description || !date) {
      res.status(400).json({ message: 'Semua field (type, amount, description, date) wajib diisi' });
      return;
    }

    if (!isTransactionType(type)) {
      res.status(400).json({ message: 'Type transaksi harus INCOME atau EXPENSE' });
      return;
    }

    const parsedAmount = Number(amount);
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedAmount) || Number.isNaN(parsedDate.getTime())) {
      res.status(400).json({ message: 'Amount atau date tidak valid' });
      return;
    }

    const transaction = await createTransactionRecord({
      userId,
      type,
      amount: parsedAmount,
      description,
      date: parsedDate,
    });

    res.status(201).json(toTransactionResponse(transaction));
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const updateTransaction = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { type, amount, description, date } = req.body;

    const existingTransaction = await findTransactionByIdAndUserId(id, userId);

    if (!existingTransaction) {
      res.status(404).json({ message: 'Transaksi tidak ditemukan' });
      return;
    }

    if (type && !isTransactionType(type)) {
      res.status(400).json({ message: 'Type transaksi harus INCOME atau EXPENSE' });
      return;
    }

    const parsedAmount = amount !== undefined && amount !== null ? Number(amount) : existingTransaction.amount;
    const parsedDate = date ? new Date(date) : existingTransaction.date.toDate();

    if (Number.isNaN(parsedAmount) || Number.isNaN(parsedDate.getTime())) {
      res.status(400).json({ message: 'Amount atau date tidak valid' });
      return;
    }

    const updatedTransaction = await updateTransactionRecord(id, {
      type: type || existingTransaction.type,
      amount: parsedAmount,
      description: description || existingTransaction.description,
      date: Timestamp.fromDate(parsedDate),
    });

    if (!updatedTransaction) {
      res.status(404).json({ message: 'Transaksi tidak ditemukan' });
      return;
    }

    res.json(toTransactionResponse(updatedTransaction));
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const deleteTransaction = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const existingTransaction = await findTransactionByIdAndUserId(id, userId);

    if (!existingTransaction) {
      res.status(404).json({ message: 'Transaksi tidak ditemukan' });
      return;
    }

    await deleteTransactionRecord(id);

    res.json({ message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
