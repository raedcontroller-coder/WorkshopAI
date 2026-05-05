'use client';

import { useState, useEffect } from 'react';

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
    const hasVoted = localStorage.getItem('ianeg_voted');
    if (hasVoted) setVoted(true);
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      const data = await response.json();
      
      // Ordenação Numérica (Garante que o Grupo 2 venha antes do Grupo 10)
      const sortedGroups = data.sort((a: Group, b: Group) => {
        const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
        return numA - numB;
      });

      setGroups(sortedGroups);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (groupId: string) => {
    if (voted) return;
    setVotingId(groupId);
    
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId }),
      });

      if (response.ok) {
        localStorage.setItem('ianeg_voted', 'true');
        setVoted(true);
      } else {
        const error = await response.json();
        alert(error.message || 'Erro ao votar.');
      }
    } catch (error) {
      alert('Falha na conexão com o mainframe central.');
    } finally {
      setVotingId(null);
    }
  };

  return (
    <main style={{ padding: '4rem 1rem', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-block', borderBottom: '2px solid var(--primary)', paddingBottom: '1rem' }}>
            <h1 className="glitch-text" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              Workshop IA
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <span style={{ height: '2px', width: '20px', background: 'var(--secondary)' }}></span>
              <p style={{ color: 'var(--primary)', fontStyle: 'italic', letterSpacing: '2px', fontSize: '0.8rem' }}>
                SELEÇÃO NEURAL ATIVA
              </p>
              <span style={{ height: '2px', width: '20px', background: 'var(--secondary)' }}></span>
            </div>
          </div>
        </header>

        <section className="cyber-card" style={{ padding: '2rem', marginBottom: '3rem', borderLeft: '4px solid var(--secondary)' }}>
          <p style={{ color: 'var(--foreground)', lineHeight: '1.7', fontSize: '1.05rem', textAlign: 'justify' }}>
            O <strong>Workshop de IA para Negócios da FECAP</strong> é um evento focado em capacitar profissionais para a aplicação estratégica e prática de ferramentas de Inteligência Artificial no mundo corporativo, visando a otimização de processos, o aumento da produtividade e a geração de valor. 
            Com foco em áreas como automação de tarefas e o uso de IAs generativas, o workshop busca fornecer o conhecimento essencial para que os participantes possam identificar e implementar soluções de IA que transformem seus negócios, tornando-os mais eficientes e competitivos no mercado atual.
          </p>
        </section>

        {voted ? (
          <div className="cyber-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '2rem' }}>
              VOTO COMPUTADO
            </h2>
            <p style={{ color: 'var(--foreground)', fontSize: '1.2rem', lineHeight: '1.6' }}>
              Seu registro foi enviado com sucesso para o mainframe.<br/>
              <span style={{ color: 'var(--secondary)' }}>Aguarde o processamento dos resultados finais.</span>
            </p>
            <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--card-border)' }}>
              STATUS_SISTEMA: SEGURO
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {loading ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                <div className="glitch-text">ESCANEANDO_FLUXOS_DE_DADOS...</div>
              </div>
            ) : (
              groups.map((group) => (
                <article key={group.id} className="cyber-card" style={{ padding: '2rem' }}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ color: 'var(--foreground)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                      {group.name}
                    </h3>
                    <div style={{ 
                      color: 'var(--primary)', 
                      fontSize: '0.8rem', 
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%' }}></span>
                      {group.theme}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {group.technologies.map((tech) => (
                        <span key={tech.name} style={{ 
                          fontSize: '0.7rem', 
                          padding: '0.2rem 0.6rem', 
                          border: '1px solid var(--card-border)',
                          color: 'var(--secondary)',
                          background: 'rgba(255, 0, 255, 0.05)'
                        }}>
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleVote(group.id)}
                    disabled={votingId !== null}
                    className="cyber-button"
                    style={{ width: '100%' }}
                  >
                    {votingId === group.id ? 'TRANSMITINDO...' : 'VOTAR NO PROJETO'}
                  </button>
                </article>
              ))
            )}
          </div>
        )}

        <footer style={{ marginTop: '6rem', textAlign: 'center', color: 'var(--card-border)', fontSize: '0.8rem', letterSpacing: '4px' }}>
          &copy; 2026 // WORKSHOP_IA // ACESSO_AO_TERMINAL_CONCEDIDO
        </footer>
      </div>
    </main>
  );
}

