import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '../utils/errorMessages';
import { passwordRequirements } from '../constants/passwordRequirements';

export const useAuthForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRoleTab, setRoleTab] = useState<'Aluno' | 'Professor'>('Aluno');

  // Register state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    course: '',
    bio: '',
    roleType: 'Estudante',
  });
  const [confirmPassword, setConfirmPassword] = useState('');

  // Shared UI state
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });
      const { token } = response.data;
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      const meResponse = await api.get('/users/me');

      const userRole = meResponse.data.roleType;
      const expectedRole = loginRoleTab === 'Professor' ? 'Professor' : 'Estudante';

      if (userRole !== expectedRole) {
        setError(
          `Esta conta é de ${userRole === 'Professor' ? 'Professor' : 'Aluno'}. Por favor, selecione a opção correta.`,
        );
        setLoading(false);
        return;
      }

      login(token, meResponse.data);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao realizar login'));
      setLoading(false);
    }
  };

  const normalizeRegisterErrors = (message: string) => {
    const parts = message
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (parts.length === 0) return message;
    const mapped = parts.map((item) => {
      if (item.includes('is already taken')) return 'Este e-mail já está cadastrado.';
      if (item.includes('Passwords must have at least one non alphanumeric character'))
        return 'A senha precisa ter pelo menos 1 símbolo.';
      if (item.includes('Passwords must have at least one lowercase'))
        return 'A senha precisa ter pelo menos 1 letra minúscula.';
      if (item.includes('Passwords must have at least one uppercase'))
        return 'A senha precisa ter pelo menos 1 letra maiúscula.';
      if (item.includes('Passwords must have at least one digit'))
        return 'A senha precisa ter pelo menos 1 número.';
      if (item.includes('Passwords must be at least'))
        return 'A senha precisa ter no mínimo 6 caracteres.';
      return item;
    });
    return Array.from(new Set(mapped)).join('\n');
  };

  const handleRegisterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const unmetPasswordRequirements = passwordRequirements
    .filter((req) => !req.test(formData.password))
    .map((req) => req.label.toLowerCase());

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    if (formData.password !== confirmPassword) {
      setError('As senhas não coincidem.');
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
      setSuccess(
        response.data.message ||
          'Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.',
      );
      setTimeout(() => {
        setIsLogin(true);
        setSuccess('');
      }, 3000);
    } catch (err: unknown) {
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

  return {
    isLogin,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    loginRoleTab,
    setRoleTab,
    formData,
    setFormData,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    error,
    success,
    loading,
    handleLogin,
    handleRegisterChange,
    handleRegister,
    switchMode,
  };
};
