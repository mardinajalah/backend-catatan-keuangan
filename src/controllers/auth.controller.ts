import { Request, Response } from 'express';
import {
  createOrUpdateUserFromFirebaseAuth,
  findUserById,
  toPublicUser,
} from '../repositories/user.repository';

export const syncProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const email = req.user.email;
    const name = req.body.name || req.user.name || '';

    if (!userId || !email) {
      res.status(400).json({ message: 'Firebase token tidak memiliki data user yang lengkap' });
      return;
    }

    const user = await createOrUpdateUserFromFirebaseAuth({
      uid: userId,
      name,
      email,
      authProvider: 'password',
    });

    res.json({ message: 'Profile berhasil disinkronkan', user: toPublicUser(user) });
  } catch (error) {
    console.error('Sync profile error:', {
      message: error instanceof Error ? error.message : String(error),
      userId: req.user?.userId,
      email: req.user?.email,
    });
    res.status(500).json({
      message: 'Gagal sinkron profile ke backend. Periksa konfigurasi Firebase Admin di Vercel.',
    });
  }
};

export const getProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.userId;
    const user = await findUserById(userId);

    if (!user) {
      res.status(404).json({ message: 'User tidak ditemukan' });
      return;
    }

    res.json({ user: toPublicUser(user) });
  } catch (error) {
    console.error('Get profile error:', {
      message: error instanceof Error ? error.message : String(error),
      userId: req.user?.userId,
    });
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};
