'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Group {
  id: string;
  name: string;
  theme: string;
  members: string[];
  technologies: { name: string }[];
  voteCount?: number;
  comments?: { text: string; date: string }[];
}

export default function AdminDashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [form, setForm] = useState({ name: '', theme: '', techs: '', members: '' });
  const [showQR, setShowQR] = useState(false);
  const [qrGroup, setQrGroup] = useState<Group | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentGroup, setCommentGroup] = useState<Group | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'votes'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/ranking');
      const data = await response.json();
      if (Array.isArray(data)) {
        setGroups(data);
      } else {
        console.error('Dados de ranking inválidos:', data);
        setGroups([]);
      }
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
    }
  };

  const getSortedGroups = () => {
    return [...groups].sort((a, b) => {
      if (sortBy === 'name') {
        const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      } else {
        const votesA = a.voteCount || 0;
        const votesB = b.voteCount || 0;
        return sortOrder === 'asc' ? votesA - votesB : votesB - votesA;
      }
    });
  };

  const toggleSort = (criterion: 'name' | 'votes') => {
    if (sortBy === criterion) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criterion);
      setSortOrder(criterion === 'votes' ? 'desc' : 'asc'); // Votos geralmente queremos ver o maior primeiro
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setForm({
      name: group.name,
      theme: group.theme,
      techs: group.technologies.map(t => t.name).join(', '),
      members: group.members.join(', '),
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo? Todos os votos serão perdidos.')) return;
    
    try {
      const res = await fetch(`/api/admin/groups/${id}`, { method: 'DELETE' });
      if (res.ok) fetchGroups();
      else alert('Erro ao excluir');
    } catch (error) {
      alert('Erro de conexão');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingGroup ? `/api/admin/groups/${editingGroup.id}` : '/api/admin/groups';
    const method = editingGroup ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          theme: form.theme,
          technologies: form.techs.split(',').map(t => t.trim()).filter(t => t !== ''),
          members: form.members.split(',').map(m => m.trim()).filter(m => m !== ''),
        }),
      });

      if (response.ok) {
        setForm({ name: '', theme: '', techs: '', members: '' });
        setIsEditing(false);
        setEditingGroup(null);
        fetchGroups();
      } else {
        const err = await response.json();
        alert(err.message || 'Erro ao salvar');
      }
    } catch (error) {
      alert('Falha na conexão');
    }
  };

  const handleResetVotes = async () => {
    const confirm1 = confirm('ATENÇÃO: Você está prestes a apagar TODOS os votos do sistema. Esta ação não pode ser desfeita. Deseja continuar?');
    if (!confirm1) return;

    const confirm2 = confirm('CONFIRMAÇÃO FINAL: Tem certeza absoluta que deseja ZERAR o banco de votos para recomeçar?');
    if (!confirm2) return;

    try {
      const res = await fetch('/api/admin/votes/reset', { method: 'POST' });
      if (res.ok) {
        alert('O banco de votos foi zerado com sucesso!');
        fetchGroups(); // Atualiza o ranking
      } else {
        alert('Erro ao zerar votos.');
      }
    } catch (error) {
      alert('Erro de conexão com o mainframe.');
    }
  };

  const sortedGroups = getSortedGroups();

  return (
    <>
      <div className="container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--primary)' }}>Gestão do Workshop</h1>
            <p style={{ color: 'var(--secondary)' }}>Administre grupos, IAs e resultados</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={handleResetVotes}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: 'var(--radius)',
                background: 'var(--danger)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                boxShadow: '0 0 15px rgba(255, 0, 0, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              ⚠️ Zerar Todos os Votos
            </button>
            <button 
              onClick={() => {
                setEditingGroup(null);
                setForm({ name: '', theme: '', techs: '', members: '' });
                setIsEditing(!isEditing);
              }}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: 'var(--radius)',
                background: isEditing ? 'transparent' : 'var(--primary)',
                color: isEditing ? 'var(--primary)' : '#000',
                border: isEditing ? '1px solid var(--primary)' : 'none',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              {isEditing ? 'Cancelar' : '+ Novo Grupo'}
            </button>
            <Link href="/admin/dashboard" style={{ textDecoration: 'none' }}>
              <button 
                style={{
                  padding: '0.6rem 1.2rem',
                  borderRadius: 'var(--radius)',
                  background: 'rgba(0, 255, 204, 0.1)',
                  color: 'var(--primary)',
                  border: '1px solid var(--primary)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                📊 Dashboard
              </button>
            </Link>
            <button 
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
              }}
              style={{ padding: '0.6rem 1.2rem', borderRadius: 'var(--radius)', border: '1px solid var(--card-border)', background: 'transparent', color: 'var(--secondary)', cursor: 'pointer' }}
            >
              Sair
            </button>
          </div>
        </header>

        {isEditing && (
          <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius)', marginBottom: '3rem', border: '1px solid var(--primary)' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>
              {editingGroup ? `Editando: ${editingGroup.name}` : 'Cadastrar Novo Grupo'}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <label>Nome do Grupo
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="admin-input" />
                </label>
                <label>Tema do Projeto
                  <input type="text" value={form.theme} onChange={e => setForm({...form, theme: e.target.value})} required className="admin-input" />
                </label>
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <label>IAs Utilizadas (virgula)
                  <input type="text" value={form.techs} onChange={e => setForm({...form, techs: e.target.value})} placeholder="Claude, ChatGPT, Midjourney" className="admin-input" />
                </label>
                <label>Integrantes (virgula)
                  <input type="text" value={form.members} onChange={e => setForm({...form, members: e.target.value})} placeholder="João Silva, Maria Souza" className="admin-input" />
                </label>
              </div>
              <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                <button type="submit" style={{ padding: '0.8rem 2rem', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: 'var(--radius)', fontWeight: 'bold', cursor: 'pointer' }}>
                  {editingGroup ? 'Atualizar Dados' : 'Criar Grupo'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="ranking-section">
          <h2 style={{ marginBottom: '1.5rem' }}>Grupos e Ranking</h2>
          <div className="glass" style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--card-border)' }}>
                  <th 
                    onClick={() => toggleSort('name')}
                    style={{ padding: '1rem', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Grupo / Tema {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th style={{ padding: '1rem' }}>Integrantes</th>
                  <th style={{ padding: '1rem' }}>IAs</th>
                  <th 
                    onClick={() => toggleSort('votes')}
                    style={{ padding: '1rem', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                  >
                    Votos {sortBy === 'votes' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedGroups.map((group) => (
                  <tr key={group.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', verticalAlign: 'top' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{group.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--secondary)' }}>{group.theme}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      {group.members.length > 0 ? group.members.join(', ') : <span style={{ opacity: 0.3 }}>Nenhum</span>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {group.technologies.map(t => (
                          <span key={t.name} style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(0,243,255,0.1)', color: 'var(--primary)', border: '1px solid rgba(0,243,255,0.2)' }}>
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold' }}>
                      {group.voteCount || 0}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => { setCommentGroup(group); setShowComments(true); }} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--secondary)', color: 'var(--secondary)', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem' }}>Comentários ({group.comments?.length || 0})</button>
                        <button onClick={() => { setQrGroup(group); setShowQR(true); }} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--primary)', color: 'var(--primary)', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem' }}>QR Code</button>
                        <button onClick={() => handleEdit(group)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem' }}>Editar</button>
                        <button onClick={() => handleDelete(group.id)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--danger)', color: 'var(--danger)', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem' }}>Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showQR && qrGroup && (
        <>
          {/* Modal Visível na Tela */}
          <div className="no-print" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
            <div className="glass" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px', borderRadius: 'var(--radius)' }}>
              <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Votação: {qrGroup.name}</h2>
              <p style={{ color: 'var(--secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>Aponte a câmera para votar neste grupo</p>
              
              <div style={{ background: '#fff', padding: '1rem', borderRadius: '10px', display: 'inline-block' }}>
                <img 
                  src={`https://quickchart.io/qr?text=${encodeURIComponent(window.location.origin + '/vote/' + qrGroup.id)}&size=300`} 
                  alt="QR Code" 
                  style={{ display: 'block' }}
                />
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button 
                  onClick={() => window.print()} 
                  style={{ padding: '0.8rem 1.5rem', background: 'var(--secondary)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🖨️ Imprimir
                </button>
                <button 
                  onClick={() => setShowQR(false)} 
                  style={{ padding: '0.8rem 1.5rem', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: 'var(--radius)', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>

          {/* Área Oculta Apenas para Impressão */}
          <div id="print-area">
            <div style={{ 
              textAlign: 'center', 
              fontFamily: 'sans-serif', 
              padding: '2cm',
              height: '297mm',
              width: '210mm',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              background: '#fff'
            }}>
              <h1 style={{ fontSize: '64px', marginBottom: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>{qrGroup.name}</h1>
              <h2 style={{ fontSize: '32px', color: '#333', marginBottom: '60px', letterSpacing: '2px' }}>VOTE EM NOSSO PROJETO!</h2>
              
              <div style={{ border: '2px solid #000', padding: '1.5rem', borderRadius: '20px' }}>
                <img 
                  src={`https://quickchart.io/qr?text=${encodeURIComponent(window.location.origin + '/vote/' + qrGroup.id)}&size=600`} 
                  alt="QR Code" 
                  style={{ width: '14cm', height: '14cm', display: 'block' }}
                />
              </div>

              <p style={{ fontSize: '24px', marginTop: '60px', fontWeight: '500' }}>Aponte a câmera para votar neste grupo</p>
              
              <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#000' }}>WORKSHOP DE IA PARA NEGÓCIOS</div>
                <div style={{ fontSize: '18px', color: '#333' }}>FECAP</div>
              </div>
            </div>
          </div>
        </>
      )}

      {showComments && commentGroup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
          <div className="glass" style={{ padding: '2rem', width: '100%', maxWidth: '600px', borderRadius: 'var(--radius)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--primary)', margin: 0 }}>Comentários: {commentGroup.name}</h2>
              <button 
                onClick={() => setShowComments(false)} 
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '1rem' }}>
              {commentGroup.comments && commentGroup.comments.length > 0 ? (
                commentGroup.comments.map((comment, i) => (
                  <div key={i} style={{ 
                    padding: '1rem', 
                    background: 'rgba(255,255,255,0.05)', 
                    borderRadius: '8px', 
                    marginBottom: '1rem',
                    borderLeft: '3px solid var(--secondary)'
                  }}>
                    <p style={{ margin: '0 0 0.5rem 0', lineHeight: '1.5' }}>"{comment.text}"</p>
                    <small style={{ color: 'var(--secondary)', opacity: 0.7 }}>
                      {new Date(comment.date).toLocaleString('pt-BR')}
                    </small>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>Nenhum comentário registrado para este grupo.</p>
              )}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button 
                onClick={() => setShowComments(false)} 
                style={{ padding: '0.8rem 2rem', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: 'var(--radius)', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-input {
          width: 100%;
          padding: 0.8rem;
          margin-top: 0.4rem;
          border-radius: var(--radius);
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--card-border);
          color: #fff;
          outline: none;
        }
        .admin-input:focus {
          border-color: var(--primary);
        }
        label {
          font-size: 0.85rem;
          color: var(--secondary);
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        #print-area {
          display: none;
        }

        @media print {
          body {
            background: white !important;
            margin: 0;
            padding: 0;
          }
          .container {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
          #print-area {
            display: flex !important;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white !important;
            justify-content: center;
            align-items: center;
          }
        }
      `}</style>
    </>
  );
}
