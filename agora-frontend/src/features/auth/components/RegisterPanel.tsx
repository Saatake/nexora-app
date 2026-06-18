import React from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  BookOpen,
  PenSquare,
} from 'lucide-react';
import { FACENS_COURSES } from '@/constants/facensCourses';
import { passwordRequirements } from '../constants/passwordRequirements';

type RegisterPanelProps = {
  isLogin: boolean;
  formData: {
    name: string;
    email: string;
    password: string;
    course: string;
    bio: string;
    roleType: string;
  };
  confirmPassword: string;
  showPassword: boolean;
  error: string;
  success: string;
  loading: boolean;
  onFieldChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onConfirmPasswordChange: (v: string) => void;
  onRoleChange: (role: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onSwitchToLogin: () => void;
};

const RegisterPanel = ({
  isLogin,
  formData,
  confirmPassword,
  showPassword,
  error,
  success,
  loading,
  onFieldChange,
  onConfirmPasswordChange,
  onRoleChange,
  onTogglePassword,
  onSubmit,
  onSwitchToLogin,
}: RegisterPanelProps) => (
  <div
    className={`absolute top-0 left-0 md:left-auto md:right-0 w-full md:w-1/2 h-full bg-white p-8 md:p-10 overflow-y-auto custom-scrollbar transition-transform duration-700 ease-in-out z-10 ${
      !isLogin
        ? 'translate-x-0 opacity-100 pointer-events-auto'
        : 'translate-x-full opacity-0 pointer-events-none md:translate-x-0 md:opacity-100 md:pointer-events-auto'
    }`}
  >
    <div className="flex flex-col min-h-full justify-start max-w-sm mx-auto py-2">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Criar conta</h1>

      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => onRoleChange('Estudante')}
          className={`flex-1 py-2 text-sm font-semibold rounded border transition-all ${
            formData.roleType === 'Estudante'
              ? 'border-green-800 text-green-800 bg-green-50'
              : 'border-gray-300 text-gray-500 hover:text-gray-700'
          }`}
        >
          Aluno
        </button>
        <button
          type="button"
          onClick={() => onRoleChange('Professor')}
          className={`flex-1 py-2 text-sm font-semibold rounded border transition-all ${
            formData.roleType === 'Professor'
              ? 'border-green-800 text-green-800 bg-green-50'
              : 'border-gray-300 text-gray-500 hover:text-gray-700'
          }`}
        >
          Professor
        </button>
      </div>

      {error && !isLogin && (
        <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-lg text-center whitespace-pre-line">
          {error}
        </div>
      )}
      {success && !isLogin && (
        <div className="mb-4 text-sm text-emerald-700 bg-emerald-100 p-3 rounded-lg text-center">
          {success}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            name="name"
            placeholder="Seu nome completo"
            value={formData.name}
            onChange={onFieldChange}
            required
            className="pl-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 placeholder-gray-400"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            name="email"
            placeholder="seu.email@universidade.edu.br"
            value={formData.email}
            onChange={onFieldChange}
            required
            className="pl-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Senha"
              value={formData.password}
              onChange={onFieldChange}
              required
              className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 placeholder-gray-400"
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              required
              className="pl-4 pr-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 placeholder-gray-400"
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

        <div className="rounded-lg border border-green-100 bg-green-50/70 p-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">A senha precisa ter:</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
            {passwordRequirements.map((requirement) => {
              const isMet = requirement.test(formData.password);
              return (
                <li
                  key={requirement.label}
                  className={`flex items-center gap-2 ${isMet ? 'text-green-800' : 'text-gray-500'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-2 w-2 rounded-full ${isMet ? 'bg-green-700' : 'bg-gray-300'}`}
                  />
                  {requirement.label}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <BookOpen className="h-5 w-5 text-gray-400" />
          </div>
          <select
            name="course"
            value={formData.course}
            onChange={onFieldChange}
            className="pl-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 bg-white appearance-none"
          >
            <option value="">Selecione seu curso</option>
            {FACENS_COURSES.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <PenSquare className="h-5 w-5 text-gray-400" />
          </div>
          <textarea
            name="bio"
            placeholder="Foco acadêmico (opcional)"
            value={formData.bio}
            onChange={onFieldChange}
            rows={2}
            className="pl-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 placeholder-gray-400 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#0a5c2f] hover:bg-[#084925] disabled:bg-green-400 text-white text-sm font-bold rounded shadow transition-colors mt-2"
        >
          {loading ? 'Criando conta...' : 'Cadastrar'}
        </button>

        <p className="md:hidden text-center text-sm text-gray-600 mt-6">
          Já tem uma conta?{' '}
          <button type="button" onClick={onSwitchToLogin} className="font-bold text-[#0a5c2f]">
            Entrar
          </button>
        </p>
      </form>
    </div>
  </div>
);

export default RegisterPanel;
