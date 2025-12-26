
import React, { useState, useEffect } from 'react';
import type { Student } from '../types.ts';
import { PaymentStatus } from '../types.ts';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdateStudent: (student: Student) => void;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({ isOpen, onClose, student, onUpdateStudent }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    guardian: '',
    responsibleCpf: '',
    fee: '',
    dueDate: '',
    phone: '',
    startDate: '',
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        age: student.age.toString(),
        guardian: student.guardian,
        responsibleCpf: student.responsibleCpf,
        fee: student.fee.toString(),
        dueDate: student.dueDate.toISOString().split('T')[0],
        phone: student.phone,
        startDate: student.startDate.toISOString().split('T')[0],
      });
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStudent({
      ...student,
      name: formData.name,
      age: Number(formData.age),
      guardian: formData.guardian,
      responsibleCpf: formData.responsibleCpf,
      fee: Number(formData.fee),
      dueDate: new Date(formData.dueDate + 'T00:00:00'),
      phone: formData.phone,
      startDate: new Date(formData.startDate + 'T00:00:00'),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg mx-auto overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">✏️ Editar Aluno</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Nome Completo</label>
            <input name="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl font-bold" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Idade</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl font-bold" />
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Responsável</label>
                <input name="guardian" value={formData.guardian} onChange={handleChange} className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl font-bold" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">CPF (Login)</label>
            <input name="responsibleCpf" value={formData.responsibleCpf} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl font-bold" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Mensalidade (R$)</label>
                <input type="number" name="fee" value={formData.fee} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl font-bold" />
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Telefone</label>
                <input name="phone" value={formData.phone} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Vencimento</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl font-bold" />
            </div>
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Início</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl font-bold" />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-500 font-black py-4 rounded-xl uppercase text-sm">Cancelar</button>
            <button type="submit" className="flex-1 bg-dojo-primary text-white font-black py-4 rounded-xl uppercase text-sm">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentModal;
