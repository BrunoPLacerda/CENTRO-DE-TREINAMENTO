
import React from 'react';
import type { Student } from '../types.ts';
import { PaymentStatus } from '../types.ts';

interface StudentListProps {
  title: string;
  students: Student[];
  icon: React.ReactNode;
  onDelete: (student: Student) => void;
  onEdit: (student: Student) => void;
  onSelectStudent: (student: Student) => void;
}

const StudentList: React.FC<StudentListProps> = ({ title, students, icon, onDelete, onEdit, onSelectStudent }) => {
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
    e.stopPropagation();
    onDelete(student);
  };

  const handleEditClick = (e: React.MouseEvent, student: Student) => {
    e.stopPropagation();
    onEdit(student);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center uppercase tracking-tighter">
        {icon}
        <span className="ml-2">{title} ({students.length})</span>
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-dojo-light-gray">
          <thead className="text-[10px] text-gray-400 font-black uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3">Nome</th>
              <th scope="col" className="px-4 py-3 hidden md:table-cell">Idade</th>
              <th scope="col" className="px-4 py-3 hidden lg:table-cell">Responsável</th>
              <th scope="col" className="px-4 py-3">Mensalidade</th>
              <th scope="col" className="px-4 py-3 hidden md:table-cell">Vencimento</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? students.map((student) => (
              <tr 
                key={student.id} 
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onSelectStudent(student)}
              >
                <td className="px-4 py-4 font-bold text-gray-900 whitespace-nowrap">{student.name}</td>
                <td className="px-4 py-4 hidden md:table-cell">{student.age}</td>
                <td className="px-4 py-4 hidden lg:table-cell">{student.guardian}</td>
                <td className="px-4 py-4 font-bold">R$ {student.fee.toFixed(2)}</td>
                <td className="px-4 py-4 hidden md:table-cell">{formatDate(student.dueDate)}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${getStatusBadge(student.status)}`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={(e) => handleEditClick(e, student)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, student)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400 font-bold uppercase">Nenhum aluno cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;
