
import React, { useState, useMemo } from 'react';
import type { Student } from '../types';
import { PaymentStatus } from '../types';
import { generateMonthlySummary } from '../services/geminiService';
import StudentList from './StudentList';
import ConfirmDialog from './ConfirmDialog';
import AddStudentModal from './AddStudentModal';
import OverdueNotice from './OverdueNotice';
import StudentDetailModal from './StudentDetailModal';

interface AdminDashboardProps {
  students: Student[];
  onDeleteStudent: (studentId: number) => void;
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onSetLogo: (logoData: string) => void;
  onUpdatePaymentHistory: (studentId: number, year: number, monthIndex: number) => void;
}

const PaidIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dojo-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PendingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dojo-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const AdminDashboard: React.FC<AdminDashboardProps> = ({ students, onDeleteStudent, onAddStudent, onSetLogo, onUpdatePaymentHistory }) => {
  const [loadingReport, setLoadingReport] = useState(false);
  const [report, setReport] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const pendingStudents = useMemo(() => 
    students.filter(s => s.status === PaymentStatus.Pending)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
  , [students]);

  const overdueStudents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    return pendingStudents.filter(student => {
        const dueDate = new Date(student.dueDate);
        dueDate.setHours(23, 59, 59);
        return today > dueDate;
    });
  }, [pendingStudents]);

  const stats = useMemo(() => {
    const paidStudents = students.filter(s => s.status === PaymentStatus.Paid);
    const totalRevenue = paidStudents.reduce((acc, s) => acc + s.fee, 0);
    const pendingRevenue = pendingStudents.reduce((acc, s) => acc + s.fee, 0);
    return {
      totalStudents: students.length,
      paidCount: paidStudents.length,
      pendingCount: pendingStudents.length,
      totalRevenue,
      pendingRevenue
    };
  }, [students, pendingStudents]);

  const handleGenerateReport = async () => {
    setLoadingReport(true);
    const summary = await generateMonthlySummary(students);
    setReport(summary);
    setLoadingReport(false);
  };

  const openWhatsApp = (student: Student) => {
    const isOverdue = new Date(student.dueDate) < new Date();
    const message = isOverdue 
      ? `Olá ${student.name.split(' ')[0]}! Tudo bem? Verificamos aqui que a sua mensalidade do CT Leandro Nascimento venceu dia ${student.dueDate.getDate()}. Consegue nos enviar o comprovante de pagamento? Oss! 🥋`
      : `Olá ${student.name.split(' ')[0]}! Passando para lembrar que sua mensalidade vence dia ${student.dueDate.getDate()}. Tamo junto! Oss! 🥋`;
    window.open(`https://wa.me/${student.phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* SEÇÃO QUEM DEVE - FOCO TOTAL */}
      <div className="bg-white rounded-2xl shadow-2xl border-l-[12px] border-dojo-accent overflow-hidden">
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">🚨 Quem falta pagar?</h2>
                    <p className="text-sm text-gray-500 font-bold">Lista de alunos pendentes e em atraso no mês atual</p>
                </div>
                <div className="bg-dojo-accent-light p-4 rounded-2xl border-2 border-dojo-accent text-right">
                    <span className="text-[10px] font-black text-dojo-accent-dark uppercase block">Total a Receber</span>
                    <span className="text-3xl font-black text-dojo-accent-dark">R$ {stats.pendingRevenue.toFixed(2)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pendingStudents.length > 0 ? pendingStudents.map(student => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isOverdue = new Date(student.dueDate) < today;
                    
                    return (
                        <div 
                            key={student.id} 
                            className={`p-4 rounded-2xl border-2 transition-all group ${isOverdue ? 'bg-red-50 border-red-200 shadow-red-100' : 'bg-gray-50 border-gray-100'}`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center font-black text-white ${isOverdue ? 'bg-red-600 animate-pulse' : 'bg-dojo-primary'}`}>
                                    {student.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate">{student.name}</h4>
                                    <p className={`text-[10px] font-black uppercase ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                                        {isOverdue ? '⚠️ ATRASADO' : 'Pendente'} • Vence dia {student.dueDate.getDate()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200/50">
                                <span className="text-sm font-black text-gray-800">R$ {student.fee.toFixed(2)}</span>
                                <button 
                                    onClick={() => openWhatsApp(student)}
                                    className="bg-green-500 hover:bg-green-600 text-white font-black text-[10px] uppercase px-3 py-2 rounded-xl flex items-center gap-2 transition-transform active:scale-95"
                                >
                                    Cobrar
                                </button>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-12 text-center bg-dojo-secondary/10 rounded-2xl border-4 border-dashed border-dojo-secondary/30">
                        <p className="text-dojo-secondary font-black text-xl italic">OSS! Nenhum devedor. Academia 100% em dia! 🥋</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Alunos" value={stats.totalStudents} color="border-gray-200" />
        <StatCard title="Pagos (Mês)" value={stats.paidCount} color="border-green-500" />
        <StatCard title="Pendentes" value={stats.pendingCount} color="border-dojo-accent" />
        <StatCard title="Total em Caixa" value={`R$ ${stats.totalRevenue.toFixed(2)}`} color="border-dojo-primary" />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
              <input
                  type="text"
                  placeholder="Pesquisar por nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-dojo-primary focus:border-dojo-primary block p-4 font-medium"
              />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => setIsAddModalOpen(true)} className="flex-1 md:flex-none bg-dojo-secondary text-white font-black py-4 px-8 rounded-xl hover:opacity-90 transition-all text-sm uppercase">
              Novo Aluno
            </button>
            <button onClick={handleGenerateReport} disabled={loadingReport} className="flex-1 md:flex-none bg-dojo-primary text-white font-black py-4 px-8 rounded-xl hover:bg-gray-800 transition-all text-sm uppercase disabled:opacity-50">
              {loadingReport ? 'Analisando...' : 'Análise da IA'}
            </button>
          </div>
      </div>

      {report && (
          <div className="p-6 bg-gray-900 text-gray-100 rounded-3xl shadow-2xl border-l-[16px] border-dojo-accent relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>
              </div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-dojo-accent mb-4">Relatório Estratégico Gemini</h4>
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm md:text-base leading-relaxed">{report}</pre>
              </div>
              <button onClick={() => setReport('')} className="mt-6 text-[10px] font-black uppercase text-gray-500 hover:text-white underline">Fechar Relatório</button>
          </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <StudentList title="Todos os Pendentes" students={students.filter(s => s.status === PaymentStatus.Pending)} icon={<PendingIcon />} onDelete={(s) => {setStudentToDelete(s); setIsDeleteDialogOpen(true);}} onSelectStudent={(s) => {setSelectedStudent(s); setIsDetailModalOpen(true);}} />
        <StudentList title="Pagos Confirmados" students={students.filter(s => s.status === PaymentStatus.Paid)} icon={<PaidIcon />} onDelete={(s) => {setStudentToDelete(s); setIsDeleteDialogOpen(true);}} onSelectStudent={(s) => {setSelectedStudent(s); setIsDetailModalOpen(true);}} />
      </div>

      <ConfirmDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={() => { if(studentToDelete) {onDeleteStudent(studentToDelete.id); setIsDeleteDialogOpen(false);} }} title="Remover Aluno">
        <p>Confirmar exclusão de <strong>{studentToDelete?.name}</strong>?</p>
      </ConfirmDialog>
      <AddStudentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddStudent={onAddStudent} />
      <StudentDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} student={selectedStudent} onUpdatePaymentHistory={onUpdatePaymentHistory} />
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number, color: string }> = ({ title, value, color }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border-b-8 ${color} transition-transform hover:-translate-y-1`}>
    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight mb-2">{title}</h4>
    <p className="text-2xl font-black text-dojo-primary">{value}</p>
  </div>
);

export default AdminDashboard;
