import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, BookOpen, PenSquare, ArrowRight, ArrowLeft, Library } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { FACENS_COURSES } from '../constants/facensCourses';

// Import das imagens
import fundoLivro from '../assets/livro-coluna.png';
import logoIcon from '../assets/logo-icon.png';

const passwordRequirements = [
  {
    label: 'No mínimo 6 caracteres',
    test: (password: string) => password.length >= 6
  },
  {
    label: 'Uma letra maiúscula',
    test: (password: string) => /[A-Z]/.test(password)
  },
  {
    label: 'Uma letra minúscula',
    test: (password: string) => /[a-z]/.test(password)
  },
  {
    label: 'Um número',
    test: (password: string) => /\d/.test(password)
  },
  {
    label: 'Um símbolo',
    test: (password: string) => /[^A-Za-z0-9]/.test(password)
  }
];

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Estados do Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRoleTab, setRoleTab] = useState<'Aluno' | 'Professor'>('Aluno');

  // Estados do Cadastro
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    course: '',
    bio: '',
    roleType: 'Estudante'
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  // Estados Compartilhados/UI
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // --- LÓGICA DE LOGIN (INALTERADA) ---
  const getErrorMessage = (err: any, fallback: string) => {
    const data = err?.response?.data;
    if (typeof data?.message === 'string') { return data.message; }
    if (Array.isArray(data?.errors)) { return data.errors.join(', '); }
    if (data?.errors && typeof data.errors === 'object') { return Object.values(data.errors).flat().join(', '); }
    return fallback;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
      const { token } = response.data;
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      const meResponse = await api.get('/users/me');
      
      const userRole = meResponse.data.roleType;
      const expectedRole = loginRoleTab === 'Professor' ? 'Professor' : 'Estudante';
      
      if (userRole !== expectedRole) {
        setError(`Esta conta é de ${userRole === 'Professor' ? 'Professor' : 'Aluno'}. Por favor, selecione a opção correta.`);
        setLoading(false);
        return;
      }

      login(token, meResponse.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(getErrorMessage(err, 'Erro ao realizar login'));
      setLoading(false);
    }
  };

  // --- LÓGICA DE CADASTRO (INALTERADA) ---
  const normalizeRegisterErrors = (message: string) => {
    const parts = message.split(',').map((item) => item.trim()).filter(Boolean);
    if (parts.length === 0) { return message; }
    const mapped = parts.map((item) => {
      if (item.includes('is already taken')) { return 'Este email ja esta cadastrado.'; }
      if (item.includes('Passwords must have at least one non alphanumeric character')) { return 'A senha precisa ter pelo menos 1 simbolo.'; }
      if (item.includes('Passwords must have at least one lowercase')) { return 'A senha precisa ter pelo menos 1 letra minuscula.'; }
      if (item.includes('Passwords must have at least one uppercase')) { return 'A senha precisa ter pelo menos 1 letra maiuscula.'; }
      if (item.includes('Passwords must have at least one digit')) { return 'A senha precisa ter pelo menos 1 numero.'; }
      if (item.includes('Passwords must be at least')) { return 'A senha precisa ter no minimo 6 caracteres.'; }
      return item;
    });
    return Array.from(new Set(mapped)).join('\n');
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const unmetPasswordRequirements = passwordRequirements
    .filter((requirement) => !requirement.test(formData.password))
    .map((requirement) => requirement.label.toLowerCase());

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (formData.password !== confirmPassword) {
      setError('As senhas nao coincidem.');
      setLoading(false);
      return;
    }
    if (unmetPasswordRequirements.length > 0) {
      setError(`A senha precisa ter ${unmetPasswordRequirements.join(', ')}.`);
      setLoading(false);
      return;
    }
    try {
      const response = await api.post('/auth/register', formData);
      setSuccess(response.data.message || 'Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.');
      setTimeout(() => {
        setIsLogin(true);
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      const message = getErrorMessage(err, 'Erro ao realizar cadastro');
      setError(normalizeRegisterErrors(message));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (mode: boolean) => {
    setIsLogin(mode);
    setError('');
    setSuccess('');
  };

  return (
    // DIV PRINCIPAL ALTERADA: Adicionado fundo de imagem e classes de cobertura
    <div 
      className='min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-cover bg-center bg-no-repeat'
      style={{ backgroundImage: `url(${fundoLivro})` }}
    >
      {/* Overlay opcional caso a imagem atrapalhe a leitura do logo (descomente se precisar) */}
      {/* <div className="absolute inset-0 bg-black/10 z-0"></div> */}

      <div className='mb-6 relative z-10'>
        <img 
          src={logoIcon} 
          alt='Ágora' 
          className='h-20 drop-shadow-lg'
        />
      </div>

      <div className='relative z-10 w-full max-w-[900px] h-[650px] bg-white rounded-xl shadow-2xl overflow-hidden flex'>
        
        {/* --- PAINEL DE LOGIN (INALTERADO) --- */}
        <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full bg-white p-8 md:p-10 overflow-y-auto transition-transform duration-700 ease-in-out z-10 ${isLogin ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-full opacity-0 pointer-events-none md:translate-x-0 md:opacity-100 md:pointer-events-auto'}`}>
          <div className='flex flex-col h-full justify-center max-w-sm mx-auto'>
            <h1 className='text-3xl font-bold text-gray-900 mb-8'>Login</h1>

            <div className='flex gap-4 mb-8'>
              <button onClick={() => setRoleTab('Aluno')} className={`flex-1 py-2 text-sm font-semibold rounded border transition-all ${loginRoleTab === 'Aluno' ? 'border-green-800 text-green-800 bg-green-50' : 'border-gray-300 text-gray-500 hover:text-gray-700'}`}>
                Aluno
              </button>
              <button onClick={() => setRoleTab('Professor')} className={`flex-1 py-2 text-sm font-semibold rounded border transition-all ${loginRoleTab === 'Professor' ? 'border-green-800 text-green-800 bg-green-50' : 'border-gray-300 text-gray-500 hover:text-gray-700'}`}>
                Professor
              </button>
            </div>

            {error && isLogin && <div className='mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-lg text-center'>{error}</div>}

            <form onSubmit={handleLogin} className='space-y-5'>
              <div className='space-y-1'>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Mail className='h-5 w-5 text-gray-400' />
                  </div>
                  <input type='email' placeholder={loginRoleTab === 'Aluno' ? 'E-mail Institucional' : 'professor@universidade.edu.br'} value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required className='pl-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 placeholder-gray-400' />
                </div>
              </div>

              <div className='space-y-1'>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='h-5 w-5 text-gray-400' />
                  </div>
                  <input type={showPassword ? 'text' : 'password'} placeholder='Senha' value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required className='pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 placeholder-gray-400' />
                  <button type='button' onClick={() => setShowPassword((s) => !s)} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'>
                    {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
                  </button>
                </div>
              </div>

              <div className='flex items-center justify-between text-sm mt-2 mb-6'>
                <Link to='/forgot-password' className='text-gray-500 hover:text-gray-800 underline decoration-gray-400 underline-offset-2'>Esqueci a senha</Link>
              </div>

              <button type='submit' disabled={loading} className='w-full py-3 bg-[#0a5c2f] hover:bg-[#084925] disabled:bg-green-400 text-white text-sm font-bold rounded shadow transition-colors'>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <p className='md:hidden text-center text-sm text-gray-600 mt-6'>
                Não tem uma conta? <button type='button' onClick={() => switchMode(false)} className='font-bold text-[#0a5c2f]'>Registre-se</button>
              </p>
            </form>
          </div>
        </div>

        {/* --- PAINEL DE CADASTRO (INALTERADO) --- */}
        <div className={`absolute top-0 left-0 md:left-auto md:right-0 w-full md:w-1/2 h-full bg-white p-8 md:p-10 overflow-y-auto custom-scrollbar transition-transform duration-700 ease-in-out z-10 ${!isLogin ? 'translate-x-0 opacity-100 pointer-events-auto' : 'translate-x-full opacity-0 pointer-events-none md:translate-x-0 md:opacity-100 md:pointer-events-auto'}`}>
          <div className='flex flex-col h-full justify-center max-w-sm mx-auto'>
            <h1 className='text-3xl font-bold text-gray-900 mb-6'>Criar conta</h1>

            <div className='flex gap-4 mb-6'>
              <button type='button' onClick={() => setFormData({ ...formData, roleType: 'Estudante' })} className={`flex-1 py-2 text-sm font-semibold rounded border transition-all ${formData.roleType === 'Estudante' ? 'border-green-800 text-green-800 bg-green-50' : 'border-gray-300 text-gray-500 hover:text-gray-700'}`}>
                Aluno
              </button>
              <button type='button' onClick={() => setFormData({ ...formData, roleType: 'Professor' })} className={`flex-1 py-2 text-sm font-semibold rounded border transition-all ${formData.roleType === 'Professor' ? 'border-green-800 text-green-800 bg-green-50' : 'border-gray-300 text-gray-500 hover:text-gray-700'}`}>
                Professor
              </button>
            </div>

            {error && !isLogin && <div className='mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-lg text-center whitespace-pre-line'>{error}</div>}
            {success && !isLogin && <div className='mb-4 text-sm text-emerald-700 bg-emerald-100 p-3 rounded-lg text-center'>{success}</div>}

            <form onSubmit={handleRegister} className='space-y-4'>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <User className='h-5 w-5 text-gray-400' />
                </div>
                <input type='text' name='name' placeholder='Seu nome completo' value={formData.name} onChange={handleRegisterChange} required className='pl-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 placeholder-gray-400' />
              </div>

              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='h-5 w-5 text-gray-400' />
                </div>
                <input type='email' name='email' placeholder='seu.email@universidade.edu.br' value={formData.email} onChange={handleRegisterChange} required className='pl-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 placeholder-gray-400' />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='h-5 w-5 text-gray-400' />
                  </div>
                  <input type={showPassword ? 'text' : 'password'} name='password' placeholder='Senha' value={formData.password} onChange={handleRegisterChange} required className='pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 placeholder-gray-400' />
                </div>
                <div className='relative'>
                  <input type={showPassword ? 'text' : 'password'} name='confirmPassword' placeholder='Repita a senha' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className='pl-4 pr-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 placeholder-gray-400' />
                  <button type='button' onClick={() => setShowPassword((s) => !s)} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'>
                    {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
                  </button>
                </div>
              </div>

              <div className='rounded-lg border border-green-100 bg-green-50/70 p-3'>
                <p className='text-xs font-semibold text-gray-700 mb-2'>A senha precisa ter:</p>
                <ul className='grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs'>
                  {passwordRequirements.map((requirement) => {
                    const isMet = requirement.test(formData.password);
                    return (
                      <li
                        key={requirement.label}
                        className={`flex items-center gap-2 ${isMet ? 'text-green-800' : 'text-gray-500'}`}
                      >
                        <span
                          aria-hidden='true'
                          className={`h-2 w-2 rounded-full ${isMet ? 'bg-green-700' : 'bg-gray-300'}`}
                        />
                        {requirement.label}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <BookOpen className='h-5 w-5 text-gray-400' />
                </div>
                <select name='course' value={formData.course} onChange={handleRegisterChange} className='pl-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 bg-white appearance-none'>
                  <option value=''>Selecione seu curso</option>
                  {FACENS_COURSES.map((course) => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              <div className='relative'>
                <div className='absolute top-3 left-3 pointer-events-none'>
                  <PenSquare className='h-5 w-5 text-gray-400' />
                </div>
                <textarea name='bio' placeholder='Foco acadêmico (opcional)' value={formData.bio} onChange={handleRegisterChange} rows={2} className='pl-10 w-full px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-green-800 focus:border-green-800 transition-all font-medium text-gray-800 placeholder-gray-400 resize-none' />
              </div>

              <button type='submit' disabled={loading} className='w-full py-3 bg-[#0a5c2f] hover:bg-[#084925] disabled:bg-green-400 text-white text-sm font-bold rounded shadow transition-colors mt-2'>
                {loading ? 'Criando conta...' : 'Cadastrar'}
              </button>

              <p className='md:hidden text-center text-sm text-gray-600 mt-6'>
                Já tem uma conta? <button type='button' onClick={() => switchMode(true)} className='font-bold text-[#0a5c2f]'>Entrar</button>
              </p>
            </form>
          </div>
        </div>

        {/* --- PAINEL OVERLAY (INALTERADO) --- */}
        <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full bg-[#2b353a] z-20 transition-transform duration-700 ease-in-out shadow-2xl ${!isLogin ? '-translate-x-full' : 'translate-x-0'}`}>
          <div className={`absolute inset-0 flex flex-col items-center justify-center p-12 text-center transition-all duration-500 ${isLogin ? 'opacity-100 delay-300' : 'opacity-0 pointer-events-none'}`}>
            <Library className='w-16 h-16 text-white mb-6' strokeWidth={1.5} />
            <h2 className='text-3xl font-semibold text-[#18915b] mb-4'>Ainda não tem conta?</h2>
            <p className='text-gray-300 mb-8 leading-relaxed max-w-sm'>Registre-se agora e comece a compartilhar seus projetos com a comunidade acadêmica.</p>
            <button onClick={() => switchMode(false)} className='px-8 py-3 bg-white text-gray-900 rounded font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2'>
              Registre-se aqui <ArrowRight className='w-4 h-4' />
            </button>
          </div>

          <div className={`absolute inset-0 flex flex-col items-center justify-center p-12 text-center transition-all duration-500 ${!isLogin ? 'opacity-100 delay-300' : 'opacity-0 pointer-events-none'}`}>
            <Library className='w-16 h-16 text-white mb-6' strokeWidth={1.5} />
            <h2 className='text-3xl font-semibold text-[#18915b] mb-4'>Já possui uma conta?</h2>
            <p className='text-gray-300 mb-8 leading-relaxed max-w-sm'>Entre agora para acessar seus projetos e a comunidade acadêmica do Ágora.</p>
            <button onClick={() => switchMode(true)} className='px-8 py-3 bg-white text-gray-900 rounded font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2'>
              <ArrowLeft className='w-4 h-4' /> Entrar aqui
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
