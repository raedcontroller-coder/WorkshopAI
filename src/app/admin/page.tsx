'use client';

import { useState, useEffect } from 'react';

interface Group {
  id: string;
  name: string;
  theme: string;
  members: string[];
  technologies: { name: string }[];
  voteCount?: number;
}

export default function AdminDashboard() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [form, setForm] = useState({ name: '', theme: '', techs: '', members: '' });
  
  // Estados para o QR Code
  const [showQR, setShowQR] = useState(false);
  const [qrGroup, setQrGroup] = useState<Group | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/ranking');
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
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

  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--primary)' }}>Gestão do Workshop</h1>
          <p style={{ color: 'var(--secondary)' }}>Administre grupos, IAs e resultados</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
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
          <button 
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/login';
            }}
            style={{ padding: '0.6rem 1.2rem', borderRadius: 'var(--radius)', border: '1px solid var(--danger)', background: 'transparent', color: 'var(--danger)', cursor: 'pointer' }}
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
                <th style={{ padding: '1rem' }}>Grupo / Tema</th>
                <th style={{ padding: '1rem' }}>Integrantes</th>
                <th style={{ padding: '1rem' }}>IAs</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Votos</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
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

      {showQR && qrGroup && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
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

            <div style={{ marginTop: '2rem' }}>
              <button onClick={() => setShowQR(false)} style={{ padding: '0.8rem 2rem', background: 'var(--primary)', color: '#000', border: 'none', borderRadius: 'var(--radius)', fontWeight: 'bold', cursor: 'pointer' }}>
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
      `}</style>
    </div>
  );
}
