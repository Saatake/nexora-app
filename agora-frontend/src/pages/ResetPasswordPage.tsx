import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import fundoLivro from '../assets/livro-coluna.png';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const token = searchParams.get('token') || ''; // Token oculto, pego da URL
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        email,
        token, // Usa o token da URL
        newPassword
      });
      setSuccess(response.data?.message || 'Senha redefinida com sucesso!');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Erro ao redefinir senha'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className='min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-cover bg-center bg-no-repeat'
      style={{ backgroundImage: `url(${fundoLivro})` }}
    >
      <div className='mb-6 relative z-10'>
        <img 
          src='/src/assets/logo-icon.png' 
          alt='Ágora' 
          className='h-20 drop-shadow-lg'
        />
      </div>

      <div className='relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl p-8 md:p-10'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>Nova senha</h1>
          <p className='text-sm text-gray-500 mt-2'>Defina sua nova senha para continuar.</p>
        </div>

        {error && <div className='mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-lg text-center'>{error}</div>}
        {success && <div className='mb-4 text-sm text-emerald-700 bg-emerald-100 p-3 rounded-lg text-center'>{success}</div>}

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div className='space-y-1'>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Mail className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='email'
                placeholder='seu.email@universidade.edu.br'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='pl-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 placeholder-gray-400'
              />
            </div>
          </div>

          <div className='space-y-1'>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Lock className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder='Nova senha'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className='pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 placeholder-gray-400'
              />
              <button 
                type='button' 
                onClick={() => setShowPassword((s) => !s)} 
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'
              >
                {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
              </button>
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full py-3 bg-[#0a5c2f] hover:bg-[#084925] disabled:bg-green-400 text-white text-sm font-bold rounded shadow transition-colors'
          >
            {loading ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>

        <p className='text-center text-sm text-gray-600 mt-6'>
          Lembrou a senha? <Link to='/login' className='font-bold text-[#0a5c2f]'>Entrar</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
