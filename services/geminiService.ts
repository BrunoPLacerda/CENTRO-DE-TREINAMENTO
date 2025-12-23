
import { GoogleGenAI } from "@google/genai";
import type { Student } from '../types';
import { PaymentStatus } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMonthlySummary = async (students: Student[]): Promise<string> => {
  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
  const pendingStudents = students.filter(s => s.status === PaymentStatus.Pending);
  
  const pendingNames = pendingStudents.map(s => `- ${s.name} (Vence: ${s.dueDate.toLocaleDateString('pt-BR')})`).join('\n');

  const prompt = `
    Você é o assistente financeiro do Professor Leandro Nascimento.
    Analise a situação de pagamentos de ${currentMonth}.
    
    Temos ${pendingStudents.length} alunos pendentes.
    Lista de Pendentes:
    ${pendingNames || 'Nenhum pendente.'}

    Tarefa:
    1. Resuma quem são os alunos que precisam de atenção imediata (atrasados).
    2. Sugira uma mensagem de texto curta e educada para enviar no WhatsApp desses alunos.
    3. Dê uma estimativa de quanto o CT ainda tem a receber este mês.
    
    Seja direto, use tom profissional mas amigável (clima de academia de Jiu Jitsu).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating report:", error);
    return "Não foi possível gerar a análise agora. Verifique a lista de pendentes abaixo.";
  }
};
