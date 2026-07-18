import { db } from './index.ts';
import { students } from './schema.ts';
import { count } from 'drizzle-orm';

export async function seedInitialStudents() {
  try {
    const [existingCount] = await db.select({ val: count() }).from(students);
    if (existingCount.val > 0) {
      console.log('Database already has students. Skipping seeding.');
      return;
    }

    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    console.log('Seeding initial students into Postgres...');
    
    await db.insert(students).values([
      {
        name: 'João Silva',
        age: 28,
        guardian: 'Próprio',
        responsibleCpf: '12345678901',
        fee: '150.00',
        status: 'Pago',
        dueDate: new Date(currentYear, 0, 5),
        phone: '5511999998888',
        startDate: new Date(lastYear, 0, 15),
        paymentHistory: {
          [currentYear]: [0, 1, 2, 3],
          [lastYear]: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        }
      },
      {
        name: 'Maria Oliveira',
        age: 22,
        guardian: 'Próprio',
        responsibleCpf: '12345678902',
        fee: '150.00',
        status: 'Pendente',
        dueDate: new Date(currentYear, 0, 5),
        phone: '5522935000824',
        startDate: new Date(lastYear, 5, 1),
        paymentHistory: {
          [lastYear]: [5, 6, 7, 8, 9, 10, 11],
          [currentYear]: []
        }
      },
      {
        name: 'Carlos Pereira',
        age: 35,
        guardian: 'Próprio',
        responsibleCpf: '12345678903',
        fee: '150.00',
        status: 'Pago',
        dueDate: new Date(currentYear, 1, 5),
        phone: '5531977776666',
        startDate: new Date(currentYear, 1, 1),
        paymentHistory: {
          [currentYear]: [1]
        }
      }
    ]);

    console.log('Successfully seeded initial student database!');
  } catch (error) {
    console.error('Error seeding initial students:', error);
  }
}
