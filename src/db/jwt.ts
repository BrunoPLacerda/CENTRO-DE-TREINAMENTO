import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ct-leandro-nascimento-super-secret-key-12345';

export function signToken(payload: { id: number; role: 'admin' | 'student'; cpf?: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): { id: number; role: 'admin' | 'student'; cpf?: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (err) {
    return null;
  }
}
