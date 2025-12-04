
import React, { useState, useMemo, useEffect } from 'react';
import type { Student } from '../types';
import { PaymentStatus } from '../types';
import NotificationCard from './NotificationCard';

interface StudentPortalProps {
  student: Student | null;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const StudentPortal: React.FC<StudentPortalProps> = ({ student }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonthIndices, setSelectedMonthIndices] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [copyStatus, setCopyStatus] = useState('Copiar Chave PIX');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Initialize available years based on student start date
  const availableYears = useMemo(() => {
    if (!student) return [new Date().getFullYear()];
    const startYear = student.startDate.getFullYear();
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear + 1; y >= startYear; y--) {
      years.push(y);
    }
    return years;
  }, [student]);

  // Clear selection when year changes
  useEffect(() => {
    setSelectedMonthIndices([]);
  }, [selectedYear]);

  if (!student) {
    return (
      <div className="p-4 md:p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Portal do Aluno</h2>
        <p>Carregando dados do aluno...</p>
      </div>
    );
  }

  const toggleMonthSelection = (monthIndex: number) => {
    setSelectedMonthIndices(prev => {
      if (prev.includes(monthIndex)) {
        return prev.filter(i => i !== monthIndex);
      } else {
        return [...prev, monthIndex].sort((a, b) => a - b);
      }
    });
  };

  const totalAmount = selectedMonthIndices.length * student.fee;

  const handleCopyPix = () => {
    const pixKey = '12.345.678/0001-99'; // Chave PIX Fictícia
    navigator.clipboard.writeText(pixKey).then(() => {
      setCopyStatus('Copiado!');
      setTimeout(() => setCopyStatus('Copiar Chave PIX'), 2000);
    });
  };

  const handleCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setTimeout(() => {
      alert(`Pagamento de R$ ${totalAmount.toFixed(2)} realizado com sucesso! (Simulação)`);
      setIsProcessingPayment(false);
      setSelectedMonthIndices([]); // Clear selection after payment
    }, 1500);
  };

  const getMonthStatus = (monthIndex: number) => {
    const studentStartYear = student.startDate.getFullYear();
    const studentStartMonth = student.startDate.getMonth();

    // Before registration
    if (selectedYear < studentStartYear || (selectedYear === studentStartYear && monthIndex < studentStartMonth)) {
      return { code: 'NA', label: '-', color: 'text-gray-400', bg: 'bg-gray-100', selectable: false };
    }

    // Paid check
    const isPaid = student.paymentHistory[selectedYear]?.includes(monthIndex);
    if (isPaid) {
      return { code: 'PAID', label: 'Pago', color: 'text-green-700', bg: 'bg-green-100', selectable: false };
    }

    // Overdue check
    const now = new Date();
    // Default due day is derived from student.dueDate day component
    const dueDay = student.dueDate.getDate();
    const dueDateThisMonth = new Date(selectedYear, monthIndex, dueDay);
    
    // Reset hours for fair comparison
    dueDateThisMonth.setHours(23, 59, 59);
    now.setHours(0, 0, 0, 0);

    if (now > dueDateThisMonth) {
      return { code: 'OVERDUE', label: 'Atrasado', color: 'text-red-700', bg: 'bg-red-100', selectable: true };
    }

    return { code: 'OPEN', label: 'Aberto', color: 'text-dojo-primary', bg: 'bg-white', selectable: true };
  };

  const commonTabClass = "px-4 py-2 rounded-t-lg text-sm font-medium transition-colors focus:outline-none flex-1 md:flex-none";
  const activeTabClass = "bg-dojo-primary text-white";
  const inactiveTabClass = "bg-dojo-gray text-dojo-light-gray hover:bg-opacity-80";

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Olá, {student.name.split(' ')[0]}!</h2>
           <p className="text-dojo-light-gray">Gerencie suas mensalidades abaixo.</p>
        </div>
        <div className="flex items-center gap-2">
            <label htmlFor="year-select" className="text-sm font-medium text-gray-700">Ano:</label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white border border-dojo-gray text-gray-900 text-sm rounded-lg focus:ring-dojo-primary focus:border-dojo-primary block p-2"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
        </div>
      </div>

      <NotificationCard student={student} />

      {/* Financial Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-dojo-gray">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-dojo-gray">
              <tr>
                <th scope="col" className="p-4 w-4">
                   #
                </th>
                <th scope="col" className="px-6 py-3">Mês</th>
                <th scope="col" className="px-6 py-3 hidden sm:table-cell">Vencimento</th>
                <th scope="col" className="px-6 py-3">Valor</th>
                <th scope="col" className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {MONTHS.map((month, index) => {
                const status = getMonthStatus(index);
                const isSelected = selectedMonthIndices.includes(index);
                const dueDateDisplay = new Date(selectedYear, index, student.dueDate.getDate()).toLocaleDateString('pt-BR');

                return (
                  <tr 
                    key={index} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 hover:bg-blue-50' : ''}`}
                    onClick={() => status.selectable && toggleMonthSelection(index)}
                  >
                    <td className="p-4 w-4">
                      {status.selectable ? (
                         <div className="flex items-center justify-center">
                            <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => toggleMonthSelection(index)}
                                className="w-4 h-4 text-dojo-primary bg-gray-100 border-gray-300 rounded focus:ring-dojo-primary cursor-pointer"
                            />
                         </div>
                      ) : (
                        <div className="flex items-center justify-center">
                            {status.code === 'PAID' && (
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                            )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                        {month}
                        {status.code === 'OVERDUE' && <span className="ml-2 text-[10px] text-red-600 font-bold hidden sm:inline">(Atrasado)</span>}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">{status.code === 'NA' ? '-' : dueDateDisplay}</td>
                    <td className="px-6 py-4">R$ {status.code === 'NA' ? '-' : student.fee.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color} ${status.bg}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Section (Sticky or prominent when items selected) */}
      <div className={`transition-all duration-300 ${selectedMonthIndices.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-50 grayscale pointer-events-none'}`}>
        <div className="bg-dojo-light-dark p-6 rounded-lg shadow-lg border-t-4 border-dojo-primary">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Resumo do Pagamento</h3>
                    <p className="text-sm text-gray-500">
                        {selectedMonthIndices.length > 0 
                            ? `Selecionado: ${selectedMonthIndices.map(i => MONTHS[i]).join(', ')} de ${selectedYear}`
                            : 'Selecione as mensalidades na tabela acima.'
                        }
                    </p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    <p className="text-sm text-gray-500">Total a Pagar</p>
                    <p className="text-3xl font-bold text-dojo-primary">R$ {totalAmount.toFixed(2)}</p>
                </div>
            </div>

            {/* Payment Methods */}
            {selectedMonthIndices.length > 0 && (
                <>
                     <div className="flex border-b border-dojo-gray mb-4">
                        <button onClick={() => setPaymentMethod('pix')} className={`${commonTabClass} ${paymentMethod === 'pix' ? activeTabClass : inactiveTabClass}`}>
                            PIX
                        </button>
                        <button onClick={() => setPaymentMethod('card')} className={`${commonTabClass} ${paymentMethod === 'card' ? activeTabClass : inactiveTabClass}`}>
                            Cartão de Crédito
                        </button>
                    </div>

                    {paymentMethod === 'pix' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-b-lg border border-gray-100">
                        <p className="text-sm text-gray-700">Use a chave abaixo para pagamento via PIX (Copia e Cola):</p>
                        <div className="bg-white p-3 rounded-md border border-dojo-gray flex items-center justify-between">
                        <span className="font-mono text-gray-800 text-sm break-all">12.345.678/0001-99</span>
                        <button onClick={handleCopyPix} className="bg-dojo-secondary text-white text-xs font-bold py-1.5 px-3 rounded hover:bg-opacity-90 transition-colors shrink-0 ml-2">
                            {copyStatus}
                        </button>
                        </div>
                        <p className="text-xs text-gray-500">Após o pagamento, envie o comprovante para a secretaria.</p>
                    </div>
                    )}

                    {paymentMethod === 'card' && (
                    <form onSubmit={handleCardPayment} className="space-y-4 p-4 bg-gray-50 rounded-b-lg text-left border border-gray-100">
                        <InputField label="Número do Cartão" id="cardNumber" placeholder="0000 0000 0000 0000" />
                        <InputField label="Nome no Cartão" id="cardName" placeholder="Seu nome como no cartão" />
                        <div className="flex gap-4">
                        <div className="w-1/2">
                            <InputField label="Validade" id="cardExpiry" placeholder="MM/AA" />
                        </div>
                        <div className="w-1/2">
                            <InputField label="CVV" id="cardCvv" placeholder="123" />
                        </div>
                        </div>
                        <button
                        type="submit"
                        disabled={isProcessingPayment}
                        className="w-full bg-dojo-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-dojo-primary-hover transition-colors text-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {isProcessingPayment && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                            {isProcessingPayment ? 'Processando...' : `Pagar R$ ${totalAmount.toFixed(2)}`}
                        </button>
                    </form>
                    )}
                </>
            )}
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<{label: string, id: string, placeholder: string}> = ({label, id, placeholder}) => (
  <div>
    <label htmlFor={id} className="block mb-2 text-sm font-medium text-dojo-light-gray">{label}</label>
    <input type="text" id={id} placeholder={placeholder} className="w-full bg-white border border-dojo-gray text-gray-900 placeholder-gray-400 text-sm rounded-lg focus:ring-dojo-primary focus:border-dojo-primary block p-2.5" />
  </div>
);

export default StudentPortal;
