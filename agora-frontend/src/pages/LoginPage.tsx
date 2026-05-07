import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [roleTab, setRoleTab] = useState<'Aluno' | 'Professor'>('Aluno');
  const { login } = useAuth();
  const navigate = useNavigate();

  const getErrorMessage = (err: any, fallback: string) => {
    const data = err?.response?.data;
    if (typeof data?.message === 'string') {
      return data.message;
    }
    if (Array.isArray(data?.errors)) {
      return data.errors.join(', ');
    }
    if (data?.errors && typeof data.errors === 'object') {
      return Object.values(data.errors).flat().join(', ');
    }
    return fallback;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      const meResponse = await api.get('/users/me');

      login(token, meResponse.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Erro ao realizar login'));
    }
  };

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-700 via-blue-600 to-teal-400 p-4'>
      <div className='mb-8 flex items-center text-white text-3xl font-bold tracking-tight'>
        <div className='bg-white text-indigo-700 w-10 h-10 flex items-center justify-center rounded-lg mr-3 shadow-lg'>
          A
        </div>
        Ágora
      </div>

      <div className='bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10 relative'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-extrabold text-gray-900'>Bem-vindo de volta</h1>
          <p className='text-sm text-gray-500 mt-2'>Entre para acessar sua conta</p>
        </div>

        <div className='flex bg-gray-100 p-1 mb-8 rounded-xl shadow-inner'>
          <button onClick={() => setRoleTab('Aluno')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${roleTab === 'Aluno' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}>
            Aluno
          </button>
          <button onClick={() => setRoleTab('Professor')} className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${roleTab === 'Professor' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}>
            Professor
          </button>
        </div>

        {error && <div className='mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-lg text-center'>{error}</div>}

        <form onSubmit={handleLogin} className='space-y-5'>
          <div className='space-y-1'>
            <label className='text-sm font-semibold text-gray-700'>Email</label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Mail className='h-5 w-5 text-gray-400' />
              </div>
              <input type='email' placeholder={roleTab === 'Aluno' ? 'seu.email@universidade.edu.br' : 'professor@universidade.edu.br'} value={email} onChange={(e) => setEmail(e.target.value)} required className='pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-800 placeholder-gray-400' />
            </div>
          </div>

          <div className='space-y-1'>
            <label className='text-sm font-semibold text-gray-700'>Senha</label>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Lock className='h-5 w-5 text-gray-400' />
              </div>
              <input type='password' placeholder='••••••••' value={password} onChange={(e) => setPassword(e.target.value)} required className='pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-800 placeholder-gray-400' />
            </div>
          </div>

          <div className='flex items-center justify-between text-sm mt-4'>
            <label className='flex items-center text-gray-600 cursor-pointer'>
              <input type='checkbox' className='form-checkbox h-4 w-4 text-indigo-600 rounded border-gray-300 mr-2' />
              Lembrar de mim
            </label>
            <Link to='/forgot-password' className='font-semibold text-indigo-600 hover:text-indigo-500'>Esqueci a senha</Link>
          </div>

          <button type='submit' className='w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg transition-colors mt-6'>
            Entrar
          </button>
          
          <div className='mt-8 relative flex items-center justify-center'>
            <div className='absolute inset-0 flex items-center' aria-hidden='true'>
              <div className='w-full border-t border-gray-200'></div>
            </div>
            <div className='relative flex justify-center text-xs'>
              <span className='px-2 bg-white text-gray-400'>ou</span>
            </div>
          </div>

          <p className='text-center text-sm text-gray-600 mt-6'>
            Não tem uma conta? <Link to='/register' className='font-bold text-indigo-600 hover:text-indigo-500'>Criar conta</Link>
          </p>
        </form>
      </div>

      <div className='mt-8'>
         <Link to='/' className='text-white/80 hover:text-white text-sm font-medium transition-colors'>
            ← Voltar para página inicial
         </Link>
      </div>
    </div>
  );
};
export default LoginPage;
