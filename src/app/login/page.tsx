'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Tentativa de login iniciada:', { username });
    setLoading(true);
    setError('');

    try {
      console.log('Enviando requisição para /api/auth/login...');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      console.log('Resposta recebida do servidor. Status:', res.status);

      if (res.ok) {
        console.log('Login OK! Redirecionando para /admin...');
        window.location.href = '/admin'; // Usando window.location para forçar o reload e redirecionamento
      } else {
        const data = await res.json();
        console.error('Falha no login:', data.message);
        setError('Usuário ou senha incorretos.');
      }
    } catch (err) {
      console.error('Erro na conexão com a API:', err);
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div className="glass" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '2.5rem', 
        borderRadius: 'var(--radius)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.8rem' }}>Acesso Restrito</h1>
        <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>Workshop de IA - Admin</p>

        <form onSubmit={handleLogin} style={{ display: 'grid', gap: '1.2rem' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>USUÁRIO</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ 
                width: '100%',
                padding: '0.8rem', 
                borderRadius: '8px', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--card-border)', 
                color: '#fff',
                outline: 'none'
              }} 
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>SENHA</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ 
                width: '100%',
                padding: '0.8rem', 
                borderRadius: '8px', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid var(--card-border)', 
                color: '#fff',
                outline: 'none'
              }} 
            />
          </div>

          {error && <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '1rem',
              padding: '1rem', 
              background: 'var(--primary)', 
              color: '#000', 
              border: 'none', 
              borderRadius: 'var(--radius)', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              transition: '0.3s',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </form>
      </div>
    </div>
  );
}
