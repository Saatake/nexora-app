import { Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import fundoLivro from '@/assets/livro-coluna.png';
import logoIcon from '@/assets/logo-icon.png';
import { useConfirmEmail } from '@/features/auth/hooks/useConfirmEmail';

const ConfirmEmailPage = () => {
  const { status, message } = useConfirmEmail();

  return (
    <div 
      className='min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-cover bg-center bg-no-repeat'
      style={{ backgroundImage: `url(${fundoLivro})` }}
    >
      <div className='mb-6 relative z-10'>
        <img 
          src={logoIcon} 
          alt='Ágora' 
          className='h-20 drop-shadow-lg'
        />
      </div>

      <div className='relative z-10 w-full max-w-md bg-white rounded-xl shadow-2xl p-8 md:p-10'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold text-gray-900'>Confirmação de e-mail</h1>
          <p className='text-sm text-gray-500 mt-2'>Estamos validando seu cadastro. Aguarde um momento.</p>

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
