import express from 'express';
import path from 'path';
import fs from 'fs';
import { db } from './src/db/index.ts';
import { students } from './src/db/schema.ts';
import { requireAuth, AuthRequest } from './src/db/auth-middleware.ts';
import { seedInitialStudents } from './src/db/seed.ts';
import { signToken } from './src/db/jwt.ts';
import { eq } from 'drizzle-orm';

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Middleware to parse JSON
  app.use(express.json());

  // Run the initial seeding in background so that it doesn't block server startup or healthchecks on network delays
  seedInitialStudents().catch((err) => {
    console.error('Erro na semeadura inicial do banco de dados (o servidor continuará ativo):', err);
  });

  // API Route: Custom Login (Admin or Student)
  app.post('/api/auth/login', async (req, res) => {
    const { type, username, password, cpf } = req.body;

    try {
      if (type === 'admin') {
        const isAdmin = (username === 'admin' && password === 'admin123');
        const isNewAdmin = (username === 'LNASCIMENTO' && password === '123456');

        if (isAdmin || isNewAdmin) {
          const token = signToken({ id: 0, role: 'admin' });
          return res.json({
            token,
            user: {
              role: 'admin',
              email: 'admin@ctleandronascimento.com.br',
              name: username,
            }
          });
        }
        return res.status(401).json({ error: 'Usuário ou senha inválidos.' });
      } else if (type === 'student') {
        if (!cpf) {
          return res.status(400).json({ error: 'CPF é obrigatório.' });
        }
        const sanitizedCpf = cpf.replace(/\D/g, '');
        const [student] = await db.select().from(students).where(eq(students.responsibleCpf, sanitizedCpf));

        if (!student) {
          return res.status(404).json({ error: 'Nenhum aluno encontrado com este CPF.' });
        }

        const token = signToken({ id: student.id, role: 'student', cpf: sanitizedCpf });
        return res.json({
          token,
          user: {
            role: 'student',
            name: student.name,
            id: student.id,
          }
        });
      } else {
        return res.status(400).json({ error: 'Tipo de login inválido.' });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro interno ao realizar login.' });
    }
  });

  // API Route: Get user role and details
  app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res) => {
    try {
      res.json({
        user: req.dbUser,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Erro ao carregar dados do usuário.' });
    }
  });

  // API Route: Link student profile via CPF (Kept for compatibility, returns success or binds)
  app.post('/api/students/link', requireAuth, async (req: AuthRequest, res) => {
    const { cpf } = req.body;
    if (!cpf) {
      return res.status(400).json({ error: 'CPF é obrigatório para vinculação.' });
    }

    try {
      const sanitizedCpf = cpf.replace(/\D/g, '');
      const [student] = await db.select().from(students).where(eq(students.responsibleCpf, sanitizedCpf));
      
      if (!student) {
        return res.status(404).json({ error: 'Aluno não encontrado com o CPF informado.' });
      }

      res.json({
        success: true,
        message: 'Aluno vinculado com sucesso!',
        student: {
          ...student,
          fee: parseFloat(student.fee),
        },
      });
    } catch (error: any) {
      console.error('Error linking CPF:', error);
      res.status(500).json({ error: 'Erro interno ao vincular aluno.' });
    }
  });

  // API Route: Get student list
  app.get('/api/students', requireAuth, async (req: AuthRequest, res) => {
    try {
      const role = req.dbUser?.role;

      if (role === 'admin') {
        const allStudents = await db.select().from(students);
        const formatted = allStudents.map(s => ({
          ...s,
          fee: parseFloat(s.fee),
        }));
        return res.json(formatted);
      } else {
        // Return only the student profile that represents this logged in student
        const linkedStudents = await db.select().from(students).where(eq(students.id, req.dbUser!.id));
        const formatted = linkedStudents.map(s => ({
          ...s,
          fee: parseFloat(s.fee),
        }));
        return res.json(formatted);
      }
    } catch (error: any) {
      console.error('Error fetching students:', error);
      res.status(500).json({ error: 'Erro ao buscar alunos.' });
    }
  });

  // API Route: Add a new student (Admin only)
  app.post('/api/students', requireAuth, async (req: AuthRequest, res) => {
    if (req.dbUser?.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado: Administradores apenas.' });
    }

    const { name, age, guardian, responsibleCpf, fee, status, dueDate, phone, startDate, paymentHistory } = req.body;

    try {
      const sanitizedCpf = responsibleCpf.replace(/\D/g, '');

      const [newStudent] = await db.insert(students)
        .values({
          name,
          age: parseInt(age, 10),
          guardian,
          responsibleCpf: sanitizedCpf,
          fee: fee.toString(),
          status,
          dueDate: new Date(dueDate),
          phone,
          startDate: new Date(startDate),
          paymentHistory: paymentHistory || {},
        })
        .returning();

      res.status(210).json({
        ...newStudent,
        fee: parseFloat(newStudent.fee),
      });
    } catch (error: any) {
      console.error('Error adding student:', error);
      res.status(500).json({ error: 'Erro ao cadastrar aluno. CPF já pode estar cadastrado.' });
    }
  });

  // API Route: Update a student (Admin only)
  app.put('/api/students/:id', requireAuth, async (req: AuthRequest, res) => {
    if (req.dbUser?.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado: Administradores apenas.' });
    }

    const id = parseInt(req.params.id as string, 10);
    const { name, age, guardian, responsibleCpf, fee, status, dueDate, phone, startDate, paymentHistory } = req.body;

    try {
      const sanitizedCpf = responsibleCpf.replace(/\D/g, '');

      const [updated] = await db.update(students)
        .set({
          name,
          age: parseInt(age, 10),
          guardian,
          responsibleCpf: sanitizedCpf,
          fee: fee.toString(),
          status,
          dueDate: new Date(dueDate),
          phone,
          startDate: new Date(startDate),
          paymentHistory: paymentHistory || {},
        })
        .where(eq(students.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: 'Aluno não encontrado.' });
      }

      res.json({
        ...updated,
        fee: parseFloat(updated.fee),
      });
    } catch (error: any) {
      console.error('Error updating student:', error);
      res.status(500).json({ error: 'Erro ao atualizar dados do aluno.' });
    }
  });

  // API Route: Delete a student (Admin only)
  app.delete('/api/students/:id', requireAuth, async (req: AuthRequest, res) => {
    if (req.dbUser?.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado: Administradores apenas.' });
    }

    const id = parseInt(req.params.id as string, 10);

    try {
      const [deleted] = await db.delete(students)
        .where(eq(students.id, id))
        .returning();

      if (!deleted) {
        return res.status(404).json({ error: 'Aluno não encontrado.' });
      }

      res.json({ success: true, id });
    } catch (error: any) {
      console.error('Error deleting student:', error);
      res.status(500).json({ error: 'Erro ao deletar aluno.' });
    }
  });

  // API Route: Toggle payment history month (Admin only)
  app.post('/api/students/:id/payment', requireAuth, async (req: AuthRequest, res) => {
    if (req.dbUser?.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado: Administradores apenas.' });
    }

    const id = parseInt(req.params.id as string, 10);
    const { year, monthIndex } = req.body;

    try {
      const [student] = await db.select().from(students).where(eq(students.id, id));
      if (!student) {
        return res.status(404).json({ error: 'Aluno não encontrado.' });
      }

      const history = { ...student.paymentHistory };
      if (!history[year]) history[year] = [];

      if (history[year].includes(monthIndex)) {
        history[year] = history[year].filter(m => m !== monthIndex);
      } else {
        history[year] = [...history[year], monthIndex].sort((a, b) => a - b);
      }

      // Automatically compute current month's status
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      let newStatus = student.status;
      if (year === currentYear && monthIndex === currentMonth) {
        newStatus = history[year].includes(monthIndex) ? 'Pago' : 'Pendente';
      }

      const [updated] = await db.update(students)
        .set({
          paymentHistory: history,
          status: newStatus,
        })
        .where(eq(students.id, id))
        .returning();

      res.json({
        ...updated,
        fee: parseFloat(updated.fee),
      });
    } catch (error: any) {
      console.error('Error updating payment history:', error);
      res.status(500).json({ error: 'Erro ao atualizar histórico de pagamento.' });
    }
  });

  // Vite integration middleware
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
