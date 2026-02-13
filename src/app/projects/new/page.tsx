'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, ArrowLeft, CheckCircle, X } from 'lucide-react';
import Link from 'next/link';
import { triggerDashboardRefresh } from '@/hooks/useRealtimeDashboard';

function SuccessPopup({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
      <CheckCircle className="h-5 w-5" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-green-600 rounded p-1">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function NewProjectPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    description: '',
    category: 'website',
    priority: 'Medium',
    budget: '',
    deadline: '',
    status: 'pending'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Nama project harus diisi';
    }
    
    if (!formData.client.trim()) {
      newErrors.client = 'Nama client harus diisi';
    }
    
    if (formData.budget && parseFloat(formData.budget) < 0) {
      newErrors.budget = 'Budget tidak boleh negatif';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          client: formData.client,
          description: formData.description,
          priority: formData.priority,
          budget: formData.budget ? parseFloat(formData.budget) : undefined,
          deadline: formData.deadline || undefined,
          status: formData.status
        }),
      });

      if (response.ok) {
        const projectData = await response.json();
        
        // Add notification for successful project creation
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              title: 'Project Created Successfully',
              message: `New project "${formData.title}" has been created for client ${formData.client}`,
              type: 'general',
              projectId: projectData.project?._id,
              projectTitle: formData.title,
              clientName: formData.client
            })
          });
        } catch (notificationError) {
          console.error('Error creating notification:', notificationError);
        }
        
        // Trigger dashboard refresh immediately
        triggerDashboardRefresh('project-created');
        
        setShowSuccess(true);
        // Reset form
        setFormData({
          title: '',
          client: '',
          description: '',
          priority: 'Medium',
          budget: '',
          deadline: '',
          status: 'pending'
        });
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menambahkan project');
      }
    } catch (error) {
      console.error('Error adding project:', error);
      alert('Terjadi kesalahan saat menambahkan project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h1>
          <p className="text-gray-600 mb-4">Anda harus login untuk mengakses halaman ini.</p>
          <Link href="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Project Baru</h1>
                <p className="text-gray-600 text-sm md:text-base">Tambahkan project baru untuk client Anda</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-4 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama Project */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Project *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                      errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan nama project"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Nama Client */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Client *
                  </label>
                  <input
                    type="text"
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                      errors.client ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan nama client"
                  />
                  {errors.client && (
                    <p className="mt-1 text-sm text-red-600">{errors.client}</p>
                  )}
                </div>
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                >
                  <option value="website">Website</option>
                  <option value="mobile-app">Mobile App</option>
                  <option value="branding">Branding</option>
                  <option value="e-commerce">E-Commerce</option>
                  <option value="api">API</option>
                </select>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Project
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  placeholder="Deskripsi detail tentang project (opsional)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Prioritas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioritas
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="neuro-select w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className={`w-full pl-8 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                        errors.budget ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.budget && (
                    <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="neuro-select w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                  >
                    <option value="pending">Pending</option>
                    <option value="on-progress">On Progress</option>
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-4 md:pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 neuro-button-orange px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Menambahkan...
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Tambah Project
                    </>
                  )}
                </button>
                
                <Link
                  href="/dashboard"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center font-medium"
                >
                  Batal
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <SuccessPopup 
          message="Project berhasil ditambahkan! Mengalihkan ke dashboard..." 
          onClose={() => setShowSuccess(false)} 
        />
      )}
    </div>
  );
}
