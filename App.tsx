
import React, { useState } from 'react';
import type { Student } from './types.ts';
import { PaymentStatus } from './types.ts';
import Header from './components/Header.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import StudentPortal from './components/StudentPortal.tsx';
import Login from './components/Login.tsx';

const getInitialStudents = (): Student[] => {
  const currentYear = 2025;
  const lastYear = currentYear - 1;

  return [
    { 
      id: 1, 
      name: 'João Silva', 
      age: 28, 
      guardian: 'Próprio', 
      responsibleCpf: '12345678901', 
      fee: 150.00, 
      status: PaymentStatus.Paid, 
      dueDate: new Date(currentYear, 0, 5), 
      phone: '5511999998888', 
      startDate: new Date(lastYear, 0, 15), 
      paymentHistory: { [currentYear]: [0,1,2,3], [lastYear]: [0,1,2,3,4,5,6,7,8,9,10,11] } 
    },
    { 
      id: 2, 
      name: 'Maria Oliveira', 
      age: 22, 
      guardian: 'Próprio', 
      responsibleCpf: '12345678902', 
      fee: 150.00, 
      status: PaymentStatus.Pending, 
      dueDate: new Date(currentYear, 0, 5), 
      phone: '5522935000824', 
      startDate: new Date(lastYear, 5, 1), 
      paymentHistory: { [lastYear]: [5,6,7,8,9,10,11], [currentYear]: [] } 
    },
    { 
      id: 3, 
      name: 'Carlos Pereira', 
      age: 35, 
      guardian: 'Próprio', 
      responsibleCpf: '12345678903', 
      fee: 150.00, 
      status: PaymentStatus.Paid, 
      dueDate: new Date(currentYear, 1, 5), 
      phone: '5531977776666', 
      startDate: new Date(currentYear, 1, 1), 
      paymentHistory: { [currentYear]: [1] } 
    }
  ];
};

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'admin' | 'student' | null>(null);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>(getInitialStudents);
  const [logo, setLogo] = useState<string | null>(null);

  const handleAdminLogin = (user: string, pass: string) => {
    // Implementação dos usuários administrativos
    const isAdmin = (user === 'admin' && pass === 'admin123');
    const isNewAdmin = (user === 'LNASCIMENTO' && pass === '123456');
    
    if (isAdmin || isNewAdmin) {
      setUserRole('admin');
      return true;
    }
    return false;
  };

  const handleStudentLogin = (cpf: string) => {
    const student = students.find(s => s.responsibleCpf === cpf);
    if (student) {
      setUserRole('student');
      setCurrentUser(student);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentUser(null);
  };

  const handleDeleteStudent = (studentId: number) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const handleAddStudent = (newStudent: Omit<Student, 'id'>) => {
    setStudents(prev => [...prev, { ...newStudent, id: Date.now() }]);
  };

  const handleUpdatePaymentHistory = (studentId: number, year: number, monthIndex: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const history = { ...s.paymentHistory };
        if (!history[year]) history[year] = [];
        
        if (history[year].includes(monthIndex)) {
          history[year] = history[year].filter(m => m !== monthIndex);
        } else {
          history[year] = [...history[year], monthIndex].sort((a, b) => a - b);
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        let newStatus = s.status;
        if (year === currentYear && monthIndex === currentMonth) {
            newStatus = history[year].includes(monthIndex) ? PaymentStatus.Paid : PaymentStatus.Pending;
        }

        return { ...s, paymentHistory: history, status: newStatus };
      }
      return s;
    }));
  };

  if (!userRole) {
    return <Login onAdminLogin={handleAdminLogin} onStudentLogin={handleStudentLogin} logo={logo} />;
  }

  return (
    <div className="min-h-screen bg-dojo-dark flex flex-col">
      <Header 
        userRole={userRole} 
        onLogout={handleLogout} 
        studentName={currentUser?.name}
        logo={logo}
      />
      <main className="flex-1">
        {userRole === 'admin' ? (
          <AdminDashboard 
            students={students} 
            onDeleteStudent={handleDeleteStudent} 
            onAddStudent={handleAddStudent}
            onSetLogo={setLogo}
            onUpdatePaymentHistory={handleUpdatePaymentHistory}
          />
        ) : (
          <StudentPortal student={currentUser} />
        )}
      </main>
    </div>
  );
};

export default App;
