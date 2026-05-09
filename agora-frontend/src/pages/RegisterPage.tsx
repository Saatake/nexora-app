import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, BookOpen, PenSquare, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import { FACENS_COURSES } from '../constants/facensCourses';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    course: '',
    bio: '',
    roleType: 'Estudante'
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
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

  const normalizeRegisterErrors = (message: string) => {
    const parts = message.split(',').map((item) => item.trim()).filter(Boolean);
    if (parts.length === 0) {
      return message;
    }

    const mapped = parts.map((item) => {
      if (item.includes('is already taken')) {
        return 'Este email ja esta cadastrado.';
      }
      if (item.includes('Passwords must have at least one non alphanumeric character')) {
        return 'A senha precisa ter pelo menos 1 simbolo.';
      }
      if (item.includes('Passwords must have at least one lowercase')) {
        return 'A senha precisa ter pelo menos 1 letra minuscula.';
      }
      if (item.includes('Passwords must have at least one uppercase')) {
        return 'A senha precisa ter pelo menos 1 letra maiuscula.';
      }
      if (item.includes('Passwords must have at least one digit')) {
        return 'A senha precisa ter pelo menos 1 numero.';
      }
      if (item.includes('Passwords must be at least')) {
        return 'A senha precisa ter no minimo 6 caracteres.';
      }
      return item;
    });

    return Array.from(new Set(mapped)).join('\n');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
    try {
      const response = await api.post('/auth/register', formData);
      setSuccess(response.data.message || 'Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.');

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      const message = getErrorMessage(err, 'Erro ao realizar cadastro');
      setError(normalizeRegisterErrors(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-700 via-blue-600 to-teal-400 p-4'>
      <div className='mb-8'>
        <img 
          src='/src/assets/logo-icon.png' 
          alt='Ágora' 
          className='h-16'
        />
      </div>

      <div className='bg-white rounded-3xl shadow-2xl w-full max-w-xl p-8 md:p-10 relative'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-extrabold text-gray-900'>Crie sua conta</h1>
          <p className='text-sm text-gray-500 mt-2'>Guarde seus projetos e mostre sua evolução.</p>
        </div>

        <div className='flex bg-gray-100 p-1 mb-8 rounded-xl shadow-inner'>
          <button
            type='button'
            onClick={() => setFormData({ ...formData, roleType: 'Estudante' })}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${formData.roleType === 'Estudante' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Aluno
          </button>
          <button
            type='button'
            onClick={() => setFormData({ ...formData, roleType: 'Professor' })}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${formData.roleType === 'Professor' ? 'bg-white text-indigo-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Professor
          </button>
        </div>

        {error && <div className='mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-lg text-center whitespace-pre-line'>{error}</div>}
        {success && <div className='mb-4 text-sm text-emerald-700 bg-emerald-100 p-3 rounded-lg text-center'>{success}</div>}

        <form onSubmit={handleRegister} className='space-y-5'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            <div className='space-y-1'>
              <label className='text-sm font-semibold text-gray-700'>Nome completo</label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <User className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='text'
                  name='name'
                  placeholder='Seu nome'
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className='pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-800 placeholder-gray-400'
                />
              </div>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-semibold text-gray-700'>Email</label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Mail className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  type='email'
                  name='email'
                  placeholder='seu.email@universidade.edu.br'
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className='pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-800 placeholder-gray-400'
                />
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            <div className='space-y-1'>
              <label className='text-sm font-semibold text-gray-700'>Senha</label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Lock className='h-5 w-5 text-gray-400' />
                </div>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name='password'
                    placeholder='Minimo de 6 caracteres'
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className='pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-800 placeholder-gray-400'
                  />
                  <button type='button' onClick={() => setShowPassword((s) => !s)} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'>
                    {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
                  </button>
                </div>
              </div>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-semibold text-gray-700'>Curso</label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <BookOpen className='h-5 w-5 text-gray-400' />
                </div>
                <select
                  name='course'
                  value={formData.course}
                  onChange={handleChange}
                  className='pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-800 bg-white appearance-none'
                >
                  <option value=''>Selecione seu curso</option>
                  {FACENS_COURSES.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className='space-y-1'>
            <label className='text-sm font-semibold text-gray-700'>Confirmar senha</label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                name='confirmPassword'
                placeholder='Repita a senha'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className='pl-4 pr-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-800 placeholder-gray-400'
              />
              <button type='button' onClick={() => setShowPassword((s) => !s)} className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500'>
                {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
              </button>
            </div>
          </div>

          <div className='space-y-1'>
            <label className='text-sm font-semibold text-gray-700'>Bio</label>
            <div className='relative'>
              <div className='absolute top-3 left-3 pointer-events-none'>
                <PenSquare className='h-5 w-5 text-gray-400' />
              </div>
              <textarea
                name='bio'
                placeholder='Conte em poucas linhas sobre voce e seu foco academico.'
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className='pl-10 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-800 placeholder-gray-400 resize-none'
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-bold rounded-xl shadow-lg transition-colors mt-6'
          >
            {loading ? 'Criando conta...' : 'Cadastrar'}
          </button>

          <p className='text-center text-sm text-gray-600 mt-6'>
            Ja tem uma conta? <Link to='/login' className='font-bold text-indigo-600 hover:text-indigo-500'>Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
