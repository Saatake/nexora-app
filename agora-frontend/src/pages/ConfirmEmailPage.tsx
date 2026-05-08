import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';

const ConfirmEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const email = searchParams.get('email');
  const token = searchParams.get('token');

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

  useEffect(() => {
    const confirmEmail = async () => {
      if (!email || !token) {
        setStatus('error');
        setMessage('Link invalido. Verifique se o email foi copiado corretamente.');
        return;
      }

      setStatus('loading');
      try {
        const response = await api.get('/auth/confirm-email', {
          params: { email, token }
        });
        setStatus('success');
        setMessage(response.data?.message || 'Email confirmado com sucesso!');
      } catch (err: any) {
        setStatus('error');
        setMessage(getErrorMessage(err, 'Nao foi possivel confirmar o email.'));
      }
    };

    confirmEmail();
  }, [email, token]);

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-700 via-blue-600 to-teal-400 p-4'>
      <div className='mb-8 flex items-center text-white text-3xl font-bold tracking-tight'>
        <div className='bg-white text-indigo-700 w-10 h-10 flex items-center justify-center rounded-lg mr-3 shadow-lg'>
          A
        </div>
        Agora
      </div>

      <div className='bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 md:p-10 text-center'>
        <h1 className='text-3xl font-extrabold text-gray-900'>Confirmacao de email</h1>
        <p className='text-sm text-gray-500 mt-2'>Estamos validando seu cadastro.</p>

        {status === 'loading' && (
          <div className='mt-6 text-sm text-gray-600'>Confirmando...</div>
        )}

        {status === 'success' && (
          <div className='mt-6 text-sm text-emerald-700 bg-emerald-100 p-3 rounded-lg'>{message}</div>
        )}

        {status === 'error' && (
          <div className='mt-6 text-sm text-red-600 bg-red-100 p-3 rounded-lg'>{message}</div>
        )}

        <div className='mt-8'>
          <Link to='/login' className='w-full inline-flex items-center justify-center py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg transition-colors'>
            Ir para login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmailPage;
