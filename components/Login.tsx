import React, { useState } from 'react';
import { api } from '../src/lib/api.ts';

interface LoginProps {
  onLoginSuccess: () => void;
  logo: string | null;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, logo }) => {
  const [loginType, setLoginType] = useState<'student' | 'admin'>('student');
  
  // Student inputs
  const [cpfInput, setCpfInput] = useState('');
  
  // Admin inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatCpf = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpfInput(formatCpf(e.target.value));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (loginType === 'student') {
        const cleanCpf = cpfInput.replace(/\D/g, '');
        if (cleanCpf.length !== 11) {
          throw new Error('Por favor, insira um CPF válido com 11 dígitos.');
        }
        await api.login({ type: 'student', cpf: cleanCpf });
      } else {
        if (!username || !password) {
          throw new Error('Por favor, preencha o usuário e a senha.');
        }
        await api.login({ type: 'admin', username, password });
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error('Erro de login:', err);
      setError(err.message || 'Erro ao realizar login. Verifique os dados inseridos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-white">
      
      {/* Background Image Layer - Subtle Watermark */}
      {logo && (
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          <img 
            src={logo} 
            alt="Background Pattern" 
            className="w-full h-full object-cover opacity-10 scale-110 blur-md" 
          />
        </div>
      )}

      {/* Login Card Layer */}
      <div className="relative z-10 w-full max-w-md mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-100">
        
        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 w-full h-3 bg-gray-900 rounded-t-2xl"></div>

        <div className="flex flex-col items-center mb-8 mt-2">
          
          {/* Main Logo Display */}
          {logo && (
            <div className="mb-4 relative group">
              <div className="absolute -inset-1 bg-black rounded-full opacity-10 blur transition duration-1000 group-hover:opacity-20"></div>
              <img 
                src={logo} 
                alt="Logo Academia" 
                className="relative h-28 w-28 md:h-32 md:w-32 object-contain rounded-full bg-white p-1"
              />
            </div>
          )}

          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 text-center leading-tight">
            Centro de Treinamento <br />
            <span className="text-gray-900">Leandro Nascimento</span>
          </h1>
          <p className="text-gray-500 text-xs mt-2 text-center">
            Acesse o Portal de Alunos ou o Painel de Controle de forma simples e rápida.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => {
              setLoginType('student');
              setError('');
            }}
            className={`flex-1 pb-3 text-center font-bold text-sm transition-colors border-b-2 ${
              loginType === 'student'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Portal do Aluno
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginType('admin');
              setError('');
            }}
            className={`flex-1 pb-3 text-center font-bold text-sm transition-colors border-b-2 ${
              loginType === 'admin'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Administrativo
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {loginType === 'student' ? (
            <div>
              <label htmlFor="cpfInput" className="block text-sm font-bold text-gray-700 mb-1">
                CPF do Responsável Financeiro
              </label>
              <input
                type="text"
                id="cpfInput"
                value={cpfInput}
                onChange={handleCpfChange}
                required
                maxLength={14}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 text-lg rounded-lg focus:ring-gray-900 focus:border-gray-900 block p-3 transition-colors shadow-sm"
                placeholder="000.000.000-00"
                disabled={isLoading}
              />
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="username" className="block text-sm font-bold text-gray-700 mb-1">
                  Usuário
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg focus:ring-gray-900 focus:border-gray-900 block p-3 transition-colors shadow-sm"
                  placeholder="Seu usuário"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 rounded-lg focus:ring-gray-900 focus:border-gray-900 block p-3 transition-colors shadow-sm"
                  placeholder="******"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          {error && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-xs rounded-lg font-medium text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-black shadow-md transition-all duration-200 flex justify-center items-center disabled:opacity-50 text-base"
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">© 2026 CT Leandro Nascimento</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
