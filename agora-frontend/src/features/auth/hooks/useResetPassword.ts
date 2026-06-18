import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@/api/axios';
import { getErrorMessage } from '../utils/errorMessages';

export const useResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
