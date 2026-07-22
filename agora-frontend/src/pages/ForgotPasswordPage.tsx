import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import fundoLivro from '@/assets/livro-coluna.png';
import logoIcon from '@/assets/logo-icon.png';
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword';

const ForgotPasswordPage = () => {
  const { email, setEmail, error, success, loading, handleSubmit } = useForgotPassword();

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
        <Link 
          to='/login' 
          className='inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors'
        >
          <ArrowLeft size={16} />
          Voltar para login
        </Link>

        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>Recuperar senha</h1>
          <p className='text-sm text-gray-500 mt-2'>Envie seu e-mail para receber o link de recuperação.</p>
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

          <button
            type='submit'
            disabled={loading}
            className='w-full py-3 bg-[#0a5c2f] hover:bg-[#084925] disabled:bg-green-400 text-white text-sm font-bold rounded shadow transition-colors'
          >
            {loading ? 'Enviando...' : 'Enviar link'}
          </button>
        </form>

        <p className='text-center text-sm text-gray-600 mt-6'>
          Lembrou a senha? <Link to='/login' className='font-bold text-[#0a5c2f]'>Entrar</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
