import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

export const authenticateToken = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan' });
  }

  try {
    // Verifikasi JWT secara dasar
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    
    // Verifikasi apakah token masih ada di tabel Session (untuk handle logout)
    const session = await prisma.session.findUnique({
      where: { token }
    });

    if (!session) {
      return res.status(401).json({ message: 'Sesi telah berakhir atau sudah logout. Silakan login kembali.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
  }
};
