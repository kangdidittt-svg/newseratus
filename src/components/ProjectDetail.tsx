'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  User, 
  Tag, 
  ArrowLeft, 
  Archive, 
  RotateCcw,
  ExternalLink,
  Copy,
  Save,
  Edit3
} from 'lucide-react';
// import ModernCard from '@/components/ModernCard';

interface Project {
  _id: string;
  title: string;
  client: string;
  description: string;
  category: string;
  status: 'ongoing' | 'completed';
  priority: 'low' | 'medium' | 'high';
  budget: number;
  hourlyRate: number;
  hoursWorked: number;
  totalEarned: number;
  startDate: string;
  endDate?: string;
  completedAt?: string;
  masterLink?: string;
  masterNotes?: string;
  workType?: {
    name: string;
  };
  complexity?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ProjectDetailProps {
  projectId: string;
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStudioConfirm, setShowStudioConfirm] = useState(false);
  const [masterLink, setMasterLink] = useState('');
  const [masterNotes, setMasterNotes] = useState('');
  const [editingMaster, setEditingMaster] = useState(false);
  const router = useRouter();
  const USD_TO_IDR = 16000;

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        const proj = data.project || data;
        setProject(proj);
        setMasterLink(proj.masterLink || '');
        setMasterNotes(proj.masterNotes || '');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveToStudioLibrary = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/studio-library`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.warning) {
          setShowStudioConfirm(true);
        } else {
          fetchProject();
        }
      }
    } catch (error) {
      console.error('Error moving to studio library:', error);
    }
  };

  const confirmMoveToStudio = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/studio-library`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true })
      });

      if (response.ok) {
        fetchProject();
        setShowStudioConfirm(false);
      }
    } catch (error) {
      console.error('Error confirming move to studio library:', error);
    }
  };

  const returnToActive = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/studio-library`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        fetchProject();
      }
    } catch (error) {
      console.error('Error returning to active:', error);
    }
  };

  const saveMasterFiles = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/master-files`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterLink, masterNotes })
      });

      if (response.ok) {
        setEditingMaster(false);
        fetchProject();
      }
    } catch (error) {
      console.error('Error saving master files:', error);
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

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--neuro-bg)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center" style={{ color: 'var(--neuro-text-primary)' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen p-6" style={{ background: 'var(--neuro-bg)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center" style={{ color: 'var(--neuro-text-primary)' }}>Project not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--neuro-bg)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/studio-library')}
            className="neuro-button px-3 py-2 flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Kembali
          </button>

          {/* Studio Library Actions */}
          <div className="flex gap-3">
            {project.status === 'ongoing' && (
              <button
                onClick={moveToStudioLibrary}
                className="neuro-button-orange px-4 py-2 flex items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                Move to Studio Library
              </button>
            )}
            {project.status === 'completed' && (
              <>
                <div className="px-4 py-2 rounded-lg flex items-center gap-2" style={{ background: 'var(--neuro-success-light)', color: 'var(--neuro-success)' }}>
                  <Archive className="h-4 w-4" />
                  Archived in Studio Library
                </div>
                <button
                  onClick={returnToActive}
                  className="neuro-button px-4 py-2 flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Return to Active
                </button>
                {project.masterLink && (
                  <>
                    <button
                      onClick={() => window.open(project.masterLink!, '_blank')}
                      className="neuro-button px-4 py-2 flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Master Files
                    </button>
                    <button
                      onClick={() => copyToClipboard(project.masterLink!)}
                      className="neuro-button px-4 py-2 flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Project Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="neuro-card p-6">
              <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--neuro-text-primary)' }}>{project.title}</h1>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" style={{ color: 'var(--neuro-text-muted)' }} />
                  <div>
                    <div className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>Client</div>
                    <div className="font-medium" style={{ color: 'var(--neuro-text-primary)' }}>{project.client}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5" style={{ color: 'var(--neuro-text-muted)' }} />
                  <div>
                    <div className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>Category</div>
                    <div className="font-medium" style={{ color: 'var(--neuro-text-primary)' }}>{project.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" style={{ color: 'var(--neuro-text-muted)' }} />
                  <div>
                    <div className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>Start Date</div>
                    <div className="font-medium" style={{ color: 'var(--neuro-text-primary)' }}>{new Date(project.startDate).toLocaleDateString('id-ID')}</div>
                  </div>
                </div>
                {project.endDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" style={{ color: 'var(--neuro-text-muted)' }} />
                    <div>
                      <div className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>End Date</div>
                      <div className="font-medium" style={{ color: 'var(--neuro-text-primary)' }}>{new Date(project.endDate).toLocaleDateString('id-ID')}</div>
                    </div>
                  </div>
                )}
                {project.workType && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-xs" style={{ background: 'var(--neuro-blue-light)', color: 'var(--neuro-blue)' }}>W</div>
                    <div>
                      <div className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>Work Type</div>
                      <div className="font-medium" style={{ color: 'var(--neuro-text-primary)' }}>{project.workType.name}</div>
                    </div>
                  </div>
                )}
                {project.complexity && (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-xs" style={{ background: 'var(--neuro-orange-light)', color: 'var(--neuro-orange)' }}>C</div>
                    <div>
                      <div className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>Complexity</div>
                      <div className="font-medium" style={{ color: 'var(--neuro-text-primary)' }}>{project.complexity.name}</div>
                    </div>
                  </div>
                )}
              </div>

              {project.description && (
                <div className="mb-4">
                  <div className="text-sm mb-2" style={{ color: 'var(--neuro-text-secondary)' }}>Description</div>
                  <div style={{ color: 'var(--neuro-text-primary)' }}>{project.description}</div>
                </div>
              )}
            </div>

            {/* Financial Info */}
            <div className="neuro-card p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--neuro-text-primary)' }}>Financial Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>Budget</div>
                  <div className="text-lg font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(project.budget || 0)}
                  </div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>Estimasi Rupiah</div>
                  <div className="text-lg font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format((project.budget || 0) * USD_TO_IDR)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Info */}
            <div className="neuro-card p-6">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--neuro-text-primary)' }}>Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--neuro-text-secondary)' }}>Status</span>
                  <span className={`text-xs font-medium`}>
                    <span className="px-2 py-1 rounded-full" style={{ background: project.status === 'completed' ? 'var(--neuro-success-light)' : 'var(--neuro-blue-light)', color: project.status === 'completed' ? 'var(--neuro-success)' : 'var(--neuro-blue)' }}>
                      {project.status === 'ongoing' ? 'On Going' : 'Completed'}
                    </span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--neuro-text-secondary)' }}>Priority</span>
                  <span className={`text-xs font-medium`}>
                    <span className="px-2 py-1 rounded-full" style={{ background: project.priority === 'high' ? 'var(--neuro-error-light)' : project.priority === 'medium' ? 'var(--neuro-warning-light)' : 'var(--neuro-bg-secondary)', color: project.priority === 'high' ? 'var(--neuro-error)' : project.priority === 'medium' ? 'var(--neuro-warning)' : 'var(--neuro-text-secondary)' }}>
                      {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                    </span>
                  </span>
                </div>
                {project.completedAt && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--neuro-text-secondary)' }}>Completed</span>
                    <span className="text-sm" style={{ color: 'var(--neuro-text-primary)' }}>{new Date(project.completedAt).toLocaleDateString('id-ID')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Master Files */}
            <div className="neuro-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>Master Files</h3>
                {!editingMaster && (
                  <button
                    onClick={() => setEditingMaster(true)}
                    className="neuro-button px-3 py-2"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {editingMaster ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--neuro-text-primary)' }}>Master Drive Link</label>
                    <input
                      type="url"
                      value={masterLink}
                      onChange={(e) => setMasterLink(e.target.value)}
                      className="neuro-input w-full"
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--neuro-text-primary)' }}>Notes</label>
                    <textarea
                      value={masterNotes}
                      onChange={(e) => setMasterNotes(e.target.value)}
                      className="neuro-input w-full h-20 resize-none"
                      placeholder="Catatan tentang isi folder master..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveMasterFiles}
                      className="neuro-button-orange flex-1 flex items-center justify-center gap-2 px-3 py-2"
                    >
                      <Save className="h-4 w-4" />
                      Simpan
                    </button>
                    <button
                      onClick={() => {
                        setEditingMaster(false);
                        setMasterLink(project.masterLink || '');
                        setMasterNotes(project.masterNotes || '');
                      }}
                      className="neuro-button flex-1 px-3 py-2"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {project.masterLink ? (
                    <div className="space-y-2">
                      <div className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>Link Tersedia</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open(project.masterLink, '_blank')}
                          className="neuro-button flex-1 flex items-center justify-center gap-2 text-sm px-3 py-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Buka
                        </button>
                        <button
                          onClick={() => copyToClipboard(project.masterLink!)}
                          className="neuro-button flex-1 flex items-center justify-center gap-2 text-sm px-3 py-2"
                        >
                          <Copy className="h-3 w-3" />
                          Copy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-center py-4" style={{ color: 'var(--neuro-text-muted)' }}>
                      Belum ada master link
                    </div>
                  )}
                  {project.masterNotes && (
                    <div>
                      <div className="text-sm font-medium mb-1" style={{ color: 'var(--neuro-text-primary)' }}>Notes</div>
                      <div className="text-sm p-3 rounded-lg" style={{ color: 'var(--neuro-text-secondary)', background: 'var(--neuro-bg-secondary)' }}>
                        {project.masterNotes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showStudioConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50 modal-backdrop">
            <div className="neuro-card p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--neuro-text-primary)' }}>Konfirmasi</h3>
              <p className="mb-6" style={{ color: 'var(--neuro-text-secondary)' }}>
                Master link belum diisi. Tetap pindahkan ke Studio Library?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowStudioConfirm(false)}
                  className="neuro-button flex-1 px-3 py-2"
                >
                  Batal
                </button>
                <button
                  onClick={confirmMoveToStudio}
                  className="neuro-button-orange flex-1 px-3 py-2"
                >
                  Ya, Pindahkan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}