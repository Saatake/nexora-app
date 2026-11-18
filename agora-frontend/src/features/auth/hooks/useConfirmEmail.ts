import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '@/api/axios';
import { getErrorMessage } from '../utils/errorMessages';

const readAuthLinkParams = (searchParams: URLSearchParams) => {
  const rawHash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(rawHash);

  return {
    email: hashParams.get('email') || searchParams.get('email'),
    token: hashParams.get('token') || searchParams.get('token'),
  };
};

export const useConfirmEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const initiatedRef = useRef(false);

  useEffect(() => {
    if (initiatedRef.current) return;
    initiatedRef.current = true;

    const { email, token } = readAuthLinkParams(searchParams);

    // Limpa o token e e-mail da barra de endereço imediatamente
    if (window.location.hash || window.location.search) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    const confirmEmail = async () => {
      if (!email || !token) {
        setStatus('error');
        setMessage('Link inválido. Verifique se o e-mail foi copiado corretamente.');
        return;
      }
      setStatus('loading');
      try {
        const response = await api.post('/auth/confirm-email', { email, token });
        setStatus('success');
        setMessage(response.data?.message || 'E-mail confirmado com sucesso!');
      } catch (err: unknown) {
        setStatus('error');
        setMessage(getErrorMessage(err, 'Não foi possível confirmar o e-mail.'));
      }
    };
    confirmEmail();
  }, [searchParams]);

  return { status, message };
};
