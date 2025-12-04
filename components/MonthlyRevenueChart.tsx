import React, { useState, useMemo } from 'react';
import type { Student } from '../types';
import { PaymentStatus } from '../types';

interface MonthlyRevenueChartProps {
  students: Student[];
}

const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({ students }) => {
  const Recharts = (window as any).Recharts;

  if (!Recharts) {
    return (
      <div className="bg-dojo-light-dark p-6 rounded-lg shadow-lg h-96 w-full flex items-center justify-center">
        <p className="text-white">Carregando gráfico...</p>
      </div>
    );
  }

  const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } = Recharts;

  const availableYears = useMemo(() => {
    const years = new Set(students.map(s => s.dueDate.getFullYear()));
    // FIX: Explicitly type sort parameters as numbers to resolve TypeScript inference issue.
    return Array.from(years).sort((a: number, b: number) => b - a); // Sort descending
  }, [students]);
  
  const [selectedYear, setSelectedYear] = useState<number>(() => 
    availableYears.length > 0 ? availableYears[0] : new Date().getFullYear()
  );

  const chartData = useMemo(() => {
    const months = [
      { name: 'Jan', Receita: 0 }, { name: 'Fev', Receita: 0 },
      { name: 'Mar', Receita: 0 }, { name: 'Abr', Receita: 0 },
      { name: 'Mai', Receita: 0 }, { name: 'Jun', Receita: 0 },
      { name: 'Jul', Receita: 0 }, { name: 'Ago', Receita: 0 },
      { name: 'Set', Receita: 0 }, { name: 'Out', Receita: 0 },
      { name: 'Nov', Receita: 0 }, { name: 'Dez', Receita: 0 },
    ];

    students
      .filter(s => s.status === PaymentStatus.Paid && s.dueDate.getFullYear() === selectedYear)
      .forEach(s => {
        const monthIndex = s.dueDate.getMonth();
        months[monthIndex].Receita += s.fee;
      });

    return months;
  }, [students, selectedYear]);
  
  return (
    <div className="bg-dojo-light-dark p-6 rounded-lg shadow-lg h-96 w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Receita Mensal</h3>
        {availableYears.length > 0 && (
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-dojo-dark border border-dojo-gray text-white text-sm rounded-lg focus:ring-dojo-primary focus:border-dojo-primary p-1.5"
            aria-label="Selecionar ano"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        )}
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
          <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `R$${value}`} />
          <Tooltip
            cursor={{ fill: 'rgba(75, 85, 99, 0.3)' }}
            contentStyle={{
              backgroundColor: '#1F2937',
              borderColor: '#4B5563',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: '#E5E7EB' }}
            formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
          />
          <Bar dataKey="Receita" fill="#4F46E5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyRevenueChart;