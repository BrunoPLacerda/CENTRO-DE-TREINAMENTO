
// Fix: Removed self-import of 'PaymentStatus' which was causing a declaration conflict.
export enum PaymentStatus {
  Paid = 'Pago',
  Pending = 'Pendente',
}

export interface Student {
  id: number;
  name: string;
  age: number;
  guardian: string;
  responsibleCpf: string; // CPF do responsável financeiro
  fee: number;
  status: PaymentStatus;
  dueDate: Date;
  phone: string; // For WhatsApp link e.g., 5511999998888
  startDate: Date;
  paymentHistory: Record<number, number[]>; // Year -> array of paid month indices (0-11)
}
