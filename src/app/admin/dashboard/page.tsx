'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Users, Vote, MessageSquare, Cpu, ArrowLeft, TrendingUp, 
  Award, Clock, ChevronRight, Download, Printer
} from 'lucide-react';

interface GroupComments {
  groupName: string;
  comments: { id: string; comment: string; timestamp: string }[];
}

interface StatsData {
  totalVotes: number;
  votesPerGroup: { name: string; votes: number }[];
  votesOverTime: string[];
  techStats: { name: string; groupCount: number; voteCount: number }[];
  commentsByGroup: GroupComments[];
}

export default function DashboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const stats = await response.json();
      setData(stats);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    window.print();
  };

  const lineChartData = useMemo(() => {
    if (!data?.votesOverTime) return [];
    const intervals: Record<string, number> = {};
    data.votesOverTime.forEach(ts => {
      const date = new Date(ts);
      const hour = date.getHours().toString().padStart(2, '0');
      const minutes = Math.floor(date.getMinutes() / 15) * 15;
      const key = `${hour}:${minutes.toString().padStart(2, '0')}`;
      intervals[key] = (intervals[key] || 0) + 1;
    });
    return Object.entries(intervals).map(([time, count]) => ({ time, count }));
  }, [data]);

  const topGroup = useMemo(() => {
    if (!data?.votesPerGroup || data.votesPerGroup.length === 0) return null;
    return [...data.votesPerGroup].sort((a, b) => b.votes - a.votes)[0];
  }, [data]);
  
  const topTech = useMemo(() => {
    if (!data?.techStats || data.techStats.length === 0) return null;
    return data.techStats[0];
  }, [data]);

  const totalComments = useMemo(() => {
    if (!data?.commentsByGroup) return 0;
    return data.commentsByGroup.reduce((acc, g) => acc + g.comments.length, 0);
  }, [data]);

  const COLORS = ['#00ffcc', '#ff00ff', '#ffff00', '#0099ff', '#ff3300', '#99ff00'];

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader" style={{ border: '4px solid var(--card-border)', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--primary)', fontFamily: 'Orbitron', letterSpacing: '2px' }}>CARREGANDO DADOS DO MAINFRAME...</p>
        </div>
        <style jsx>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!data) return <div>Erro ao carregar dados.</div>;  return (
    <div className="dashboard-container" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <header className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="glitch-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>DASHBOARD ANALYTICS</h1>
          <p style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} /> Monitoramento em tempo real do Workshop
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="cyber-button" 
            onClick={exportToPDF}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              borderColor: 'var(--secondary)',
              color: 'var(--secondary)'
            }}
          >
            <Printer size={18} /> IMPRIMIR / PDF
          </button>
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <button className="cyber-button" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={18} /> Voltar para Gestão
            </button>
          </Link>
        </div>
      </header>

      {/* Cabeçalho exclusivo para impressão */}
      <div className="print-only" style={{ display: 'none', marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
        <h1 style={{ color: 'black', margin: 0, fontSize: '24pt' }}>RELATÓRIO ANALÍTICO - WORKSHOP IANEG</h1>
        <p style={{ color: '#333', margin: '5px 0', fontSize: '12pt' }}>Documento oficial de métricas e feedbacks</p>
        <p style={{ color: '#666', margin: '5px 0', fontSize: '10pt' }}>Gerado em: {new Date().toLocaleString('pt-BR')}</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="cyber-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total de Votos</p>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>{data.totalVotes}</h2>
            </div>
            <div className="no-print" style={{ padding: '10px', background: 'rgba(0,255,204,0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
              <Vote size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            <TrendingUp size={12} style={{ marginRight: '4px' }} /> Engajamento do público
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Líder Atual</p>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--accent)', marginTop: '0.5rem' }}>{topGroup?.name || '---'}</h2>
            </div>
            <div className="no-print" style={{ padding: '10px', background: 'rgba(255,255,0,0.1)', borderRadius: '8px', color: 'var(--accent)' }}>
              <Award size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            {topGroup?.votes || 0} votos computados
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>IA mais Popular</p>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginTop: '0.5rem' }}>{topTech?.name || '---'}</h2>
            </div>
            <div className="no-print" style={{ padding: '10px', background: 'rgba(255,0,255,0.1)', borderRadius: '8px', color: 'var(--secondary)' }}>
              <Cpu size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            Em {topTech?.groupCount || 0} projetos
          </div>
        </div>

        <div className="cyber-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: 'var(--secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Feedback Ativo</p>
              <h2 style={{ fontSize: '2.5rem', color: '#fff' }}>{totalComments}</h2>
            </div>
            <div className="no-print" style={{ padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}>
              <MessageSquare size={24} />
            </div>
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            Comentários registrados
          </div>
        </div>
      </div>

      {/* Tabela de Ranking Geral (Nova) */}
      <div className="cyber-card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }} className="section-title">
          <TrendingUp size={20} /> Classificação Geral dos Grupos
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e0e0e0', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                <th style={{ padding: '12px 8px', color: 'var(--primary)' }}>#</th>
                <th style={{ padding: '12px 8px', color: 'var(--primary)' }}>Grupo</th>
                <th style={{ padding: '12px 8px', color: 'var(--primary)', textAlign: 'center' }}>Votos</th>
                <th style={{ padding: '12px 8px', color: 'var(--primary)', textAlign: 'right' }}>% do Total</th>
              </tr>
            </thead>
            <tbody>
              {[...data.votesPerGroup]
                .sort((a, b) => b.votes - a.votes)
                .map((group, index) => (
                <tr key={group.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: index === 0 ? 'rgba(0,255,204,0.05)' : 'transparent' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 'bold', color: index === 0 ? 'var(--primary)' : 'inherit' }}>
                    {index + 1}º
                  </td>
                  <td style={{ padding: '12px 8px', fontWeight: index === 0 ? 'bold' : 'normal' }}>
                    {group.name}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                    {group.votes}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right', opacity: 0.8 }}>
                    {data.totalVotes > 0 ? ((group.votes / data.totalVotes) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="cyber-card" style={{ padding: '1.5rem', height: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--primary)' }}>Ranking de Grupos (Votos)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data.votesPerGroup}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: '#0a0c10', border: '1px solid var(--primary)', borderRadius: '4px' }}
                itemStyle={{ color: 'var(--primary)' }}
              />
              <Bar dataKey="votes" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="cyber-card" style={{ padding: '1.5rem', height: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--secondary)' }}>Distribuição de IAs</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={data.techStats.slice(0, 6)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="voteCount"
              >
                {data.techStats.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#0a0c10', border: '1px solid var(--secondary)', borderRadius: '4px' }}
                itemStyle={{ color: 'var(--secondary)' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Row: Votação Flow */}
      <div className="cyber-card" style={{ padding: '1.5rem', height: '400px', marginBottom: '2.5rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--accent)' }}>Fluxo de Votação (Votos por Período)</h3>
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={lineChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ background: '#0a0c10', border: '1px solid var(--accent)', borderRadius: '4px' }}
              itemStyle={{ color: 'var(--accent)' }}
            />
            <Line type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent)' }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Feedbacks Section Simplificado */}
      <div className="comments-section" style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }} className="section-title">
          <MessageSquare size={24} /> Feedbacks Detalhados por Grupo
        </h2>
        
        <div className="comments-simple-list">
          {data.commentsByGroup.length > 0 ? (
            data.commentsByGroup.map((group) => (
              <div key={group.groupName} className="group-feedback-block" style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--secondary)', marginBottom: '0.5rem', borderLeft: '4px solid var(--secondary)', paddingLeft: '1rem' }}>
                  {group.groupName}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
                  Comentários ({group.comments.length}):
                </p>
                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                  {group.comments.length > 0 ? (
                    group.comments.map((c) => (
                      <li key={c.id} style={{ 
                        padding: '0.75rem 0', 
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        fontSize: '0.95rem',
                        lineHeight: '1.6',
                        color: '#e0e0e0'
                      }} className="simple-comment-item">
                        <span style={{ color: 'var(--primary)', marginRight: '10px' }}>—</span> 
                        {c.comment}
                        <div className="no-print" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem', marginLeft: '25px' }}>
                          {new Date(c.timestamp).toLocaleTimeString('pt-BR')}
                        </div>
                      </li>
                    ))
                  ) : (
                    <li style={{ fontStyle: 'italic', opacity: 0.5, fontSize: '0.9rem' }}>Nenhum comentário registrado para este grupo.</li>
                  )}
                </ul>
              </div>
            ))
          ) : (
            <div className="cyber-card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ opacity: 0.5 }}>Aguardando o primeiro feedback ser computado...</p>
            </div>
          )}
        </div>
      </div>

      <footer className="no-print" style={{ marginTop: '4rem', paddingBottom: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>
        WORKSHOP DE IA PARA NEGÓCIOS • DASHBOARD ANALYTICS v1.0
      </footer>

      <style jsx global>{`
        @media print {
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

          body {
            background: white !important;
            color: black !important;
            padding: 15mm !important;
            margin: 0 !important;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .cyber-card {
            background: white !important;
            border: 1px solid #000 !important;
            box-shadow: none !important;
            color: black !important;
            break-inside: avoid !important;
            margin-bottom: 25px !important;
            height: auto !important;
            padding: 15px !important;
            border-radius: 0 !important;
          }
          .cyber-card h2, .cyber-card h3, .cyber-card p, .cyber-card span {
            color: black !important;
            font-family: 'Inter', sans-serif !important;
            text-shadow: none !important;
          }
          .glitch-text {
            color: black !important;
            text-shadow: none !important;
            font-family: 'Inter', sans-serif !important;
            font-weight: bold !important;
            letter-spacing: normal !important;
            text-transform: uppercase !important;
          }
          .dashboard-container {
            padding: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            background: white !important;
          }
          .comments-grid {
            display: block !important;
          }
          .comment-card {
            max-height: none !important;
            overflow: visible !important;
            margin-bottom: 30px !important;
            border: 1px solid #333 !important;
          }
          .comments-list {
            overflow: visible !important;
            max-height: none !important;
          }
          .comment-item {
            background: #fff !important;
            border: 1px solid #eee !important;
            border-left: 4px solid #333 !important;
            color: black !important;
            margin-bottom: 10px !important;
          }
          .comment-item p {
            color: black !important;
            font-style: italic;
          }
          .section-title {
            color: black !important;
            margin-top: 40px !important;
            border-bottom: 3px solid #000 !important;
            padding-bottom: 10px !important;
            font-family: 'Inter', sans-serif !important;
            text-transform: uppercase;
          }
          .recharts-responsive-container {
            width: 100% !important;
            height: 350px !important;
            break-inside: avoid !important;
          }
          /* Fix Recharts colors for print */
          .recharts-text {
            fill: black !important;
          }
          .recharts-cartesian-grid-line {
            stroke: #ddd !important;
          }
        }

        .dashboard-container {
          min-height: 100vh;
        }
        @media (max-width: 1024px) {
          div[style*="grid-template-columns: 2fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="grid-template-columns: repeat(auto-fill, minmax(400px, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
        }
        .spinner-small {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
      `}</style>
    </div>
  );
}
