
import React from 'react';

interface HeaderProps {
  userRole: 'admin' | 'student';
  onLogout: () => void;
  studentName?: string;
  logo: string | null;
}

const Header: React.FC<HeaderProps> = ({ userRole, onLogout, studentName, logo }) => {
  return (
    <header className="bg-dojo-light-dark p-4 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4">
      {/* Logo and Title Section */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
        {logo ? (
          <img src={logo} alt="Logo do CT Leandro Nascimento" className="h-10 w-10 rounded-full object-contain bg-black flex-shrink-0" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-dojo-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )}
        <div>
          <h1 className="text-lg md:text-xl font-bold text-gray-800">
            CT Leandro Nascimento
          </h1>
          {userRole === 'student' && studentName && (
             <p className="text-sm text-dojo-light-gray">Aluno: <span className="font-medium text-dojo-primary">{studentName}</span></p>
          )}
          {userRole === 'admin' && (
             <p className="text-sm text-dojo-light-gray">Painel Administrativo</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex w-full sm:w-auto gap-2 justify-end">
        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
          Sair
        </button>
      </div>
    </header>
  );
};

export default Header;
