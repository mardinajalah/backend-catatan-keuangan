import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findSessionByToken, deleteSessionByToken } from '../repositories/session.repository';

export const authenticateToken = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const session = await findSessionByToken(token);

    if (!session) {
      return res.status(401).json({ message: 'Sesi telah berakhir atau sudah logout. Silakan login kembali.' });
    }

    if (session.expiresAt && session.expiresAt.toDate().getTime() <= Date.now()) {
      await deleteSessionByToken(token);
      return res.status(401).json({ message: 'Sesi telah berakhir atau sudah logout. Silakan login kembali.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluarsa' });
  }
};
