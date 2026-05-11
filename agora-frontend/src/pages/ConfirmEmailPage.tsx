import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../api/axios';
import fundoLivro from '../assets/livro-coluna.png';

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
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900'>Confirmacao de email</h1>
          <p className='text-sm text-gray-500 mt-2'>Estamos validando seu cadastro.</p>

          {status === 'loading' && (
            <div className='mt-8 flex flex-col items-center gap-3'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-800'></div>
              <p className='text-sm text-gray-600'>Confirmando...</p>
            </div>
          )}

          {status === 'success' && (
            <div className='mt-8'>
              <div className='flex justify-center mb-4'>
                <CheckCircle className='h-16 w-16 text-emerald-600' />
              </div>
              <div className='text-sm text-emerald-700 bg-emerald-100 p-4 rounded-lg'>{message}</div>
            </div>
          )}

          {status === 'error' && (
            <div className='mt-8'>
              <div className='flex justify-center mb-4'>
                <XCircle className='h-16 w-16 text-red-600' />
              </div>
              <div className='text-sm text-red-600 bg-red-100 p-4 rounded-lg'>{message}</div>
            </div>
          )}

          <div className='mt-8'>
            <Link 
              to='/login' 
              className='w-full inline-flex items-center justify-center py-3 bg-[#0a5c2f] hover:bg-[#084925] text-white text-sm font-bold rounded shadow transition-colors'
            >
              Ir para login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmailPage;
