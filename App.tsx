
import React, { useState, useEffect } from 'react';
import type { Student } from './types';
import { PaymentStatus } from './types';
import Header from './components/Header';
import AdminDashboard from './components/AdminDashboard';
import StudentPortal from './components/StudentPortal';
import Login from './components/Login';

const getInitialStudents = (): Student[] => {
  const currentYear = 2025; // As per request, start in 2025
  const lastYear = currentYear - 1;

  // Helper to generate a fake CPF for demo purposes
  const fakeCpf = (suffix: string) => `111.222.333-${suffix}`;

  return [
    // Current Year Data
    { id: 1, name: 'João Silva', age: 28, guardian: 'Próprio', responsibleCpf: '12345678901', fee: 150.00, status: PaymentStatus.Paid, dueDate: new Date(currentYear, 0, 5), phone: '5511999998888', startDate: new Date(lastYear, 0, 15), paymentHistory: { [currentYear]: [0,1,2,3], [lastYear]: [0,1,2,3,4,5,6,7,8,9,10,11] } }, // Paid Jan
    { id: 2, name: 'Maria Oliveira', age: 22, guardian: 'Próprio', responsibleCpf: '12345678902', fee: 150.00, status: PaymentStatus.Pending, dueDate: new Date(currentYear, 0, 5), phone: '5522935000824', startDate: new Date(lastYear, 5, 1), paymentHistory: { [lastYear]: [5,6,7,8,9,10,11], [currentYear]: [] } }, // Pending Jan
    { id: 3, name: 'Carlos Pereira', age: 35, guardian: 'Próprio', responsibleCpf: '12345678903', fee: 150.00, status: PaymentStatus.Paid, dueDate: new Date(currentYear, 1, 5), phone: '5531977776666', startDate: new Date(currentYear, 1, 1), paymentHistory: { [currentYear]: [1] } }, // Paid Feb
    { id: 4, name: 'Ana Costa', age: 16, guardian: 'Ricardo Costa', responsibleCpf: '12345678904', fee: 120.00, status: PaymentStatus.Paid, dueDate: new Date(currentYear, 1, 10), phone: '5541966665555', startDate: new Date(currentYear, 0, 10), paymentHistory: { [currentYear]: [0, 1] } }, // Paid Feb
    { id: 5, name: 'Lucas Martins', age: 19, guardian: 'Próprio', responsibleCpf: '12345678905', fee: 150.00, status: PaymentStatus.Pending, dueDate: new Date(currentYear, 2, 2), phone: '5551955554444', startDate: new Date(lastYear, 10, 20), paymentHistory: { [lastYear]: [10, 11], [currentYear]: [0,1] } }, // Pending Mar
    { id: 6, name: 'Juliana Almeida', age: 25, guardian: 'Próprio', responsibleCpf: '12345678906', fee: 150.00, status: PaymentStatus.Paid, dueDate: new Date(currentYear, 2, 10), phone: '5561944443333', startDate: new Date(currentYear, 2, 1), paymentHistory: { [currentYear]: [2] } }, // Paid Mar
    { id: 7, name: 'Fernando Lima', age: 14, guardian: 'Marcos Lima', responsibleCpf: '12345678907', fee: 120.00, status: PaymentStatus.Paid, dueDate: new Date(currentYear, 3, 10), phone: '5571933332222', startDate: new Date(currentYear, 3, 1), paymentHistory: { [currentYear]: [3] } }, // Paid Apr

    // Last Year Data
    { id: 8, name: 'Beatriz Souza', age: 31, guardian: 'Próprio', responsibleCpf: '12345678908', fee: 150.00, status: PaymentStatus.Paid, dueDate: new Date(lastYear, 10, 5), phone: '5581922221111', startDate: new Date(lastYear - 1, 0, 1), paymentHistory: { [lastYear - 1]: [0,1,2,3,4,5,6,7,8,9,10,11], [lastYear]: [0,1,2,3,4,5,6,7,8,9,10] } }, // Paid Nov last year
    { id: 9, name: 'Ricardo Rocha', age: 40, guardian: 'Próprio', responsibleCpf: '12345678909', fee: 150.00, status: PaymentStatus.Paid, dueDate: new Date(lastYear, 11, 5), phone: '5591911110000', startDate: new Date(lastYear, 0, 1), paymentHistory: { [lastYear]: [0,1,2,3,4,5,6,7,8,9,10,11] } }, // Paid Dec last year
    { id: 10, name: 'Patrícia Nunes', age: 29, guardian: 'Próprio', responsibleCpf: '12345678910', fee: 150.00, status: PaymentStatus.Paid, dueDate: new Date(lastYear, 11, 15), phone: '5511998765432', startDate: new Date(lastYear, 11, 1), paymentHistory: { [lastYear]: [11] } }, // Paid Dec last year
  ];
};

const defaultLogo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAd8SURBVHhe7Z1/aBVFFMc/k5iWtpqaF7GImB8S/0CtpY3tF0w01oJaLCgaWNEiiPaPslFaRPEHFRS0sFZRUXsRsaL4h2ghKIhYxVCwVLFYqWmpif/r3M7l4e7d/d27d/e+54ODwO6de/Nm5s2bM+/eL4vFYrFYLBaLxWKxWCwWi8VisVgsFovF4kAWdSA7Fsgchf+hXIFs6lY2sCAbWNi8WbKBRf+g/A2yaZtcwMv9g/I7yGZt8gCv9w/K9yGb9coHXtz/F34Q2byVDjy8/y/cRza/5QLH9f+FDyCbvcoBxvP/hR9ANm+VA1zT/xY+gmx25AIv9/+FnyCb3boAFzP/hZ8gmx25AO/g/wu/QTa7cgEumv/Cp5AN26u5q/oPzVv9T81d1X/o3hN+ENnQXNbc1f1H5/0PzV3Vf+jeE34Q2dDcd/0H5/0PzV3Vf+jeE34Q2dDcd/0H5/0PzV3Vf+jeE34Q2dDcf+j+kPND81Z1X/q3hF9ANjT3PX/Q/iF5qLqr+k/NO+EHkQ3Nfc/fNP+B5q7qPjXvhB9ENjT3PX/T/Adq7qr+U/NO+EFkY/Mf6D/U/k9zV/WfmnfCDyIb6f8F/qP0f5K7qPzXvhB9ENtT/S/wH7f+Huav6T8074QeRDeXvsv9B+/+Huav6T8074QeRDeX/j/5B+/+Huav6T8074QeRDeX/j/4D9f9f5q7qPzXvhB9ENpT9i/5B+79f5q7qPzXvhB9ENpT9i/4D9X9/5q7qPzXvhB9ENvT9i/5B+7+/5K7qPzXvhB9ENvT9S/4H6v7/krur/1HzTvhBZGPzX/A/UP/3S+6q/lPzTvhBZGPzX/g/UP/3S+6q/lPzTvhBZMPqf8f/Qf2/Xuau6j8174QfRDZU/zv+B+r/tczd1X/q3hN+ENm++f/z/kH/r2buqv5T857wQ2QD+c//kP8D9VvP3FX9p+Y94YfIBvLnf8j/gfotZ+6q/lPzTvhBZAN+k/5B+61m7qr+U/Oe8ENkA36T/gH7TUzc1f1n5j3hh8gG/Cb9A/abmLi5+/9k3hN+gP8h/jJ3V//h/K/s/8v9L/lP+CHyAZ9J/wH7TVy89//s/g/+pP8v9T/yT/k+5W9kAv6g+0P2W8/cVf2n5j3hh8gH/Kj7QvRbrtyL7/wE/3/uX/gB/1/+Bv0D9ptcvPd/7v4j/sH8J/1P4Zf5kP+B+i1m7qr+U/Oe8ENkA/5S+0P0W8/cVf2n5j3hh8gG/Kf2h+i3mLi7+w/Nf8IPv1D/5wX6j1m5q/pPzXvCD79S/+cF+o9Zuav6T817wQ+QDfhN+gftNzFxV/efmveGHQy+u/gfyx/yT/k/9f7l/+R/kv8J/xT/iX8g//L/pfx/+Rf5b/in/C/6L/wY/wv/k/6A/1b5l/0X+w/6v/N/73+g/4l/8/8m/yn/Y/8D+w/1V/mX/gP7n/E/8j/3P9a+G36M+R+av6r/VPgR8y90/wv/G/2v+w/+N/q/5n/sf2H82f1b7F/qf3z82f23+n/1/9H/h/93/Z/9//f/1f/n/z/8n/7/+H/7/9f/6/+//u/9f/i//v/g/+v/h/+v/h/+v/i/+v/y/2D+q/1v+5/pv+T+q/0v/Z/mv+3+r/0f+n/x/0L+q/3v9D/Tf0r/V/0f/F/1/+H/Xf4n9V/7H9V/pv+V/a/5H9d/pf+t+af7X9f/pf+V/f/+X/l/+/+t/v/1v9X/lf9f/l/9/+v/hf9f/x/8b/+/9X/R/+/8P+q/3P9V/mf67/W/wD9X/d/q/6P+j/q/8b/W/7n+S/qv9j/X/0n/Z/kv7v+U/5P9n9L/nv7n+r/n/4n/V/9/+f/T/w/5v/J/o/8r/xP93+7/l/+T/e/6v/X/R/3/9H/d/1f9X/T/lf8H+j/1P9N/yf5b/U/8L+x/xv6D/U/87/xP73+u/0f/c/zH/h/4f/l/5/9L/p/+H/c/0H/K/qv9z/e/4v+r/xv7X+j/m/9H/Rf/n+S/of/H/Rf/n+y/p//P/Jf9P/h/y/9P/h/1v/P/F/4v/b/3/+L/Q/z3/n/6f+v/p/6r+7/V/1f+p+T/+P8l/8f8X/d/y/5L/o/y/6D/R/z3/X/3P9H/Tf9X/e/2P9b/qf7/+D/q/9L/B/0/+H/a/4f/j/z/9T/9/8H/e/4P+T/Ff9n+i/zf8r+w/8f9v/o/+H/Z/y/8v+S/+P/p/y/8f+k/4/+j/pf3L+v/p/yv/T/if+j/m/8L+n/xf9b/hf9P+j/5P9T/Rf/X+t/q/5T/E/9v9r/o/+z/hf9r+j/m/+7/t/tf9b/Zf2v+v/q/7H+9/q/9f/p/+T/5P8v+5/w/7X+p/x/8r/W/6H/x/of6r/y/9T/g/5v+b/+/+t/6v8r/6/+/+b/Vf+X/+/6P/F/6/+1/6/+L/U/7P+j/5v+v/q/5L/m/8/8P/q/9n+T/mv8b/k/8f+L/3f+D/8v9L/o/9X/t/8P+P/z/2P+h/xf6v+F/w/5P+f/q/6f+d/pf6/+N/n/x/+z/v/4f/j/2f9H/lf2f9P/5f33/l/zv+L/O/wf9X+v/ov9r/B/3v/r/kf9f/P/W/+v/d/+/8X/r/4/+z/pf8H+t/x/+j/w/5f/h/8f+p/+f/K/lf8H/u/zv8D/pf83/h/6v9z/+/6f8z/+/4/83/7/1/97/m/9//H/l/+/+p/7f/P/o/6/+R/8/+x/xf8X/+/2/8//9/8P8r/y/8//z/2/8v/R/+f+H/d/8f/B/y//H/+/8//p/4/+b/0f8L/R/8X/u/4v+f/S/+P/k//v/S//v+p/7//T/qf+7/j/5//v/o//f/y//f/T/6P/L/4/+v/xf9//l/6/+V/w/8H/u/5/+p/o/5v9j/pf/b/a/6v9X/+/4//p/5/9X/W/+v+3/l/0/9v/N/7f+z/xf/b/d/w/+3/y/8/+H/p/4v/T/rf6P/F/w/6P/R/8P+v/S//v+z/rf6P+3/n/y/+//r/3/8//d/y/9P/h/5/8X/+/3/+j/j/5//z/+/2L+j/rf3n/I/o/+H/n/o/9f+//o/+P/R/3/9T/R/y//H/T/+P+3/g/+/+T/e/+f+H/7//T/h/6f+v/qf+T/Z/9v9T/a/+v+V/+//D/+v9X/J/9/+v/8f+T/W/+v/j/1/9r/k/9//L/5/9v/Z/+v/7/1f+b/9/4f/n/z/+H/D/0v9j/a/y/7H/L/2f9f/W//v/d/7/+X/5/9v/h/y/9r/0/9H/h/y/9f+n/l/2v+H/Z/+v+L/9/+V/7/+7/x/8v+t/7f9v/D/0/+r/6f+n/N/w/+n/X/w/+3/Q/8v9//q/9f/Z/1f/n/9/7H/b/+f9P/+/+//q//f/t/0/9T/l/+f/r/4/+b/+/7H/X/5/+v+xWCwWi8VisVgsFovFYrFYLBaLxWKxWCwmZf8B33vV7+U8e5UAAAAASUVORK5CYII=';


function App() {
  const [students, setStudents] = useState<Student[]>(getInitialStudents);
  const [userRole, setUserRole] = useState<'admin' | 'student' | null>(null);
  const [loggedInStudent, setLoggedInStudent] = useState<Student | null>(null);
  const [logo, setLogo] = useState<string | null>(() => localStorage.getItem('ctlnLogo') || defaultLogo);

  const handleDeleteStudent = (studentId: number) => {
    setStudents(prevStudents =>
      prevStudents.filter(student => student.id !== studentId)
    );
  };

  const handleAddStudent = (newStudentData: Omit<Student, 'id'>) => {
    setStudents(prevStudents => {
      const newStudent: Student = {
        ...newStudentData,
        id: prevStudents.length > 0 ? Math.max(...prevStudents.map(s => s.id)) + 1 : 1,
      };
      return [...prevStudents, newStudent];
    });
  };
  
  const handleUpdatePaymentHistory = (studentId: number, year: number, monthIndex: number) => {
    setStudents(prevStudents => prevStudents.map(student => {
      if (student.id === studentId) {
        const newStudent = { ...student };
        const yearHistory = newStudent.paymentHistory[year] ? [...newStudent.paymentHistory[year]] : [];
        const monthIndexInHistory = yearHistory.indexOf(monthIndex);

        if (monthIndexInHistory > -1) {
          // Month is paid, so mark as pending (remove from history)
          yearHistory.splice(monthIndexInHistory, 1);
        } else {
          // Month is pending, so mark as paid (add to history)
          yearHistory.push(monthIndex);
          yearHistory.sort((a, b) => a - b);
        }
        
        newStudent.paymentHistory = { ...newStudent.paymentHistory, [year]: yearHistory };
        return newStudent;
      }
      return student;
    }));
  };

  const handleSetLogo = (logoData: string) => {
    localStorage.setItem('ctlnLogo', logoData);
    setLogo(logoData);
  };

  const handleAdminLogin = (user: string, pass: string): boolean => {
    if (user === 'ln' && pass === '123456') {
      setUserRole('admin');
      return true;
    }
    return false;
  };

  const handleStudentLogin = (cpf: string): boolean => {
    // Basic lookup by responsibleCpf. In a real app, might handle multiple students per CPF.
    const student = students.find(s => s.responsibleCpf.replace(/\D/g, '') === cpf.replace(/\D/g, ''));
    if (student) {
      setUserRole('student');
      setLoggedInStudent(student);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setUserRole(null);
    setLoggedInStudent(null);
  };

  return (
    <div className="min-h-screen bg-dojo-dark">
      {userRole ? (
        <>
          <Header
            userRole={userRole}
            onLogout={handleLogout}
            studentName={loggedInStudent?.name}
            logo={logo}
          />
          <main>
            {userRole === 'admin' ? (
              <AdminDashboard 
                students={students} 
                onDeleteStudent={handleDeleteStudent}
                onAddStudent={handleAddStudent}
                onSetLogo={handleSetLogo}
                onUpdatePaymentHistory={handleUpdatePaymentHistory}
              />
            ) : (
              <StudentPortal 
                student={loggedInStudent} 
              />
            )}
          </main>
        </>
      ) : (
        <Login onAdminLogin={handleAdminLogin} onStudentLogin={handleStudentLogin} logo={logo} />
      )}
    </div>
  );
}

export default App;
