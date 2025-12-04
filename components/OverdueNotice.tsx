import React from 'react';
import type { Student } from '../types';

interface OverdueNoticeProps {
  students: Student[];
}

const OverdueNotice: React.FC<OverdueNoticeProps> = ({ students }) => {
  if (students.length === 0) {
    return null;
  }

  const handleSendReminders = () => {
    students.forEach(student => {
      const message = `Olá, ${student.name}! Tudo bem?\n\n` +
        `Este é um lembrete do Centro de Treinamento Leandro Nascimento sobre a sua mensalidade de R$${student.fee.toFixed(2)}, que venceu em ${student.dueDate.toLocaleDateString('pt-BR')}.\n\n` +
        `Para facilitar, você pode realizar o pagamento diretamente no seu Portal do Aluno.\n\n` +
        `Regularize sua situação para não perder nenhum treino! 😉\n\n` +
        `Qualquer dúvida, estamos à disposição.`;
      
      const whatsappLink = `https://wa.me/${student.phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappLink, '_blank');
    });
  };

  return (
    <div className="bg-red-100 border border-red-300 text-red-800 p-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
      <div>
        <h4 className="font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Ação Necessária: Pagamentos Atrasados
        </h4>
        <p className="text-sm mt-1">
          Você tem <strong>{students.length}</strong> {students.length === 1 ? 'aluno com pagamento atrasado' : 'alunos com pagamentos atrasados'} há mais de 3 dias.
        </p>
      </div>
      <div>
        <button
          onClick={handleSendReminders}
          className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 hover:bg-red-700 transition-colors w-full md:w-auto justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.202 3.82a.75.75 0 00-1.06-1.06L14.72 4.18a.75.75 0 001.06 1.06l1.42-1.42zM4.18 14.72a.75.75 0 001.06 1.06l1.42-1.42a.75.75 0 00-1.06-1.06L4.18 14.72zM10 18a8 8 0 100-16 8 8 0 000 16zM3.55 6.45a.75.75 0 00-1.06-1.06L1.07 6.81a.75.75 0 001.06 1.06l1.42-1.42zM18.93 6.81a.75.75 0 001.06-1.06l-1.42-1.42a.75.75 0 00-1.06 1.06l1.42 1.42zM10 5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 5zM8.25 10a1.75 1.75 0 103.5 0 1.75 1.75 0 00-3.5 0z" />
          </svg>
          <span>Enviar Lembretes</span>
        </button>
        <p className="text-xs text-center mt-2 text-red-600">Permita pop-ups para esta ação.</p>
      </div>
    </div>
  );
};

export default OverdueNotice;