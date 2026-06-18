import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

type LoginPanelProps = {
  isLogin: boolean;
  loginEmail: string;
  loginPassword: string;
  loginRoleTab: 'Aluno' | 'Professor';
  showPassword: boolean;
  error: string;
  loading: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onRoleChange: (r: 'Aluno' | 'Professor') => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToRegister: () => void;
};

const LoginPanel = ({
  isLogin,
  loginEmail,
  loginPassword,
  loginRoleTab,
  showPassword,
  error,
  loading,
  onEmailChange,
  onPasswordChange,
  onRoleChange,
  onTogglePassword,
  onSubmit,
  onSwitchToRegister,
}: LoginPanelProps) => (
  <div
    className={`absolute top-0 left-0 w-full md:w-1/2 h-full bg-white p-8 md:p-10 overflow-y-auto transition-transform duration-700 ease-in-out z-10 ${
      isLogin
        ? 'translate-x-0 opacity-100 pointer-events-auto'
        : '-translate-x-full opacity-0 pointer-events-none md:translate-x-0 md:opacity-100 md:pointer-events-auto'
    }`}
  >
    <div className="flex flex-col h-full justify-center max-w-sm mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Login</h1>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => onRoleChange('Aluno')}
          className={`flex-1 py-2 text-sm font-semibold rounded border transition-all ${
            loginRoleTab === 'Aluno'
              ? 'border-green-800 text-green-800 bg-green-50'
              : 'border-gray-300 text-gray-500 hover:text-gray-700'
          }`}
        >
          Aluno
        </button>
        <button
          onClick={() => onRoleChange('Professor')}
          className={`flex-1 py-2 text-sm font-semibold rounded border transition-all ${
            loginRoleTab === 'Professor'
              ? 'border-green-800 text-green-800 bg-green-50'
              : 'border-gray-300 text-gray-500 hover:text-gray-700'
          }`}
        >
          Professor
        </button>
      </div>

      {error && isLogin && (
        <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-lg text-center">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              placeholder={
                loginRoleTab === 'Aluno' ? 'E-mail Institucional' : 'professor@universidade.edu.br'
              }
              value={loginEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={loginPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 placeholder-gray-400"
            />
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm mt-2 mb-6">
          <Link
            to="/forgot-password"
            className="text-gray-500 hover:text-gray-800 underline decoration-gray-400 underline-offset-2"
          >
            Esqueci a senha
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#0a5c2f] hover:bg-[#084925] disabled:bg-green-400 text-white text-sm font-bold rounded shadow transition-colors"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p className="md:hidden text-center text-sm text-gray-600 mt-6">
          Não tem uma conta?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-[#0a5c2f]"
          >
            Registre-se
          </button>
        </p>
      </form>
    </div>
  </div>
);

export default LoginPanel;
