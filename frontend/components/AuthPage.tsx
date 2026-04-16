"use client";

import React, { useState } from 'react';
import { UserPlus, LogIn, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const AuthInput: React.FC<AuthInputProps> = ({ label, ...props }) => {
  return (
    <div className="space-y-1.5 w-full text-left">
      <label className="text-xs font-semibold text-white uppercase tracking-wide">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-200 focus:ring-2 focus:ring-white focus:border-white outline-none transition duration-150 backdrop-blur-sm"
      />
    </div>
  );
};

const LoginForm: React.FC<{ setIsLogin: (val: boolean) => void }> = ({ setIsLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'E-mail ou senha inválidos.');
      }

      localStorage.setItem('@AgorApp:token', data.token || data.Token);

      window.location.href = "/dashboard";

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleLogin}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col items-center justify-center space-y-6 flex-grow w-full max-w-md"
    >
      <div className="flex flex-col items-center text-center space-y-4 mb-8">
        <div className="bg-white/10 p-5 rounded-3xl border border-white/20 backdrop-blur-md shadow-xl">
          <LogIn className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Acesse sua conta</h1>
        <p className="text-indigo-100 text-lg">Entre para continuar na plataforma</p>
      </div>

      {error && (
        <div className="w-full bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-5 w-full">
        <AuthInput label="E-MAIL" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <AuthInput label="SENHA" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div className="pt-6 space-y-4 text-center w-full">
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center bg-white text-indigo-700 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition transform hover:scale-[1.02] shadow-xl disabled:opacity-70 disabled:hover:scale-100"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Entrar agora'}
        </button>
      </div>
    </motion.form>
  );
};


const RegisterForm: React.FC<{ setIsLogin: (val: boolean) => void }> = ({ setIsLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("As senhas não coincidem");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          course: "",
          bio: "",
          roleType: "Student"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(data);
        alert("Erro ao cadastrar");
        return;
      }

      alert("Conta criada com sucesso!");
      setIsLogin(true);

    } catch (err) {
      alert("Erro na conexão com o servidor");
    }
  };

  return (
    <motion.form
      onSubmit={handleRegister}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col items-center justify-center space-y-6 flex-grow w-full max-w-md"
    >
      <div className="flex flex-col items-center text-center space-y-4 mb-4">
        <div className="bg-white/10 p-5 rounded-3xl border border-white/20 backdrop-blur-md shadow-xl">
          <UserPlus className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Criar Conta</h1>
      </div>

      <div className="space-y-5 w-full">
        <AuthInput label="NOME COMPLETO" type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
        <AuthInput label="E-MAIL" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div className="flex gap-4">
          <AuthInput label="SENHA" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <AuthInput label="CONFIRMAR" type="password" placeholder="********" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </div>
      </div>
      <div className="pt-4 space-y-4 text-center w-full">
        <button 
          type="submit"
          className="w-full flex justify-center items-center bg-white text-indigo-700 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition transform hover:scale-[1.02] shadow-xl"
        >
          Criar conta
        </button>
      </div>
    </motion.form>
  );
};

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(false);

  const textVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <div className="h-screen w-full flex font-sans overflow-hidden bg-white">
      
      <motion.div
        layout
        onClick={() => setIsLoginView(!isLoginView)}
        className={`group flex flex-col items-center justify-center text-center p-12 lg:p-24 h-full flex-[0.8] ${isLoginView ? 'order-2' : 'order-1'} bg-white hover:bg-slate-50 cursor-pointer transition-colors duration-500 z-20`}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.6 }}
      >
        <AnimatePresence mode="wait">
          {!isLoginView ? (
            <motion.div key="text-register" variants={textVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 flex flex-col items-center">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Já é membro?</h3>
              <h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-tight">Bem-vindo<br/>de volta</h2>
              <p className="text-xl text-slate-500 max-w-md mt-4">Acesse sua conta para explorar projetos, avaliar trabalhos e gerenciar seu perfil.</p>
              
              <div className="mt-10 bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-lg group-hover:bg-indigo-600 group-hover:scale-105 transition-all duration-300 shadow-2xl">
                Ir para o Login
              </div>
            </motion.div>
          ) : (
            <motion.div key="text-login" variants={textVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 flex flex-col items-center">
              <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Novo por aqui?</h3>
              <h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-tight">Faça parte<br/>da rede</h2>
              <p className="text-xl text-slate-500 max-w-md mt-4">Crie sua conta e tenha acesso ao maior repositório de projetos acadêmicos.</p>
              
              <div className="mt-10 bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-lg group-hover:bg-indigo-600 group-hover:scale-105 transition-all duration-300 shadow-2xl">
                Criar minha conta
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <motion.div
        layout 
        className={`relative flex flex-col items-center justify-center p-12 lg:p-24 h-full flex-1 ${isLoginView ? 'order-1' : 'order-2'} z-10 bg-indigo-600 shadow-2xl`}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.6 }}
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        <div className="w-full h-full flex flex-col justify-center items-center z-10">
          <AnimatePresence mode="wait">
            {!isLoginView ? (
              <RegisterForm key="form-register" setIsLogin={setIsLoginView} />
            ) : (
              <LoginForm key="form-login" setIsLogin={setIsLoginView} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

    </div>
  );
}