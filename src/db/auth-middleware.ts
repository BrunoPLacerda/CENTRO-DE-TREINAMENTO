import { Request, Response, NextFunction } from 'express';
import { verifyToken } from './jwt.ts';
import { db } from './index.ts';
import { students } from './schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  dbUser?: {
    id: number;
    role: 'admin' | 'student';
    email: string;
    uid?: string;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autorizado: Token ausente' });
  }

  const token = authHeader.split('Bearer ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Não autorizado: Token inválido ou expirado' });
  }

  try {
    if (decoded.role === 'admin') {
      req.dbUser = {
        id: 0,
        role: 'admin',
        email: 'admin@ctleandronascimento.com.br',
        uid: 'admin',
      };
    } else {
      // Find student
      const [student] = await db.select().from(students).where(eq(students.id, decoded.id));
      if (!student) {
        return res.status(401).json({ error: 'Aluno não encontrado' });
      }

      req.dbUser = {
        id: student.id,
        role: 'student',
        email: '',
        uid: student.responsibleCpf,
      };
    }
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({ error: 'Erro interno na autenticação' });
  }
};
