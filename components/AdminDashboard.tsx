
import React, { useState, useMemo } from 'react';
import type { Student } from '../types.ts';
import { PaymentStatus } from '../types.ts';
import { generateMonthlySummary } from '../services/geminiService.ts';
import StudentList from './StudentList.tsx';
import ConfirmDialog from './ConfirmDialog.tsx';
import AddStudentModal from './AddStudentModal.tsx';
import OverdueNotice from './OverdueNotice.tsx';
import StudentDetailModal from './StudentDetailModal.tsx';

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
    const today = new Date();
    today.setHours(0,0,0,0);
    const isOverdue = new Date(student.dueDate) < today;
    const message = isOverdue 
      ? `Olá ${student.name.split(' ')[0]}! Tudo bem? Verificamos aqui que a sua mensalidade do CT Leandro Nascimento venceu dia ${student.dueDate.getDate()}. Consegue nos enviar o comprovante de pagamento? Oss! 🥋`
      : `Olá ${student.name.split(' ')[0]}! Passando para lembrar que sua mensalidade vence dia ${student.dueDate.getDate()}. Tamo junto! Oss! 🥋`;
    window.open(`https://wa.me/${student.phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [students, searchTerm]);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* SEÇÃO QUEM DEVE */}
      <div className="bg-white rounded-2xl shadow-2xl border-l-[12px] border-dojo-accent overflow-hidden">
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">🚨 Quem falta pagar?</h2>
                    <p className="text-sm text-gray-500 font-bold">Lista de alunos pendentes no mês atual</p>
                </div>
                <div className="bg-dojo-accent-light p-4 rounded-2xl border-2 border-dojo-accent text-right">
                    <span className="text-[10px] font-black text-dojo-accent-dark uppercase block">Total a Receber</span>
                    <span className="text-3xl font-black text-dojo-accent-dark">R$ {stats.pendingRevenue.toFixed(2)}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {pendingStudents.length > 0 ? pendingStudents.map(student => {
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const isOverdue = new Date(student.dueDate) < today;
                    return (
                        <div key={student.id} className={`p-4 rounded-2xl border-2 transition-all ${isOverdue ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-white ${isOverdue ? 'bg-red-600' : 'bg-dojo-primary'}`}>
                                    {student.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate">{student.name}</h4>
                                    <p className={`text-[10px] font-black uppercase ${isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                                        {isOverdue ? '⚠️ ATRASADO' : 'Pendente'} • Dia {student.dueDate.getDate()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-t border-gray-200/50 pt-3">
                                <span className="text-sm font-black text-gray-800">R$ {student.fee.toFixed(2)}</span>
                                <button onClick={() => openWhatsApp(student)} className="bg-green-500 hover:bg-green-600 text-white font-black text-[10px] uppercase px-3 py-2 rounded-xl">Cobrar</button>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-200 rounded-2xl">
                        <p className="text-gray-400 font-bold uppercase tracking-widest">Tudo em dia! Oss! 🥋</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Alunos" value={stats.totalStudents} color="border-gray-200" />
        <StatCard title="Pagos" value={stats.paidCount} color="border-green-500" />
        <StatCard title="Pendentes" value={stats.pendingCount} color="border-dojo-accent" />
        <StatCard title="Em Caixa" value={`R$ ${stats.totalRevenue.toFixed(2)}`} color="border-dojo-primary" />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
              <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-4" />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={() => setIsAddModalOpen(true)} className="flex-1 md:flex-none bg-dojo-secondary text-white font-black py-4 px-8 rounded-xl text-sm uppercase">Novo Aluno</button>
            <button onClick={handleGenerateReport} disabled={loadingReport} className="flex-1 md:flex-none bg-dojo-primary text-white font-black py-4 px-8 rounded-xl text-sm uppercase">IA ANALISAR</button>
          </div>
      </div>

      {report && (
          <div className="p-6 bg-gray-900 text-gray-100 rounded-3xl border-l-[16px] border-dojo-accent">
              <pre className="whitespace-pre-wrap font-sans text-sm">{report}</pre>
              <button onClick={() => setReport('')} className="mt-4 text-[10px] uppercase text-gray-500 underline">Fechar</button>
          </div>
      )}

      <StudentList 
        title="Alunos Cadastrados" 
        students={filteredStudents} 
        icon={<PaidIcon />} 
        onDelete={(s) => {setStudentToDelete(s); setIsDeleteDialogOpen(true);}} 
        onSelectStudent={(s) => {setSelectedStudent(s); setIsDetailModalOpen(true);}} 
      />

      <ConfirmDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={() => { if(studentToDelete) {onDeleteStudent(studentToDelete.id); setIsDeleteDialogOpen(false);} }} title="Remover Aluno">
        <p>Remover <strong>{studentToDelete?.name}</strong>?</p>
      </ConfirmDialog>
      <AddStudentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddStudent={onAddStudent} />
      <StudentDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} student={selectedStudent} onUpdatePaymentHistory={onUpdatePaymentHistory} />
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number, color: string }> = ({ title, value, color }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border-b-8 ${color}`}>
    <h4 className="text-[10px] font-black text-gray-400 uppercase mb-2">{title}</h4>
    <p className="text-2xl font-black text-dojo-primary">{value}</p>
  </div>
);

export default AdminDashboard;
