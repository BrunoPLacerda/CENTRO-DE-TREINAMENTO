// Helper to get local auth token
function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('ct_token');
  if (!token) {
    return {
      'Content-Type': 'application/json'
    };
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export const api = {
  // Save token locally
  setToken(token: string) {
    localStorage.setItem('ct_token', token);
  },

  // Remove token locally
  logout() {
    localStorage.removeItem('ct_token');
  },

  // For compatibility with any legacy references
  removeToken() {
    localStorage.removeItem('ct_token');
  },

  // Check if token exists
  hasToken(): boolean {
    return !!localStorage.getItem('ct_token');
  },

  // Custom login: handles both admin (user/pass) and student (CPF)
  async login(payload: { type: 'admin' | 'student'; username?: string; password?: string; cpf?: string }) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao realizar login.');
    }
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async fetchMe() {
    const headers = getAuthHeader();
    const res = await fetch('/api/auth/me', { headers });
    if (!res.ok) {
      throw new Error('Failed to fetch auth state');
    }
    return res.json();
  },

  async linkCpf(cpf: string) {
    const headers = getAuthHeader();
    const res = await fetch('/api/students/link', {
      method: 'POST',
      headers,
      body: JSON.stringify({ cpf }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao vincular CPF');
    }
    return data;
  },

  async fetchStudents() {
    const headers = getAuthHeader();
    const res = await fetch('/api/students', { headers });
    if (!res.ok) {
      throw new Error('Failed to fetch students');
    }
    const data = await res.json();
    return data.map((s: any) => ({
      ...s,
      dueDate: new Date(s.dueDate),
      startDate: new Date(s.startDate),
    }));
  },

  async addStudent(studentData: any) {
    const headers = getAuthHeader();
    const res = await fetch('/api/students', {
      method: 'POST',
      headers,
      body: JSON.stringify(studentData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao adicionar aluno');
    }
    return {
      ...data,
      dueDate: new Date(data.dueDate),
      startDate: new Date(data.startDate),
    };
  },

  async updateStudent(id: number, studentData: any) {
    const headers = getAuthHeader();
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(studentData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao atualizar aluno');
    }
    return {
      ...data,
      dueDate: new Date(data.dueDate),
      startDate: new Date(data.startDate),
    };
  },

  async deleteStudent(id: number) {
    const headers = getAuthHeader();
    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao excluir aluno');
    }
    return data;
  },

  async updatePaymentHistory(id: number, year: number, monthIndex: number) {
    const headers = getAuthHeader();
    const res = await fetch(`/api/students/${id}/payment`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ year, monthIndex }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao atualizar histórico de pagamento');
    }
    return {
      ...data,
      dueDate: new Date(data.dueDate),
      startDate: new Date(data.startDate),
    };
  }
};
