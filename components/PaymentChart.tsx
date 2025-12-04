import React from 'react';
import type { Student } from '../types';
import { PaymentStatus } from '../types';

// Since we are using a CDN, Recharts is available globally.
// We will access it inside the component to avoid race conditions on module load.

interface PaymentChartProps {
  students: Student[];
}

const PaymentChart: React.FC<PaymentChartProps> = ({ students }) => {
  // Access Recharts from the window object here, when the component renders.
  const Recharts = (window as any).Recharts;

  // Handle case where Recharts hasn't loaded yet.
  if (!Recharts) {
    return (
      <div className="bg-dojo-light-dark p-6 rounded-lg shadow-lg h-96 w-full flex items-center justify-center">
        <p className="text-white">Carregando gráfico...</p>
      </div>
    );
  }
  
  const { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } = Recharts;

  const paidCount = students.filter(s => s.status === PaymentStatus.Paid).length;
  const pendingCount = students.filter(s => s.status === PaymentStatus.Pending).length;

  const data = [
    { name: 'Pagos', value: paidCount },
    { name: 'Pendentes', value: pendingCount },
  ];

  const COLORS = ['#10B981', '#F59E0B'];

  return (
    <div className="bg-dojo-light-dark p-6 rounded-lg shadow-lg h-96 w-full">
      <h3 className="text-lg font-semibold text-white mb-4">Visão Geral dos Pagamentos</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              borderColor: '#4B5563',
              borderRadius: '0.5rem'
            }}
            itemStyle={{ color: '#E5E7EB' }}
           />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentChart;