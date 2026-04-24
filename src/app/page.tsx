'use client';

import { useState, useEffect } from 'react';

// Tipagem simplificada para os grupos
interface Group {
  id: string;
  name: string;
  theme: string;
  technologies: { name: string }[];
}

export default function VotingPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [votingId, setVotingId] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se já votou no LocalStorage
    const hasVoted = localStorage.getItem('ianeg_voted');
    if (hasVoted) setVoted(true);

    // Carregar grupos (Mock por enquanto ou Fetch da API)
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      const data = await response.json();
      setGroups(data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  const handleVote = async (groupId: string) => {
    if (voted) return;

    setVotingId(groupId);
    
    try {
      // Simulação de chamada de API
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId }),
      });

      if (response.ok) {
        localStorage.setItem('ianeg_voted', 'true');
        setVoted(true);
        alert('Voto registrado com sucesso!');
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao votar.');
      }
    } catch (error) {
      alert('Falha na conexão com o servidor.');
    } finally {
      setVotingId(null);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Workshop de IA</h1>
        <p style={{ color: 'var(--secondary)', fontSize: '1.1rem' }}>Vote no seu projeto favorito</p>
      </header>

      {voted ? (
        <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius)', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Obrigado pelo seu voto!</h2>
          <p style={{ color: 'var(--foreground)' }}>Seu voto já foi contabilizado. Boa sorte a todos os grupos!</p>
        </div>
      ) : (
        <div className="group-grid" style={{ display: 'grid', gap: '1.5rem' }}>
          {loading ? (
            <p style={{ textAlign: 'center' }}>Carregando projetos...</p>
          ) : (
            groups.map((group) => (
              <div key={group.id} className="glass" style={{ 
                padding: '1.5rem', 
                borderRadius: 'var(--radius)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'transform 0.2s',
                cursor: 'default'
              }}>
                <div>
                  <h3 style={{ color: 'var(--foreground)', fontSize: '1.4rem' }}>{group.name}</h3>
                  <p style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{group.theme}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {group.technologies.map((tech) => (
                      <span key={tech.name} style={{ 
                        fontSize: '0.8rem', 
                        padding: '0.2rem 0.6rem', 
                        background: 'rgba(255,255,255,0.1)', 
                        borderRadius: '20px',
                        color: 'var(--secondary)'
                      }}>
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => handleVote(group.id)}
                  disabled={votingId !== null}
                  style={{
                    padding: '0.8rem 1.5rem',
                    borderRadius: 'var(--radius)',
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#000',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: '0.3s',
                    opacity: votingId !== null ? 0.5 : 1
                  }}
                  onMouseOver={(e) => e.currentTarget.style.filter = 'brightness(1.2)'}
                  onMouseOut={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                >
                  {votingId === group.id ? 'Votando...' : 'Votar'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--secondary)', fontSize: '0.9rem' }}>
        &copy; 2026 Workshop de IA - Todos os direitos reservados.
      </footer>
    </div>
  );
}
