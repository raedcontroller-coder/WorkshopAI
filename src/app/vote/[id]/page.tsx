'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface GroupData {
  id: string;
  name: string;
  theme: string;
  members: string[];
  technologies: { name: string }[];
}

export default function VotePage() {
  const { id } = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('ianeg_voted')) {
      setHasVoted(true);
    }
    fetchGroup();
  }, [id]);

  const fetchGroup = async () => {
    try {
      const res = await fetch(`/api/groups/${id}`);
      if (res.ok) {
        const data = await res.json();
        setGroup(data);
      } else {
        setError('Grupo não identificado no mainframe.');
      }
    } catch (err) {
      setError('Falha crítica na conexão de dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (hasVoted) return;
    setVoting(true);
    
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: id }),
      });

      if (res.ok) {
        localStorage.setItem('ianeg_voted', 'true');
        setHasVoted(true);
        router.push('/'); // Redireciona para o ranking central
      } else {
        const data = await res.json();
        alert(data.message || 'Erro no protocolo de votação.');
      }
    } catch (err) {
      alert('Erro de conexão com o terminal central.');
    } finally {
      setVoting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--primary)' }}>
      <div className="glitch-text">ESCANEANDO_DADOS...</div>
    </div>
  );

  if (error) return (
    <div style={{ padding: '2rem', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h2 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>ERRO_DE_SISTEMA</h2>
      <p style={{ color: 'var(--foreground)' }}>{error}</p>
      <button onClick={() => router.push('/')} className="cyber-button" style={{ marginTop: '2rem', alignSelf: 'center' }}>VOLTAR AO INÍCIO</button>
    </div>
  );

  if (!group) return null;

  return (
    <main style={{ padding: '2rem 1rem', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '450px', width: '100%' }}>
        <div className="cyber-card" style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span style={{ color: 'var(--secondary)', fontSize: '0.7rem', letterSpacing: '4px', textTransform: 'uppercase' }}>Votação Direta</span>
            <h1 className="glitch-text" style={{ fontSize: '2.2rem', margin: '0.5rem 0' }}>{group.name}</h1>
            <div style={{ background: 'var(--primary)', height: '2px', width: '40px', margin: '1rem auto' }}></div>
            <p style={{ color: 'var(--foreground)', fontSize: '1.1rem', fontWeight: 'bold' }}>{group.theme}</p>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderLeft: '2px solid var(--primary)' }}>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Integrantes</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {group.members.map(m => (
                <span key={m} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.7rem', borderRadius: '2px', fontSize: '0.85rem', color: 'var(--foreground)' }}>
                  {m}
                </span>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tecnologias</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {group.technologies.map(t => (
                <span key={t.name} style={{ border: '1px solid rgba(255, 0, 255, 0.3)', color: 'var(--secondary)', padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                  {t.name}
                </span>
              ))}
            </div>
          </div>

          <button 
            onClick={handleVote}
            disabled={hasVoted || voting}
            className="cyber-button"
            style={{ 
              width: '100%', 
              opacity: hasVoted ? 0.6 : 1,
              cursor: hasVoted ? 'not-allowed' : 'pointer'
            }}
          >
            {voting ? 'PROCESSANDO...' : hasVoted ? 'VOTO COMPUTADO' : 'CONFIRMAR MEU VOTO'}
          </button>
          
          {hasVoted && (
            <p style={{ marginTop: '1.5rem', color: 'var(--primary)', fontSize: '0.8rem', fontStyle: 'italic' }}>
              Protocolo de segurança ativo: Cada terminal permite apenas um registro.
            </p>
          )}

          <div style={{ marginTop: '2rem', fontSize: '0.6rem', color: 'var(--card-border)', letterSpacing: '2px' }}>
            ID_REF: {group.id.substring(0, 8).toUpperCase()}
          </div>
        </div>
      </div>
    </main>
  );
}
