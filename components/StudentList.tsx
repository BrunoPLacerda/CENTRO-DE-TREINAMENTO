import React from 'react';
import type { Student } from '../types';
import { PaymentStatus } from '../types';

interface StudentListProps {
  title: string;
  students: Student[];
  icon: React.ReactNode;
  onDelete: (student: Student) => void;
  onSelectStudent: (student: Student) => void;
}

const StudentList: React.FC<StudentListProps> = ({ title, students, icon, onDelete, onSelectStudent }) => {
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Paid:
        return 'bg-green-500 text-white';
      case PaymentStatus.Pending:
        return 'bg-dojo-accent text-dojo-primary font-medium';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  }

  const handleDeleteClick = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation(); // Prevent row click event when deleting
    onDelete(student);
  };

  return (
    <div className="bg-dojo-light-dark p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        {icon}
        <span className="ml-2">{title} ({students.length})</span>
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-dojo-light-gray">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3">Nome</th>
              <th scope="col" className="px-4 py-3 hidden md:table-cell">Idade</th>
              <th scope="col" className="px-4 py-3 hidden lg:table-cell">Responsável</th>
              <th scope="col" className="px-4 py-3">Mensalidade</th>
              <th scope="col" className="px-4 py-3 hidden md:table-cell">Vencimento</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? students.map((student) => (
              <tr 
                key={student.id} 
                className="border-b border-dojo-gray hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectStudent(student)}
              >
                <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{student.name}</td>
                <td className="px-4 py-3 hidden md:table-cell">{student.age}</td>
                <td className="px-4 py-3 hidden lg:table-cell">{student.guardian}</td>
                <td className="px-4 py-3">R$ {student.fee.toFixed(2)}</td>
                <td className="px-4 py-3 hidden md:table-cell">{formatDate(student.dueDate)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(student.status)}`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => handleDeleteClick(e, student)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                    aria-label={`Deletar ${student.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="text-center py-4">Nenhum aluno nesta lista.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;