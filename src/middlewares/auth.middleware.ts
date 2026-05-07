import { Request, Response, NextFunction } from 'express';
import { auth } from '../utils/firebaseAuth';

export const authenticateToken = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan' });
  }

  try {
    const decoded = await auth.verifyIdToken(token);

    req.user = {
      userId: decoded.uid,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (err) {
    console.error('Firebase auth error:', {
      message: err instanceof Error ? err.message : String(err),
      hasAuthorizationHeader: Boolean(authHeader),
    });
    return res.status(403).json({ message: 'Firebase ID token tidak valid atau sudah kadaluarsa' });
  }
};
