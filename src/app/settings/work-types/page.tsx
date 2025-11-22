'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import ModernCard from '@/components/ModernCard';

interface WorkType {
  _id: string;
  name: string;
  category: string;
  isActive: boolean;
}

interface ComplexityLevel {
  _id: string;
  name: string;
  weight: number;
  isActive: boolean;
}

export default function WorkTypeComplexitySettings() {
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [complexityLevels, setComplexityLevels] = useState<ComplexityLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'workTypes' | 'complexity'>('workTypes');
  const [showWorkTypeModal, setShowWorkTypeModal] = useState(false);
  const [showComplexityModal, setShowComplexityModal] = useState(false);
  const [editingWorkType, setEditingWorkType] = useState<WorkType | null>(null);
  const [editingComplexity, setEditingComplexity] = useState<ComplexityLevel | null>(null);

  // Form states
  const [workTypeName, setWorkTypeName] = useState('');
  const [workTypeCategory, setWorkTypeCategory] = useState('Design');
  const [complexityName, setComplexityName] = useState('');
  const [complexityWeight, setComplexityWeight] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [workTypesRes, complexityRes] = await Promise.all([
        fetch('/api/work-types'),
        fetch('/api/complexity-levels')
      ]);

      if (workTypesRes.ok) {
        const data = await workTypesRes.json();
        setWorkTypes(data);
      }

      if (complexityRes.ok) {
        const data = await complexityRes.json();
        setComplexityLevels(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkType = async () => {
    if (!workTypeName.trim()) return;

    try {
      const response = await fetch('/api/work-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workTypeName, category: workTypeCategory })
      });

      if (response.ok) {
        const newWorkType = await response.json();
        setWorkTypes([...workTypes, newWorkType]);
        setWorkTypeName('');
        setShowWorkTypeModal(false);
      }
    } catch (error) {
      console.error('Error creating work type:', error);
    }
  };

  const handleUpdateWorkType = async () => {
    if (!editingWorkType || !workTypeName.trim()) return;

    try {
      const response = await fetch(`/api/work-types/${editingWorkType._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: workTypeName, category: workTypeCategory, isActive: editingWorkType.isActive })
      });

      if (response.ok) {
        const updated = await response.json();
        setWorkTypes(workTypes.map(wt => wt._id === updated._id ? updated : wt));
        setEditingWorkType(null);
        setWorkTypeName('');
        setShowWorkTypeModal(false);
      }
    } catch (error) {
      console.error('Error updating work type:', error);
    }
  };

  const handleToggleWorkType = async (workType: WorkType) => {
    try {
      const response = await fetch(`/api/work-types/${workType._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...workType, isActive: !workType.isActive })
      });

      if (response.ok) {
        const updated = await response.json();
        setWorkTypes(workTypes.map(wt => wt._id === updated._id ? updated : wt));
      }
    } catch (error) {
      console.error('Error toggling work type:', error);
    }
  };

  const handleCreateComplexity = async () => {
    if (!complexityName.trim()) return;

    try {
      const response = await fetch('/api/complexity-levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: complexityName, weight: complexityWeight })
      });

      if (response.ok) {
        const newComplexity = await response.json();
        setComplexityLevels([...complexityLevels, newComplexity]);
        setComplexityName('');
        setComplexityWeight(1);
        setShowComplexityModal(false);
      }
    } catch (error) {
      console.error('Error creating complexity level:', error);
    }
  };

  const handleUpdateComplexity = async () => {
    if (!editingComplexity || !complexityName.trim()) return;

    try {
      const response = await fetch(`/api/complexity-levels/${editingComplexity._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: complexityName, weight: complexityWeight, isActive: editingComplexity.isActive })
      });

      if (response.ok) {
        const updated = await response.json();
        setComplexityLevels(complexityLevels.map(cl => cl._id === updated._id ? updated : cl));
        setEditingComplexity(null);
        setComplexityName('');
        setComplexityWeight(1);
        setShowComplexityModal(false);
      }
    } catch (error) {
      console.error('Error updating complexity level:', error);
    }
  };

  const handleToggleComplexity = async (complexity: ComplexityLevel) => {
    try {
      const response = await fetch(`/api/complexity-levels/${complexity._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...complexity, isActive: !complexity.isActive })
      });

      if (response.ok) {
        const updated = await response.json();
        setComplexityLevels(complexityLevels.map(cl => cl._id === updated._id ? updated : cl));
      }
    } catch (error) {
      console.error('Error toggling complexity level:', error);
    }
  };

  const openEditWorkType = (workType: WorkType) => {
    setEditingWorkType(workType);
    setWorkTypeName(workType.name);
    setWorkTypeCategory(workType.category);
    setShowWorkTypeModal(true);
  };

  const openEditComplexity = (complexity: ComplexityLevel) => {
    setEditingComplexity(complexity);
    setComplexityName(complexity.name);
    setComplexityWeight(complexity.weight);
    setShowComplexityModal(true);
  };

  const closeModal = () => {
    setShowWorkTypeModal(false);
    setShowComplexityModal(false);
    setEditingWorkType(null);
    setEditingComplexity(null);
    setWorkTypeName('');
    setWorkTypeCategory('Design');
    setComplexityName('');
    setComplexityWeight(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Pengaturan</h1>
          <p className="text-gray-300">Kelola jenis pekerjaan dan tingkat kompleksitas</p>
        </motion.div>

        {/* Tabs */}
        <ModernCard className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('workTypes')}
              className={`px-6 py-3 font-medium ${activeTab === 'workTypes' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Jenis Pekerjaan
            </button>
            <button
              onClick={() => setActiveTab('complexity')}
              className={`px-6 py-3 font-medium ${activeTab === 'complexity' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Tingkat Kompleksitas
            </button>
          </div>
        </ModernCard>

        {/* Content */}
        {activeTab === 'workTypes' && (
          <ModernCard>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Jenis Pekerjaan</h2>
              <button
                onClick={() => setShowWorkTypeModal(true)}
                className="app-btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Jenis Pekerjaan
              </button>
            </div>

            <div className="space-y-3">
              {workTypes.map((workType) => (
                <div key={workType._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{workType.name}</div>
                    <div className="text-sm text-gray-600">{workType.category}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleWorkType(workType)}
                      className={`p-2 rounded-lg ${workType.isActive ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {workType.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => openEditWorkType(workType)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        )}

        {activeTab === 'complexity' && (
          <ModernCard>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Tingkat Kompleksitas</h2>
              <button
                onClick={() => setShowComplexityModal(true)}
                className="app-btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Tambah Level Kompleksitas
              </button>
            </div>

            <div className="space-y-3">
              {complexityLevels.map((complexity) => (
                <div key={complexity._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-800">{complexity.name}</div>
                    <div className="text-sm text-gray-600">Bobot: {complexity.weight}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleComplexity(complexity)}
                      className={`p-2 rounded-lg ${complexity.isActive ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {complexity.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => openEditComplexity(complexity)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        )}

        {/* Modals */}
        {showWorkTypeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <ModernCard className="w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {editingWorkType ? 'Edit' : 'Tambah'} Jenis Pekerjaan
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input
                    type="text"
                    value={workTypeName}
                    onChange={(e) => setWorkTypeName(e.target.value)}
                    className="app-input w-full"
                    placeholder="Contoh: Tracing, Mockup, Layout"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={workTypeCategory}
                    onChange={(e) => setWorkTypeCategory(e.target.value)}
                    className="app-input w-full"
                    placeholder="Contoh: Design, Illustration"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="app-btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  onClick={editingWorkType ? handleUpdateWorkType : handleCreateWorkType}
                  className="app-btn-primary flex-1"
                >
                  {editingWorkType ? 'Update' : 'Tambah'}
                </button>
              </div>
            </ModernCard>
          </div>
        )}

        {showComplexityModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <ModernCard className="w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {editingComplexity ? 'Edit' : 'Tambah'} Level Kompleksitas
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input
                    type="text"
                    value={complexityName}
                    onChange={(e) => setComplexityName(e.target.value)}
                    className="app-input w-full"
                    placeholder="Contoh: Simple, Medium, Complex"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bobot</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={complexityWeight}
                    onChange={(e) => setComplexityWeight(parseInt(e.target.value))}
                    className="app-input w-full"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  className="app-btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  onClick={editingComplexity ? handleUpdateComplexity : handleCreateComplexity}
                  className="app-btn-primary flex-1"
                >
                  {editingComplexity ? 'Update' : 'Tambah'}
                </button>
              </div>
            </ModernCard>
          </div>
        )}
      </div>
    </div>
  );
}