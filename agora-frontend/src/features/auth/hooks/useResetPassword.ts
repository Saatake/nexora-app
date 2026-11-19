import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '@/api/axios';
import { getErrorMessage } from '../utils/errorMessages';
import { passwordRequirements } from '../constants/passwordRequirements';

const RESET_EMAIL_STORAGE_KEY = 'agora_reset_email';
const RESET_TOKEN_STORAGE_KEY = 'agora_reset_token';

const readResetParams = (searchParams: URLSearchParams) => {
  const rawHash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(rawHash);

  const email =
    hashParams.get('email') ||
    searchParams.get('email') ||
    sessionStorage.getItem(RESET_EMAIL_STORAGE_KEY) ||
    '';
  const token =
    hashParams.get('token') ||
    searchParams.get('token') ||
    sessionStorage.getItem(RESET_TOKEN_STORAGE_KEY) ||
    '';

  if (email) sessionStorage.setItem(RESET_EMAIL_STORAGE_KEY, email);
  if (token) sessionStorage.setItem(RESET_TOKEN_STORAGE_KEY, token);

  return { email, token };
};

export const useResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [initial] = useState(() => readResetParams(searchParams));
  const [email, setEmail] = useState(initial.email);
  const token = initial.token;
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.location.hash || window.location.search) {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const unmetPasswordRequirements = passwordRequirements
    .filter((req) => !req.test(newPassword))
    .map((req) => req.label.toLowerCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Link de redefinição inválido ou incompleto. Solicite um novo link.');
      return;
    }

    if (unmetPasswordRequirements.length > 0) {
      setError(`A senha precisa ter ${unmetPasswordRequirements.join(', ')}.`);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { email, token, newPassword });
      sessionStorage.removeItem(RESET_EMAIL_STORAGE_KEY);
      sessionStorage.removeItem(RESET_TOKEN_STORAGE_KEY);
      setSuccess(response.data?.message || 'Senha redefinida com sucesso!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao redefinir senha'));
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, newPassword, setNewPassword, showPassword, setShowPassword, error, success, loading, handleSubmit };
};
