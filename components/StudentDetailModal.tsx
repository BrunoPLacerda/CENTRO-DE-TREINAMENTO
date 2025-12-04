
import React, { useState, useMemo } from 'react';
import type { Student } from '../types';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdatePaymentHistory: (studentId: number, year: number, monthIndex: number) => void;
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ isOpen, onClose, student, onUpdatePaymentHistory }) => {
  const [selectedYear, setSelectedYear] = useState(2025);

  const availableYears = useMemo(() => {
    if (!student) return [2025];
    const startYear = student.startDate.getFullYear();
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = startYear; y <= currentYear + 1; y++) {
      years.push(y);
    }
    return years;
  }, [student]);

  if (!isOpen || !student) return null;

  const handleMonthClick = (monthIndex: number) => {
    onUpdatePaymentHistory(student.id, selectedYear, monthIndex);
  };
  
  const getMonthStatus = (monthIndex: number) => {
    const studentStartYear = student.startDate.getFullYear();
    const studentStartMonth = student.startDate.getMonth();

    if (selectedYear < studentStartYear || (selectedYear === studentStartYear && monthIndex < studentStartMonth)) {
      return 'N/A'; // Not Applicable
    }
    
    const isPaid = student.paymentHistory[selectedYear]?.includes(monthIndex);
    return isPaid ? 'Paid' : 'Pending';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-dojo-light-dark rounded-lg shadow-xl p-6 w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Detalhes de {student.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6 border-b border-dojo-gray pb-4">
          <InfoItem label="Idade" value={student.age} />
          <InfoItem label="Responsável" value={student.guardian} />
          <InfoItem label="CPF Responsável" value={student.responsibleCpf} />
          <InfoItem label="Mensalidade" value={`R$ ${student.fee.toFixed(2)}`} />
          <InfoItem label="Início do Treino" value={student.startDate.toLocaleDateString('pt-BR')} />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-gray-800">Histórico de Pagamentos</h4>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-gray-50 border border-dojo-gray text-gray-900 text-sm rounded-lg focus:ring-dojo-primary focus:border-dojo-primary p-2"
              aria-label="Selecionar ano do histórico"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {MONTHS.map((month, index) => {
              const status = getMonthStatus(index);
              let statusClasses = '';
              let isClickable = false;

              switch (status) {
                case 'Paid':
                  statusClasses = 'bg-green-500 text-white cursor-pointer hover:bg-green-600';
                  isClickable = true;
                  break;
                case 'Pending':
                  statusClasses = 'bg-dojo-accent text-dojo-primary cursor-pointer hover:bg-yellow-400';
                   isClickable = true;
                  break;
                case 'N/A':
                  statusClasses = 'bg-gray-200 text-gray-400 cursor-not-allowed';
                  break;
              }

              return (
                <div 
                  key={index}
                  onClick={() => isClickable && handleMonthClick(index)}
                  className={`p-3 rounded-lg text-center transition-colors ${statusClasses}`}
                >
                  <div className="font-bold text-sm">{month}</div>
                  <div className="text-xs mt-1">{status !== 'N/A' ? status : ''}</div>
                </div>
              );
            })}
          </div>
           <p className="text-xs text-gray-500 mt-4 text-center">Clique em um mês para alterar o status do pagamento.</p>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{label: string, value: string | number}> = ({label, value}) => (
  <div>
    <span className="font-semibold text-dojo-light-gray">{label}: </span>
    <span className="text-gray-800">{value}</span>
  </div>
);

export default StudentDetailModal;
