'use client';

import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, ExternalLink, Copy, Eye, Calendar, User, Tag, X, Edit3, Save, RotateCcw } from 'lucide-react';

interface StudioProject {
  _id: string;
  title: string;
  client: string;
  category: string;
  workType?: {
    name: string;
  };
  complexity?: {
    name: string;
  };
  completedAt: string;
  masterLink?: string;
  masterNotes?: string;
}

export default function StudioLibrary() {
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'completedAt' | 'title' | 'client'>('completedAt');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/studio-library', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching studio projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.workType?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'client':
        return a.client.localeCompare(b.client);
      case 'completedAt':
      default:
        return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    }
  });

  type ProjectDetail = {
    _id: string;
    title: string;
    client?: string;
    category?: string;
    completedAt?: string;
    description?: string;
    masterLink?: string;
    masterNotes?: string;
  };

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProject, setDetailProject] = useState<ProjectDetail | null>(null);
  const [editingDetail, setEditingDetail] = useState(false);
  const [masterLinkInput, setMasterLinkInput] = useState('');
  const [masterNotesInput, setMasterNotesInput] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--neuro-bg)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center" style={{ color: 'var(--neuro-text-primary)' }}>Loading...</div>
        </div>
      </div>
    );
  }

  const openDetail = async (id: string) => {
    try {
      setDetailOpen(true);
      const resp = await fetch(`/api/projects/${id}`, { credentials: 'include' });
      if (resp.ok) {
        const data = await resp.json();
        const p = data.project || data;
        setDetailProject({
          _id: p._id,
          title: p.title,
          client: p.client,
          category: p.category,
          completedAt: p.completedAt,
          description: p.description,
          masterLink: p.masterLink,
          masterNotes: p.masterNotes,
        });
        setMasterLinkInput(p.masterLink || '');
        setMasterNotesInput(p.masterNotes || '');
        setEditingDetail(false);
      } else {
        setDetailProject(null);
      }
    } catch {
      setDetailProject(null);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--neuro-bg)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Studio Library</h1>
          <p style={{ color: 'var(--neuro-text-secondary)' }}>Arsip project yang telah selesai</p>
        </motion.div>

        {/* Search and Filters */}
        <div className="neuro-card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5" style={{ color: 'var(--neuro-text-muted)' }} />
              <input
                type="text"
                placeholder="Cari project atau client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neuro-input pl-10 w-full"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'completedAt' | 'title' | 'client')}
              className="neuro-select"
            >
              <option value="completedAt">Tanggal Selesai</option>
              <option value="title">Nama Project</option>
              <option value="client">Client</option>
            </select>
          </div>
        </div>

        {/* Projects Grid */}
        {sortedProjects.length === 0 ? (
          <div className="neuro-card p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4" style={{ color: 'var(--neuro-text-primary)' }}>📚</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Belum ada project di Studio Library</h3>
              <p style={{ color: 'var(--neuro-text-secondary)' }}>Project yang telah selesai akan muncul di sini</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProjects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="neuro-card p-6 h-full">
                  <div className="flex flex-col h-full">
                    {/* Project Info */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>{project.title}</h3>
                      {!project.masterLink && (
                        <span className="inline-block px-2 py-1 text-xs rounded-full mb-2" style={{ background: 'var(--neuro-bg-secondary)', color: 'var(--neuro-text-secondary)' }}>No Master File</span>
                      )}
                      <div className="space-y-2 text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{project.client}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          <span>{project.category}</span>
                        </div>
                        {project.workType && (
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded flex items-center justify-center text-xs" style={{ background: 'var(--neuro-blue-light)', color: 'var(--neuro-blue)' }}>W</span>
                            <span>{project.workType.name}</span>
                          </div>
                        )}
                        {project.complexity && (
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded flex items-center justify-center text-xs" style={{ background: 'var(--neuro-orange-light)', color: 'var(--neuro-orange)' }}>C</span>
                            <span>{project.complexity.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(project.completedAt).toLocaleDateString('id-ID')}</span>
                        </div>
                      </div>
                    </div>

                      {/* Master File Section */}
                      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--neuro-border)' }}>
                        <div className="text-sm font-medium mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Master File</div>
                        {project.masterLink ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => window.open(project.masterLink, '_blank')}
                              className="neuro-button flex items-center gap-1 text-xs px-3 py-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Buka
                            </button>
                            <button
                              onClick={() => copyToClipboard(project.masterLink!)}
                              className="neuro-button flex items-center gap-1 text-xs px-3 py-1"
                            >
                              <Copy className="h-3 w-3" />
                              Copy
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm flex items-center gap-2" style={{ color: 'var(--neuro-text-muted)' }}>
                            <span>Belum ada link</span>
                            <span className="px-2 py-0.5 text-xs rounded-full" style={{ background: 'var(--neuro-bg-secondary)', color: 'var(--neuro-text-secondary)' }}>No Master File</span>
                          </div>
                        )}
                      </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--neuro-border)' }}>
                      <button
                        onClick={() => openDetail(project._id)}
                        className="neuro-button-orange w-full flex items-center justify-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Lihat Project
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {/* Detail Modal */}
      {detailOpen && (
        <div className="fixed inset-0 z-50 modal-backdrop flex items-center justify-center">
          <div className="neuro-card p-6 w-full max-w-3xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>Detail Project</h2>
              <div className="flex items-center gap-2">
                {detailProject && (
                  <button title="Kembalikan ke Active" className="neuro-button p-2" onClick={async () => {
                    try {
                      const resp = await fetch(`/api/projects/${detailProject._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ status: 'ongoing' })
                      });
                      if (resp.ok) {
                        await fetchProjects();
                        setDetailOpen(false);
                        setDetailProject(null);
                      } else {
                        const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
                        alert('Gagal mengembalikan ke Active: ' + (err.error || 'Unknown error'));
                      }
                    } catch (e) {
                      alert('Gagal mengembalikan ke Active: ' + (e as Error).message);
                    }
                  }}>
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
                <button className="neuro-button p-2" onClick={() => { setDetailOpen(false); setDetailProject(null); }}>
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {detailProject ? (
              <div className="space-y-4">
                <div>
                  <div className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>Nama Project</div>
                  <div className="text-lg font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>{detailProject.title}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" style={{ color: 'var(--neuro-text-muted)' }} />
                    <span style={{ color: 'var(--neuro-text-primary)' }}>{detailProject.client}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" style={{ color: 'var(--neuro-text-muted)' }} />
                    <span style={{ color: 'var(--neuro-text-primary)' }}>{detailProject.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" style={{ color: 'var(--neuro-text-muted)' }} />
                    <span style={{ color: 'var(--neuro-text-primary)' }}>{detailProject.completedAt ? new Date(detailProject.completedAt).toLocaleDateString('id-ID') : '-'}</span>
                  </div>
                </div>
                {detailProject.description && (
                  <div>
                    <div className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>Deskripsi</div>
                    <div style={{ color: 'var(--neuro-text-primary)' }}>{detailProject.description}</div>
                  </div>
                )}
                <div className="mt-2 pt-4" style={{ borderTop: '1px solid var(--neuro-border)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium" style={{ color: 'var(--neuro-text-primary)' }}>Master File</div>
                    {!editingDetail && (
                      <button className="neuro-button p-2" title="Edit master link" onClick={() => setEditingDetail(true)}>
                        <Edit3 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {editingDetail ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm mb-1" style={{ color: 'var(--neuro-text-secondary)' }}>Master Drive Link</label>
                        <input className="neuro-input w-full" type="url" value={masterLinkInput} onChange={(e) => setMasterLinkInput(e.target.value)} placeholder="https://drive.google.com/..." />
                      </div>
                      <div>
                        <label className="text-sm mb-1" style={{ color: 'var(--neuro-text-secondary)' }}>Notes</label>
                        <textarea className="neuro-input w-full h-20 resize-none" value={masterNotesInput} onChange={(e) => setMasterNotesInput(e.target.value)} placeholder="Catatan tentang isi folder master..." />
                      </div>
                      <div className="flex gap-2">
                        <button className="neuro-button-orange flex-1 px-3 py-2 flex items-center justify-center gap-2" onClick={async () => {
                          if (!detailProject) return;
                          try {
                            const resp = await fetch(`/api/projects/${detailProject._id}/master-files`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({ masterLink: masterLinkInput, masterNotes: masterNotesInput })
                            });
                            if (!resp.ok) {
                              const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
                              alert('Gagal menyimpan Master File: ' + (err.error || 'Unknown error'));
                              return;
                            }
                            setDetailProject({ ...detailProject, masterLink: masterLinkInput, masterNotes: masterNotesInput });
                            await fetchProjects();
                            setEditingDetail(false);
                          } catch (e) {
                            alert('Gagal menyimpan Master File: ' + (e as Error).message);
                          }
                        }}>
                          <Save className="h-4 w-4" />
                          Simpan
                        </button>
                        <button className="neuro-button flex-1 px-3 py-2" onClick={() => {
                          setEditingDetail(false);
                          setMasterLinkInput(detailProject.masterLink || '');
                          setMasterNotesInput(detailProject.masterNotes || '');
                        }}>
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    detailProject.masterLink ? (
                      <div className="flex gap-2">
                        <button onClick={() => window.open(detailProject.masterLink!, '_blank')} className="neuro-button text-xs px-3 py-1 flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> Buka
                        </button>
                        <button onClick={() => navigator.clipboard.writeText(detailProject.masterLink!)} className="neuro-button text-xs px-3 py-1 flex items-center gap-1">
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm" style={{ color: 'var(--neuro-text-muted)' }}>Belum ada link</div>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--neuro-text-muted)' }}>Loading...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}