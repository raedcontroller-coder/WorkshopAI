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
    // Verificar se já votou neste navegador
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
        setError('Grupo não encontrado.');
      }
    } catch (err) {
      setError('Erro ao carregar dados.');
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
        alert('Voto computado com sucesso!');
        router.push('/'); // Volta para o ranking geral
      } else {
        const data = await res.json();
        alert(data.message || 'Erro ao votar. Verifique se você já votou.');
      }
    } catch (err) {
      alert('Falha na conexão.');
    } finally {
      setVoting(false);
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>Carregando...</div>;
  if (error) return <div className="container" style={{ textAlign: 'center', paddingTop: '5rem' }}>{error}</div>;
  if (!group) return null;

  return (
    <div className="container" style={{ padding: '1.5rem', maxWidth: '500px', margin: '0 auto' }}>
      <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', textAlign: 'center' }}>
        <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Votação Workshop IA</span>
        <h1 style={{ margin: '1rem 0', color: '#fff' }}>{group.name}</h1>
        <p style={{ color: 'var(--secondary)', marginBottom: '2rem' }}>{group.theme}</p>

        <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '1rem' }}>Integrantes:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {group.members.map(m => (
              <span key={m} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem' }}>{m}</span>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'left', marginBottom: '3rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '1rem' }}>IAs Utilizadas:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {group.technologies.map(t => (
              <span key={t.name} style={{ border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.8rem' }}>{t.name}</span>
            ))}
          </div>
        </div>

        <button 
          onClick={handleVote}
          disabled={hasVoted || voting}
          style={{ 
            width: '100%', 
            padding: '1.2rem', 
            background: hasVoted ? 'transparent' : 'var(--primary)', 
            color: hasVoted ? 'var(--secondary)' : '#000', 
            border: hasVoted ? '1px solid var(--secondary)' : 'none',
            borderRadius: 'var(--radius)', 
            fontWeight: 'bold', 
            fontSize: '1.1rem',
            cursor: hasVoted ? 'not-allowed' : 'pointer',
            transition: '0.3s'
          }}
        >
          {voting ? 'PROCESSANDO...' : hasVoted ? 'VOTO JÁ COMPUTADO' : 'CONFIRMAR MEU VOTO'}
        </button>
        
        {hasVoted && (
          <p style={{ marginTop: '1.5rem', color: 'var(--secondary)', fontSize: '0.85rem' }}>
            Obrigado por participar! Cada dispositivo pode votar apenas uma vez.
          </p>
        )}
      </div>
    </div>
  );
}
