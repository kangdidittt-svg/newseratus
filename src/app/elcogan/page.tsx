'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  UserPlus,
  User,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  X,
  Users,
  Crown
} from 'lucide-react';

interface NewUser {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'admin' | 'user';
}

interface UserListItem {
  id: string;
  username: string;
  email?: string;
  role: 'admin' | 'user';
  createdAt: string;
}

function SuccessPopup({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"
    >
      <CheckCircle className="h-5 w-5" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-green-600 rounded p-1">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

function ErrorPopup({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"
    >
      <X className="h-5 w-5" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:bg-red-600 rounded p-1">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export default function ElcoganPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const [formData, setFormData] = useState<NewUser>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    
    fetchUsers();
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('User created successfully!');
        setShowSuccess(true);
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'user'
        });
        fetchUsers(); // Refresh user list
      } else {
        setErrorMessage(data.error || 'Failed to create user');
        setShowError(true);
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--neuro-bg)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--neuro-bg)' }}>
      {/* Success/Error Popups */}
      {showSuccess && (
        <SuccessPopup
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}
      {showError && (
        <ErrorPopup
          message={errorMessage}
          onClose={() => setShowError(false)}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="mx-auto h-16 w-16 neuro-card rounded-full flex items-center justify-center mb-4">
              <Crown className="h-8 w-8" style={{ color: 'var(--neuro-orange)' }} />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
              User Management
            </h1>
            <p className="text-lg" style={{ color: 'var(--neuro-text-secondary)' }}>
              Create and manage user accounts
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add User Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="neuro-card p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--neuro-orange-light)' }}>
                  <UserPlus className="h-6 w-6" style={{ color: 'var(--neuro-orange)' }} />
                </div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>
                  Add New User
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
                    Username *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5" style={{ color: 'var(--neuro-text-muted)' }} />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        errors.username
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      style={{ 
                        backgroundColor: 'var(--neuro-bg-light)',
                        color: 'var(--neuro-text-primary)'
                      }}
                      placeholder="Enter username"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
                    Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5" style={{ color: 'var(--neuro-text-muted)' }} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        errors.email
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      style={{ 
                        backgroundColor: 'var(--neuro-bg-light)',
                        color: 'var(--neuro-text-primary)'
                      }}
                      placeholder="Enter email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
                    Role *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-5 w-5" style={{ color: 'var(--neuro-text-muted)' }} />
                    </div>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      style={{ 
                        backgroundColor: 'var(--neuro-bg-light)',
                        color: 'var(--neuro-text-primary)'
                      }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5" style={{ color: 'var(--neuro-text-muted)' }} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        errors.password
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      style={{ 
                        backgroundColor: 'var(--neuro-bg-light)',
                        color: 'var(--neuro-text-primary)'
                      }}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" style={{ color: 'var(--neuro-text-muted)' }} />
                      ) : (
                        <Eye className="h-5 w-5" style={{ color: 'var(--neuro-text-muted)' }} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5" style={{ color: 'var(--neuro-text-muted)' }} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        errors.confirmPassword
                          ? 'border-red-300 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      style={{ 
                        backgroundColor: 'var(--neuro-bg-light)',
                        color: 'var(--neuro-text-primary)'
                      }}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" style={{ color: 'var(--neuro-text-muted)' }} />
                      ) : (
                        <Eye className="h-5 w-5" style={{ color: 'var(--neuro-text-muted)' }} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full neuro-button-accent py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Create User
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* User List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="neuro-card p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--neuro-blue-light)' }}>
                  <Users className="h-6 w-6" style={{ color: 'var(--neuro-blue)' }} />
                </div>
                <h2 className="text-xl font-semibold" style={{ color: 'var(--neuro-text-primary)' }}>
                  Existing Users
                </h2>
              </div>

              {loadingUsers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--neuro-orange)' }}></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--neuro-text-muted)' }} />
                  <p style={{ color: 'var(--neuro-text-secondary)' }}>No users found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {users.map((userItem) => (
                    <motion.div
                      key={userItem.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
                      style={{ 
                        backgroundColor: 'var(--neuro-bg-light)',
                        borderColor: 'var(--neuro-border)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full" style={{ backgroundColor: 'var(--neuro-orange-light)' }}>
                            {userItem.role === 'admin' ? (
                              <Crown className="h-4 w-4" style={{ color: 'var(--neuro-orange)' }} />
                            ) : (
                              <User className="h-4 w-4" style={{ color: 'var(--neuro-orange)' }} />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium" style={{ color: 'var(--neuro-text-primary)' }}>
                              {userItem.username}
                            </h3>
                            {userItem.email && (
                              <p className="text-sm" style={{ color: 'var(--neuro-text-secondary)' }}>
                                {userItem.email}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            userItem.role === 'admin'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {userItem.role}
                          </span>
                          <p className="text-xs mt-1" style={{ color: 'var(--neuro-text-muted)' }}>
                            {new Date(userItem.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}