import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, numeric, jsonb } from 'drizzle-orm/pg-core';

// 'users' table holds authentication accounts managed by Firebase Auth
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  role: text('role').notNull().default('student'), // 'admin' or 'student'
  createdAt: timestamp('created_at').defaultNow(),
});

// 'students' table holds the business/student data
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  guardian: text('guardian').notNull(),
  responsibleCpf: text('responsible_cpf').notNull().unique(),
  fee: numeric('fee', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull(), // 'Pago' or 'Pendente'
  dueDate: timestamp('due_date').notNull(),
  phone: text('phone').notNull(),
  startDate: timestamp('start_date').notNull(),
  paymentHistory: jsonb('payment_history').$type<Record<number, number[]>>().notNull().default({}),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  students: many(students),
}));

export const studentsRelations = relations(students, ({ one }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
}));
