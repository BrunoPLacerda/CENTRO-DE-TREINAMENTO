
import { GoogleGenAI } from "@google/genai";
import type { Student } from '../types.ts';
import { PaymentStatus } from '../types.ts';

export const generateMonthlySummary = async (students: Student[]): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "Configuração de IA não encontrada. Verifique as variáveis de ambiente.";
  }

  const ai = new GoogleGenAI({ apiKey });
  const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
  const pendingStudents = students.filter(s => s.status === PaymentStatus.Pending);
  const pendingNames = pendingStudents.map(s => `- ${s.name} (Vence dia: ${s.dueDate.getDate()})`).join('\n');

  const prompt = `
    Você é o assistente do Professor Leandro Nascimento.
    Analise os pagamentos de ${currentMonth}.
    Pendentes:
    ${pendingNames || 'Nenhum pendente.'}

    Tarefa:
    1. Quem precisa de atenção imediata?
    2. Sugira uma mensagem educada de WhatsApp para cobrar.
    3. Valor total que ainda falta entrar.
    Seja breve e direto (estilo academia de Jiu Jitsu).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Análise concluída com sucesso.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao processar análise inteligente.";
  }
};
