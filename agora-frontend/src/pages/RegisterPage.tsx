import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    course: '',
    bio: '',
    roleType: 'Estudante'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await api.post('/auth/register', formData);
      setSuccess(response.data.message || 'Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.');
      
      // Limpar form opcional ou redirecionar
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (err: any) {
      if (err.response?.data?.errors) {
        // Se houver lista de erros
        const errorMessages = err.response.data.errors.join(', ');
        setError(errorMessages);
      } else {
        setError(err.response?.data?.message || 'Erro ao realizar cadastro');
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1>Cadastro - Ágora</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input 
          type="text" 
          name="name"
          placeholder="Nome (obrigatório)" 
          value={formData.name} 
          onChange={handleChange} 
          required 
          style={{ padding: '8px' }}
        />
        <input 
          type="email" 
          name="email"
          placeholder="Email (obrigatório)" 
          value={formData.email} 
          onChange={handleChange} 
          required 
          style={{ padding: '8px' }}
        />
        <input 
          type="password" 
          name="password"
          placeholder="Senha (mínimo 6 caracteres)" 
          value={formData.password} 
          onChange={handleChange} 
          required 
          style={{ padding: '8px' }}
        />
        <input 
          type="text" 
          name="course"
          placeholder="Curso" 
          value={formData.course} 
          onChange={handleChange} 
          style={{ padding: '8px' }}
        />
        <textarea 
          name="bio"
          placeholder="Bio" 
          value={formData.bio} 
          onChange={handleChange} 
          style={{ padding: '8px' }}
        />
        
        <select 
          name="roleType" 
          value={formData.roleType} 
          onChange={handleChange}
          style={{ padding: '8px' }}
        >
          <option value="Estudante">Estudante</option>
          <option value="Professor">Professor</option>
        </select>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cadastrar
        </button>
      </form>
      
      <p style={{ marginTop: '15px' }}>
        Já tem uma conta? <Link to="/login">Faça Login</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
