import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@/api/axios';
import { getErrorMessage } from '../utils/errorMessages';

const readResetParams = (searchParams: URLSearchParams) => {
  const rawHash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(rawHash);

  return {
    email: hashParams.get('email') || searchParams.get('email') || '',
    token: hashParams.get('token') || searchParams.get('token') || '',
  };
};

export const useResetPassword = () => {
  const [searchParams] = useSearchParams();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', { email, token, newPassword });
      setSuccess(response.data?.message || 'Senha redefinida com sucesso!');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Erro ao redefinir senha'));
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, newPassword, setNewPassword, showPassword, setShowPassword, error, success, loading, handleSubmit };
};
