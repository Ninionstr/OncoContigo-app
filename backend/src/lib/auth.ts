import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from './constants.js';

export interface TokenPayload {
  sub: string;
  role: Role;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

const ACCESS_SECRET = process.env.JWT_SECRET ?? 'dev-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret';

export function issueTokens(payload: TokenPayload) {
  return {
    accessToken: jwt.sign(payload, ACCESS_SECRET, { expiresIn: '12h' }),
    refreshToken: jwt.sign({ sub: payload.sub }, REFRESH_SECRET, { expiresIn: '7d' }),
  };
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as { sub: string };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Sesión no válida. Inicia sesión nuevamente.' });
  }
  try {
    const decoded = jwt.verify(header.slice(7), ACCESS_SECRET) as TokenPayload;
    req.user = { sub: decoded.sub, role: decoded.role, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({ error: 'Tu sesión expiró. Inicia sesión nuevamente.' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permisos para esta acción.' });
    }
    next();
  };
}
