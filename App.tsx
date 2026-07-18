import React, { useState, useEffect, useCallback } from 'react';
import type { Student } from './types.ts';
import Header from './components/Header.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import StudentPortal from './components/StudentPortal.tsx';
import Login from './components/Login.tsx';
import { api } from './src/lib/api.ts';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'admin' | 'student' | null>(null);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [logo, setLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync authentication and retrieve user profile / students from DB
  const checkAuth = useCallback(async () => {
    if (api.hasToken()) {
      setLoading(true);
      try {
        const authData = await api.fetchMe();
        const role = authData.user.role;
        setUserRole(role);

        const fetchedStudents = await api.fetchStudents();
        if (role === 'admin') {
          setStudents(fetchedStudents);
        } else {
          // Student: retrieve linked student profile if it exists
          if (fetchedStudents && fetchedStudents.length > 0) {
            setCurrentUser(fetchedStudents[0]);
          } else {
            setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error('Error synchronizing auth state with database:', error);
        api.logout();
        setUserRole(null);
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    } else {
      setUserRole(null);
      setCurrentUser(null);
      setStudents([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      api.logout();
      setUserRole(null);
      setCurrentUser(null);
      setStudents([]);
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    try {
      await api.deleteStudent(studentId);
      setStudents(prev => prev.filter(s => s.id !== studentId));
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir aluno.');
    }
  };

  const handleAddStudent = async (newStudent: Omit<Student, 'id'>) => {
    try {
      const added = await api.addStudent(newStudent);
      setStudents(prev => [...prev, added]);
    } catch (error: any) {
      alert(error.message || 'Erro ao cadastrar aluno.');
    }
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    try {
      const updated = await api.updateStudent(updatedStudent.id, updatedStudent);
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar aluno.');
    }
  };

  const handleUpdatePaymentHistory = async (studentId: number, year: number, monthIndex: number) => {
    try {
      const updated = await api.updatePaymentHistory(studentId, year, monthIndex);
      setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar histórico de pagamento.');
    }
  };

  const handleCpfLinked = (student: Student) => {
    setCurrentUser(student);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dojo-dark flex flex-col justify-center items-center">
        <svg className="animate-spin h-10 w-10 text-dojo-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-gray-400 font-medium">Carregando...</p>
      </div>
    );
  }

  if (!userRole) {
    return <Login onLoginSuccess={checkAuth} logo={logo} />;
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
            onUpdateStudent={handleUpdateStudent}
            onSetLogo={setLogo}
            onUpdatePaymentHistory={handleUpdatePaymentHistory}
          />
        ) : (
          <StudentPortal student={currentUser} onCpfLinked={handleCpfLinked} />
        )}
      </main>
    </div>
  );
};

export default App;
