import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@/api/axios';
import { getErrorMessage } from '../utils/errorMessages';

export const useConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    const confirmEmail = async () => {
      if (!email || !token) {
        setStatus('error');
        setMessage('Link invalido. Verifique se o email foi copiado corretamente.');
        return;
      }
      setStatus('loading');
      try {
        const response = await api.get('/auth/confirm-email', { params: { email, token } });
        setStatus('success');
        setMessage(response.data?.message || 'Email confirmado com sucesso!');
      } catch (err: unknown) {
        setStatus('error');
        setMessage(getErrorMessage(err, 'Nao foi possivel confirmar o email.'));
      }
    };
    confirmEmail();
  }, [email, token]);

  return { status, message };
};
