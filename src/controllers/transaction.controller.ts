import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getTransactions = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const createTransaction = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { type, amount, description, date } = req.body;

    if (!type || !amount || !description || !date) {
      res.status(400).json({ message: 'Semua field (type, amount, description, date) wajib diisi' });
      return;
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type,
        amount: parseFloat(amount),
        description,
        date: new Date(date)
      }
    });

    res.status(201).json(transaction);
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

    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!existingTransaction) {
      res.status(404).json({ message: 'Transaksi tidak ditemukan' });
      return;
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        type: type || existingTransaction.type,
        amount: amount ? parseFloat(amount) : existingTransaction.amount,
        description: description || existingTransaction.description,
        date: date ? new Date(date) : existingTransaction.date
      }
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const deleteTransaction = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!existingTransaction) {
      res.status(404).json({ message: 'Transaksi tidak ditemukan' });
      return;
    }

    await prisma.transaction.delete({
      where: { id }
    });

    res.json({ message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
