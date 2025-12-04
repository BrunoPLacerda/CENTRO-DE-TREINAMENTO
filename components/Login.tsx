
import React, { useState } from 'react';

interface LoginProps {
  onAdminLogin: (user: string, pass: string) => boolean;
  onStudentLogin: (cpf: string) => boolean;
  logo: string | null;
}

const Login: React.FC<LoginProps> = ({ onAdminLogin, onStudentLogin, logo }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');

  const formatCpf = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove tudo o que não é dígito
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos
      .replace(/(\d{3})(\d)/, '$1.$2') // Coloca um ponto entre o terceiro e o quarto dígitos
      // de novo (para o segundo bloco de números)
      .replace(/(\d{3})(\d{1,2})/, '$1-$2') // Coloca um hífen entre o terceiro e o quarto dígitos
      .replace(/(-\d{2})\d+?$/, '$1'); // Impede que sejam digitados mais de 11 dígitos
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCpf(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (activeTab === 'admin') {
      const success = onAdminLogin(username, password);
      if (!success) {
        setError('Usuário ou senha administrativos inválidos.');
      }
    } else {
      // Student Login
      const cleanCpf = cpf.replace(/\D/g, '');
      if (cleanCpf.length !== 11) {
        setError('Por favor, insira um CPF válido com 11 dígitos.');
        return;
      }
      const success = onStudentLogin(cleanCpf);
      if (!success) {
        setError('CPF não encontrado ou não cadastrado como responsável.');
      }
    }
  };

  const handleForgotPassword = () => {
    alert('Entre em contato com a secretaria para recuperar seu acesso.');
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-white">
      
      {/* Background Image Layer - Subtle Watermark */}
      {logo && (
        <div className="absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          <img 
            src={logo} 
            alt="Background Pattern" 
            className="w-full h-full object-cover opacity-5 scale-110 blur-sm" 
          />
        </div>
      )}

      {/* Login Card Layer */}
      <div className="relative z-10 w-full max-w-lg mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-100">
        
        {/* Decorative Top Border - Black (Primary) */}
        <div className="absolute top-0 left-0 w-full h-3 bg-dojo-primary rounded-t-2xl"></div>

        <div className="flex flex-col items-center mb-6 mt-2">
          
          {/* Main Logo Display */}
          {logo && (
            <div className="mb-6 relative group">
              <div className="absolute -inset-1 bg-black rounded-full opacity-10 blur transition duration-1000 group-hover:opacity-20"></div>
              <img 
                src={logo} 
                alt="Logo Academia" 
                className="relative h-32 w-32 md:h-40 md:w-40 object-contain rounded-full bg-white p-1"
              />
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-extrabold text-dojo-primary text-center leading-tight">
            Centro de Treinamento <br />
            <span className="text-dojo-primary">Leandro Nascimento</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => { setActiveTab('student'); setError(''); }}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
              activeTab === 'student' 
                ? 'bg-white text-dojo-primary shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Área do Aluno
          </button>
          <button
            onClick={() => { setActiveTab('admin'); setError(''); }}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${
              activeTab === 'admin' 
                ? 'bg-white text-dojo-primary shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Administração
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {activeTab === 'student' ? (
            <div>
              <label htmlFor="cpf" className="block mb-2 text-sm font-bold text-gray-700">CPF do Responsável</label>
              <input
                type="text"
                id="cpf"
                value={cpf}
                onChange={handleCpfChange}
                required
                maxLength={14}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 text-lg rounded-lg focus:ring-dojo-primary focus:border-dojo-primary block p-3.5 transition-colors shadow-sm"
                placeholder="000.000.000-00"
              />
              <p className="mt-2 text-xs text-gray-500">
                Digite o CPF de quem realiza o pagamento da mensalidade.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="username" className="block mb-2 text-sm font-bold text-gray-700">Usuário</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 text-lg rounded-lg focus:ring-dojo-primary focus:border-dojo-primary block p-3.5 transition-colors shadow-sm"
                  placeholder="Digite seu usuário"
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-bold text-gray-700">Senha</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-400 text-lg rounded-lg focus:ring-dojo-primary focus:border-dojo-primary block p-3.5 transition-colors shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </>
          )}

          {activeTab === 'admin' && (
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-dojo-light-gray hover:text-dojo-primary font-medium transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded-lg text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-dojo-primary text-white font-bold py-4 px-4 rounded-lg hover:bg-dojo-primary-hover shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dojo-primary text-lg"
          >
            {activeTab === 'student' ? 'Acessar Portal' : 'Entrar como Admin'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
             <p className="text-xs text-gray-400">© 2025 CT Leandro Nascimento</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
