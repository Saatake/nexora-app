import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import api from '../api/axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
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
      const response = await api.post('/auth/forgot-password', { email });
      setSuccess(response.data?.message || 'Se o email estiver cadastrado, enviamos as instrucoes.');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Erro ao solicitar recuperacao de senha'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-700 via-blue-600 to-teal-400 p-4'>
      <div className='mb-8 flex items-center text-white text-3xl font-bold tracking-tight'>
        <div className='bg-white text-indigo-700 w-10 h-10 flex items-center justify-center rounded-lg mr-3 shadow-lg'>
          A
        </div>
        Agora
      </div>

      <div className='bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-extrabold text-gray-900'>Recuperar senha</h1>
          <p className='text-sm text-gray-500 mt-2'>Envie seu email para receber o link de recuperacao.</p>
        </div>

        {error && <div className='mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-lg text-center'>{error}</div>}
        {success && <div className='mb-4 text-sm text-emerald-700 bg-emerald-100 p-3 rounded-lg text-center'>{success}</div>}

        <form onSubmit={handleSubmit} className='space-y-5'>
          <div className='space-y-1'>
            <label className='text-sm font-semibold text-gray-700'>Email</label>
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
                className='pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-800 placeholder-gray-400'
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-bold rounded-xl shadow-lg transition-colors'
          >
            {loading ? 'Enviando...' : 'Enviar link'}
          </button>
        </form>

        <p className='text-center text-sm text-gray-600 mt-6'>
          Lembrou a senha? <Link to='/login' className='font-bold text-indigo-600 hover:text-indigo-500'>Entrar</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
