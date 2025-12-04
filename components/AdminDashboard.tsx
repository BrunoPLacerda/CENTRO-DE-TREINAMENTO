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
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);


  const overdueStudents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    return students.filter(student => 
      student.status === PaymentStatus.Pending && new Date(student.dueDate) < threeDaysAgo
    );
  }, [students]);

  const filteredStudents = useMemo(() => {
    let tempStudents = [...students];

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      tempStudents = tempStudents.filter(student =>
        student.name.toLowerCase().includes(lowercasedFilter) ||
        student.status.toLowerCase().includes(lowercasedFilter) ||
        student.fee.toString().includes(lowercasedFilter)
      );
    }

    const start = startDate ? new Date(startDate + 'T00:00:00') : null;
    const end = endDate ? new Date(endDate + 'T23:59:59') : null;

    if (start || end) {
      tempStudents = tempStudents.filter(student => {
        const dueDate = new Date(student.dueDate);
        if (start && dueDate < start) return false;
        if (end && dueDate > end) return false;
        return true;
      });
    }
    
    return tempStudents;
  }, [students, searchTerm, startDate, endDate]);

  const stats = useMemo(() => {
    const paidStudents = filteredStudents.filter(s => s.status === PaymentStatus.Paid);
    const totalRevenue = paidStudents.reduce((acc, s) => acc + s.fee, 0);
    return {
      totalStudents: filteredStudents.length,
      paidCount: paidStudents.length,
      pendingCount: filteredStudents.length - paidStudents.length,
      totalRevenue,
    };
  }, [filteredStudents]);

  const handleGenerateReport = async () => {
    setLoadingReport(true);
    setReport('');
    const summary = await generateMonthlySummary(students);
    setReport(summary);
    setLoadingReport(false);
  };
  
  const handleOpenDeleteDialog = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (studentToDelete) {
      onDeleteStudent(studentToDelete.id);
      setIsDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };
  
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          onSetLogo(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const paidStudents = useMemo(() => filteredStudents.filter(s => s.status === PaymentStatus.Paid), [filteredStudents]);
  const pendingStudents = useMemo(() => filteredStudents.filter(s => s.status === PaymentStatus.Pending), [filteredStudents]);

  return (
    <>
      <div className="p-4 md:p-8 space-y-8">
        <OverdueNotice students={overdueStudents} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total de Alunos (Filtro)" value={stats.totalStudents} />
          <StatCard title="Pagos (Filtro)" value={stats.paidCount} />
          <StatCard title="Pendentes (Filtro)" value={stats.pendingCount} />
          <StatCard title="Receita (Filtro)" value={`R$ ${stats.totalRevenue.toFixed(2)}`} />
        </div>

        <div className="space-y-8">
          <div className="bg-dojo-light-dark p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtro e Ações</h3>
              <div className="flex flex-wrap gap-4 items-end mb-6">
                  <div className="relative flex-grow min-w-[200px]">
                      <label htmlFor="search-input" className="block mb-1 text-xs font-medium text-dojo-light-gray">Buscar Aluno</label>
                      <div className="absolute inset-y-0 top-6 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                          </svg>
                      </div>
                      <input
                          id="search-input"
                          type="text"
                          placeholder="Nome, status ou valor..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-gray-50 border border-dojo-gray text-gray-900 placeholder-gray-400 text-sm rounded-lg focus:ring-dojo-primary focus:border-dojo-primary block p-2.5 pl-10"
                      />
                  </div>
                  <div>
                      <label htmlFor="start-date" className="block mb-1 text-xs font-medium text-dojo-light-gray">Vencimento De:</label>
                      <input
                          id="start-date"
                          type="date"
                          value={startDate || ''}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-gray-50 border border-dojo-gray text-gray-900 placeholder-dojo-gray text-sm rounded-lg focus:ring-dojo-primary focus:border-dojo-primary block p-2.5"
                      />
                  </div>
                  <div>
                      <label htmlFor="end-date" className="block mb-1 text-xs font-medium text-dojo-light-gray">Até:</label>
                      <input
                          id="end-date"
                          type="date"
                          value={endDate || ''}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-gray-50 border border-dojo-gray text-gray-900 placeholder-dojo-gray text-sm rounded-lg focus:ring-dojo-primary focus:border-dojo-primary block p-2.5"
                      />
                  </div>
                  <button
                      onClick={() => { setStartDate(null); setEndDate(null); }}
                      className="bg-gray-500 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                      Limpar Datas
                  </button>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-dojo-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Adicionar Aluno
                </button>
                <button
                    onClick={handleGenerateReport}
                    disabled={loadingReport}
                    className="bg-dojo-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-dojo-primary-hover transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                    {loadingReport ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                    )}
                    {loadingReport ? 'Gerando...' : 'Gerar Relatório Financeiro'}
                </button>
                <label
                  htmlFor="logo-upload"
                  className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  Alterar Logo
                </label>
                <input 
                  id="logo-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </div>
              {report && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md border border-dojo-gray prose max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm">{report}</pre>
                  </div>
              )}
          </div>
          <StudentList title="Pagamentos Pendentes" students={pendingStudents} icon={<PendingIcon />} onDelete={handleOpenDeleteDialog} onSelectStudent={handleSelectStudent} />
          <StudentList title="Pagamentos em Dia" students={paidStudents} icon={<PaidIcon />} onDelete={handleOpenDeleteDialog} onSelectStudent={handleSelectStudent} />
        </div>
      </div>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
      >
        <p>Você tem certeza que deseja excluir o aluno <strong>{studentToDelete?.name}</strong>?</p>
        <p className="mt-2 text-sm text-yellow-500">Esta ação não pode ser desfeita.</p>
      </ConfirmDialog>
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStudent={onAddStudent}
      />
      <StudentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        student={selectedStudent}
        onUpdatePaymentHistory={onUpdatePaymentHistory}
      />
    </>
  );
};

const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <div className="bg-dojo-light-dark p-6 rounded-lg shadow-lg">
    <h4 className="text-sm font-medium text-dojo-light-gray">{title}</h4>
    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
  </div>
);

export default AdminDashboard;