import { GoogleGenAI } from "@google/genai";
import type { Student } from '../types';
import { PaymentStatus } from '../types';

// Fix: Initialize GoogleGenAI client directly with process.env.API_KEY and remove redundant checks, as per guidelines.
// Assume process.env.API_KEY is available and configured.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMonthlySummary = async (students: Student[]): Promise<string> => {
  const totalStudents = students.length;
  const paidStudents = students.filter(s => s.status === PaymentStatus.Paid).length;
  const pendingStudents = totalStudents - paidStudents;
  const totalRevenue = students
    .filter(s => s.status === PaymentStatus.Paid)
    .reduce((acc, s) => acc + s.fee, 0);
  const pendingRevenue = students
    .filter(s => s.status === PaymentStatus.Pending)
    .reduce((acc, s) => acc + s.fee, 0);

  const studentDataSummary = students.map(s => 
    `- ${s.name} (Idade: ${s.age}, Responsável: ${s.guardian}, Mensalidade: R$${s.fee.toFixed(2)}, Status: ${s.status})`
  ).join('\n');

  const prompt = `
    Você é um assistente financeiro para o Centro de Treinamento Leandro Nascimento.
    Com base nos dados a seguir, gere um relatório financeiro mensal conciso e profissional em Português.
    O relatório deve ser fácil de ler, usando markdown para formatação (títulos, negrito e listas).

    Dados Atuais:
    - Total de Alunos: ${totalStudents}
    - Alunos que Pagaram: ${paidStudents}
    - Alunos Pendentes: ${pendingStudents}
    - Receita Total Confirmada: R$${totalRevenue.toFixed(2)}
    - Receita Pendente: R$${pendingRevenue.toFixed(2)}

    O relatório deve incluir:
    1. Um resumo geral do mês.
    2. Uma análise da saúde financeira (porcentagem de pagantes).
    3. Recomendações de ações, como entrar em contato com alunos pendentes.

    Não inclua a lista detalhada de alunos no seu relatório final, apenas use os dados agregados.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating report with Gemini:", error);
    return "Ocorreu um erro ao gerar o relatório. Verifique o console para mais detalhes.";
  }
};