
import React from 'react';
import type { Student } from '../types';

interface NotificationCardProps {
  student: Student;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ student }) => {
  const today = new Date();
  const dueDate = student.dueDate;
  const timeDiff = dueDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  if (daysDiff > 5 || daysDiff < 0) {
    return null;
  }

  const message = `Olá ${student.name}, sua mensalidade de R$${student.fee.toFixed(2)} vence em ${dueDate.toLocaleDateString('pt-BR')}. Para evitar interrupções no seu treino, por favor, realize o pagamento.`;
  const whatsappLink = `https://wa.me/${student.phone}?text=${encodeURIComponent(message)}`;

  return (
    <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 p-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h4 className="font-bold">Aviso de Vencimento</h4>
        <p className="text-sm">
          Sua mensalidade está próxima do vencimento!
          {daysDiff > 1 && ` Faltam ${daysDiff} dias.`}
          {daysDiff === 1 && ` Falta 1 dia.`}
          {daysDiff === 0 && ` Vence hoje!`}
        </p>
      </div>
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors w-full md:w-auto justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.25 1.25a.75.75 0 00-1.5 0v1.313a.75.75 0 001.5 0V1.25zM3.813 3.813a.75.75 0 00-1.06 1.06l.939.94a.75.75 0 001.06-1.06l-.94-.94zM16.187 3.813a.75.75 0 00-1.06-1.06l-.94.939a.75.75 0 101.06 1.06l.94-.939zM10 5.75a.75.75 0 01.75.75v2.5a.75.75 0 01-1.5 0v-2.5a.75.75 0 01.75-.75zM10 18a8 8 0 100-16 8 8 0 000 16zM9 13a1 1 0 112 0 1 1 0 01-2 0z" />
        </svg>
        <span>Lembrete no WhatsApp</span>
      </a>
    </div>
  );
};

export default NotificationCard;