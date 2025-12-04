
import React, { useState } from 'react';
import type { Student } from '../types';
import { PaymentStatus } from '../types';

type NewStudentData = Omit<Student, 'id'>;

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (student: NewStudentData) => void;
}

interface InputFieldProps {
  name: string;
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
  error?: string;
  children?: React.ReactNode;
}

// Component definition moved outside to prevent focus loss
const InputField: React.FC<InputFieldProps> = ({ 
  name, label, value, onChange, type = 'text', required = false, children, maxLength, error 
}) => (
  <div>
    <label htmlFor={name} className="block mb-2 text-sm font-medium text-dojo-light-gray">{label}</label>
    {children ? children : (
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        className="w-full bg-gray-50 border border-dojo-gray text-gray-900 placeholder-gray-400 text-sm rounded-lg focus:ring-dojo-primary focus:border-dojo-primary block p-2.5"
      />
    )}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, onAddStudent }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    guardian: '',
    responsibleCpf: '',
    fee: '',
    status: PaymentStatus.Pending,
    dueDate: '',
    phone: '',
    startDate: '',
  });

  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  if (!isOpen) return null;

  const formatCpf = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue = value;
    
    if (name === 'responsibleCpf') {
        finalValue = formatCpf(value);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const validate = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.name) newErrors.name = 'Nome é obrigatório';
    if (!formData.age) newErrors.age = 'Idade é obrigatória';
    if (!formData.fee) newErrors.fee = 'Mensalidade é obrigatória';
    if (!formData.responsibleCpf || formData.responsibleCpf.length < 14) newErrors.responsibleCpf = 'CPF válido é obrigatório';
    if (!formData.dueDate) newErrors.dueDate = 'Data de vencimento é obrigatória';
    if (!formData.startDate) newErrors.startDate = 'Data de início é obrigatória';
    if (!formData.phone) newErrors.phone = 'Telefone é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    onAddStudent({
      name: formData.name,
      age: Number(formData.age),
      guardian: formData.guardian || 'Próprio',
      responsibleCpf: formData.responsibleCpf,
      fee: Number(formData.fee),
      status: formData.status as PaymentStatus,
      dueDate: new Date(formData.dueDate + 'T00:00:00'),
      startDate: new Date(formData.startDate + 'T00:00:00'),
      phone: formData.phone,
      paymentHistory: {}, // Initialize with empty history
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-dojo-light-dark rounded-lg shadow-xl p-6 w-full max-w-lg mx-auto overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Adicionar Novo Aluno</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField 
            name="name" 
            label="Nome Completo" 
            value={formData.name} 
            onChange={handleChange} 
            error={errors.name} 
            required 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField 
              name="age" 
              label="Idade" 
              type="number" 
              value={formData.age} 
              onChange={handleChange} 
              error={errors.age} 
              required 
            />
            <InputField 
              name="guardian" 
              label="Responsável" 
              value={formData.guardian} 
              onChange={handleChange} 
              error={errors.guardian} 
            />
          </div>
          <InputField 
            name="responsibleCpf" 
            label="CPF do Responsável (Login)" 
            value={formData.responsibleCpf} 
            onChange={handleChange} 
            error={errors.responsibleCpf} 
            required 
            maxLength={14} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField 
              name="fee" 
              label="Valor da Mensalidade" 
              type="number" 
              value={formData.fee} 
              onChange={handleChange} 
              error={errors.fee} 
              required 
            />
            <InputField 
              name="status" 
              label="Status do Pagamento (Atual)" 
              value={formData.status} 
              onChange={handleChange} 
              required
            >
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-dojo-gray text-gray-900 placeholder-gray-400 text-sm rounded-lg focus:ring-dojo-primary focus:border-dojo-primary block p-2.5"
              >
                <option value={PaymentStatus.Pending}>Pendente</option>
                <option value={PaymentStatus.Paid}>Pago</option>
              </select>
            </InputField>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField 
                name="dueDate" 
                label="Próximo Vencimento" 
                type="date" 
                value={formData.dueDate} 
                onChange={handleChange} 
                error={errors.dueDate} 
                required 
              />
              <InputField 
                name="startDate" 
                label="Data de Início do Treino" 
                type="date" 
                value={formData.startDate} 
                onChange={handleChange} 
                error={errors.startDate} 
                required 
              />
           </div>
            <InputField 
              name="phone" 
              label="Telefone (ex: 5522935000824)" 
              value={formData.phone} 
              onChange={handleChange} 
              error={errors.phone} 
              required 
            />
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium bg-dojo-primary hover:bg-dojo-primary-hover text-white transition-colors">
              Salvar Aluno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudentModal;
