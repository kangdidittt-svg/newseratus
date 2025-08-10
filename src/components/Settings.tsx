'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  User,
  Camera,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  Key,
  Trash2,
  LogOut,
  Settings as SettingsIcon,
  Users,
  Edit,
  Crown
} from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface UserSettings {
  profile: {
    avatar: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    language: string;
    timezone: string;
  };
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [deleteDataModal, setDeleteDataModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('user');
  const [settings, setSettings] = useState<UserSettings>({
    profile: {
      avatar: '/api/placeholder/150/150'
    },
    preferences: {
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      language: 'en',
      timezone: 'America/New_York'
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Admin management states
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userActionMessage, setUserActionMessage] = useState('');
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Load settings from API on component mount
  useEffect(() => {
    loadSettings();
    checkUserRole();
  }, []);
  
  // Load users when admin tab is active
  useEffect(() => {
    if (activeTab === 'admin' && currentUserRole === 'admin') {
      loadUsers();
    }
  }, [activeTab, currentUserRole]);
  
  const loadSettings = async () => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      } else {
        console.error('Failed to load settings:', response.status);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkUserRole = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentUserRole(data.user?.role || 'user');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };
  
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        setUserActionMessage('Failed to load users');
        setTimeout(() => setUserActionMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUserActionMessage('Error loading users');
      setTimeout(() => setUserActionMessage(''), 3000);
    } finally {
      setIsLoadingUsers(false);
    }
  };
  
  const handleDeleteUser = (user: AdminUser) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ userId: userToDelete.id })
      });
      
      if (response.ok) {
        setUsers(users.filter(user => user.id !== userToDelete.id));
        setUserActionMessage('User deleted successfully');
        setTimeout(() => setUserActionMessage(''), 3000);
      } else {
        const data = await response.json();
        setUserActionMessage(data.error || 'Failed to delete user');
        setTimeout(() => setUserActionMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setUserActionMessage('Error deleting user');
      setTimeout(() => setUserActionMessage(''), 3000);
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const cancelDeleteUser = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };
  
  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ userId, role: newRole })
      });
      
      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ));
        setUserActionMessage(`User role updated to ${newRole}`);
        setTimeout(() => setUserActionMessage(''), 3000);
        setShowEditModal(false);
        setEditingUser(null);
      } else {
        const data = await response.json();
        setUserActionMessage(data.error || 'Failed to update user role');
        setTimeout(() => setUserActionMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      setUserActionMessage('Error updating user role');
      setTimeout(() => setUserActionMessage(''), 3000);
    }
  };


  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: SettingsIcon },
    ...(currentUserRole === 'admin' ? [{ id: 'admin', label: 'User Management', icon: Users }] : []),
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ settings })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setSaveMessage('Settings saved successfully!');
        
        // Dispatch custom event to notify other components about profile update
        if (data.settings?.profile?.avatar) {
          window.dispatchEvent(new CustomEvent('profileUpdated', {
            detail: { avatarUrl: data.settings.profile.avatar }
          }));
        }
      } else {
        setSaveMessage('Error saving settings. Please try again.');
      }
      
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearData = async () => {
    try {
      const response = await fetch('/api/user/clear-data', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        alert('Semua data berhasil dihapus. Anda akan diarahkan ke halaman login.');
        // Clear local storage
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to login after clearing data
        window.location.href = '/login';
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Gagal menghapus data. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Terjadi kesalahan saat menghapus data.');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        // Clear any local storage or session data
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to login
        window.location.href = '/login';
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Gagal logout. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Terjadi kesalahan saat logout.');
    }
  };

  const updateSettings = (section: keyof UserSettings, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateNestedSettings = (section: keyof UserSettings, subsection: string, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...(prev[section] as unknown as Record<string, Record<string, string | boolean>>)[subsection],
          [field]: value
        }
      }
    }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setPasswordChangeMessage('');
    setPasswordChangeError('');
    
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordChangeError('All password fields are required');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordChangeError('New password must be at least 6 characters long');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordChangeError('New passwords do not match');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPasswordChangeMessage('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Clear success message after 3 seconds
        setTimeout(() => setPasswordChangeMessage(''), 3000);
      } else {
        setPasswordChangeError(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordChangeError('An error occurred while changing password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Create a preview URL for immediate feedback
        const previewUrl = URL.createObjectURL(file);
        updateSettings('profile', 'avatar', previewUrl);
        
        // Upload to server
        const formData = new FormData();
        formData.append('avatar', file);
        
        const response = await fetch('/api/user/avatar', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          updateSettings('profile', 'avatar', data.avatarUrl);
          setSaveMessage('Avatar updated successfully!');
          setTimeout(() => setSaveMessage(''), 3000);
          
          // Dispatch custom event to notify other components
          window.dispatchEvent(new CustomEvent('profileUpdated', {
            detail: { avatarUrl: data.avatarUrl }
          }));
        } else {
          // Revert to original avatar on error
          loadSettings();
          setSaveMessage('Error uploading avatar. Please try again.');
          setTimeout(() => setSaveMessage(''), 3000);
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
        loadSettings();
        setSaveMessage('Error uploading avatar. Please try again.');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    }
  };

  const renderProfileTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Avatar Section */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Image
            src={settings.profile.avatar || '/api/placeholder/150/150'}
            alt="Profile"
            width={128}
            height={128}
            className="w-32 h-32 rounded-full object-cover border-4 shadow-lg"
            style={{ borderColor: 'var(--neuro-bg)' }}
          />
          <label className="absolute bottom-0 right-0 neuro-button-orange p-2 rounded-full cursor-pointer">
            <Camera className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold font-inter" style={{ color: 'var(--neuro-text-primary)' }}>Profile Photo</h3>
          <p className="text-sm font-inter" style={{ color: 'var(--neuro-text-secondary)' }}>Click the camera icon to change your profile photo</p>
        </div>
      </div>


    </motion.div>
  );

  const renderPreferencesTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >

      {/* Notification Settings */}
      <div>
        <h3 className="text-lg font-semibold font-inter mb-4 flex items-center" style={{ color: 'var(--neuro-text-primary)' }}>
          <Bell className="h-5 w-5 mr-2" style={{ color: 'var(--neuro-orange)' }} />
          Notifications
        </h3>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
            { key: 'push', label: 'Push Notifications', description: 'Receive push notifications in browser' },
            { key: 'sms', label: 'SMS Notifications', description: 'Receive notifications via SMS' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 neuro-card rounded-lg">
              <div>
                <p className="font-medium font-inter" style={{ color: 'var(--neuro-text-primary)' }}>{label}</p>
                <p className="text-sm font-inter" style={{ color: 'var(--neuro-text-secondary)' }}>{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.preferences.notifications[key as keyof typeof settings.preferences.notifications]}
                  onChange={(e) => updateNestedSettings('preferences', 'notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{ backgroundColor: 'var(--neuro-bg-secondary)' }}></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Language & Timezone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium font-inter mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
            Language
          </label>
          <select
            value={settings.preferences.language}
            onChange={(e) => updateSettings('preferences', 'language', e.target.value)}
            className="neuro-select w-full"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="id">Indonesian</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium font-inter mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
            Timezone
          </label>
          <select
            value={settings.preferences.timezone}
            onChange={(e) => updateSettings('preferences', 'timezone', e.target.value)}
            className="neuro-select w-full"
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Asia/Jakarta">Western Indonesia Time (WIB)</option>
          </select>
        </div>
      </div>
    </motion.div>
  );



  const renderSecurityTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold font-inter mb-4 flex items-center" style={{ color: 'var(--neuro-text-primary)' }}>
          <Key className="h-5 w-5 mr-2" style={{ color: 'var(--neuro-orange)' }} />
          Change Password
        </h3>
        
        {/* Password Change Messages */}
        {passwordChangeMessage && (
          <div className="mb-4 p-4 neuro-card" style={{ backgroundColor: 'var(--neuro-success-bg)', borderColor: 'var(--neuro-success)' }}>
            <p className="font-inter font-medium" style={{ color: 'var(--neuro-success)' }}>{passwordChangeMessage}</p>
          </div>
        )}

        {passwordChangeError && (
          <div className="mb-4 p-4 neuro-card" style={{ backgroundColor: 'var(--neuro-error-bg)', borderColor: 'var(--neuro-error)' }}>
            <p className="font-inter font-medium" style={{ color: 'var(--neuro-error)' }}>{passwordChangeError}</p>
          </div>
        )}
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium font-inter mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="neuro-input w-full pr-12"
                placeholder="Enter your current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-3 transition-colors duration-200" 
                style={{ color: 'var(--neuro-text-secondary)' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--neuro-orange)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--neuro-text-secondary)'}
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium font-inter mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="neuro-input w-full pr-12"
                placeholder="Enter your new password (min. 6 characters)"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3 transition-colors duration-200" 
                style={{ color: 'var(--neuro-text-secondary)' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--neuro-orange)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--neuro-text-secondary)'}
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium font-inter mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="neuro-input w-full pr-12"
                placeholder="Confirm your new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 transition-colors duration-200" 
                style={{ color: 'var(--neuro-text-secondary)' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--neuro-orange)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'var(--neuro-text-secondary)'}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button 
            type="submit"
            disabled={isChangingPassword}
            className={`neuro-button-orange font-inter ${
              isChangingPassword
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {isChangingPassword ? (
              <>
                <div className="loading-spinner inline-block mr-2 w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--neuro-orange)', borderTopColor: 'transparent' }}></div>
                Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold font-inter mb-4 flex items-center" style={{ color: 'var(--neuro-text-primary)' }}>
          <Shield className="h-5 w-5 mr-2" style={{ color: 'var(--neuro-orange)' }} />
          Two-Factor Authentication
        </h3>
        <div className="neuro-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium font-inter" style={{ color: 'var(--neuro-text-primary)' }}>Enable 2FA</p>
              <p className="text-sm font-inter" style={{ color: 'var(--neuro-text-secondary)' }}>Add an extra layer of security to your account</p>
            </div>
            <button className="neuro-button-orange font-inter">
              Enable
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSystemTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div>
        <h3 className="text-lg font-semibold font-inter mb-4 flex items-center" style={{ color: 'var(--neuro-text-primary)' }}>
          <Trash2 className="h-5 w-5 mr-2" style={{ color: 'var(--neuro-error)' }} />
          Bersihkan Data
        </h3>
        <div className="neuro-card p-6" style={{ backgroundColor: 'var(--neuro-error-bg)', borderColor: 'var(--neuro-error)' }}>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Trash2 className="h-6 w-6" style={{ color: 'var(--neuro-error)' }} />
            </div>
            <div className="flex-1">
              <h4 className="font-medium font-inter mb-2" style={{ color: 'var(--neuro-error)' }}>Hapus Semua Data</h4>
              <p className="text-sm font-inter mb-4" style={{ color: 'var(--neuro-error)' }}>
                Tindakan ini akan menghapus semua data Anda dari database termasuk proyek, pengaturan, dan informasi profil. 
                <strong>Tindakan ini tidak dapat dibatalkan.</strong>
              </p>
              <button 
                onClick={() => setDeleteDataModal(true)}
                className="neuro-button font-inter flex items-center space-x-2"
                style={{ backgroundColor: 'var(--neuro-error)', color: 'white' }}
              >
                <Trash2 className="h-4 w-4" />
                <span>Hapus Semua Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold font-inter mb-4 flex items-center" style={{ color: 'var(--neuro-text-primary)' }}>
          <LogOut className="h-5 w-5 mr-2" style={{ color: 'var(--neuro-orange)' }} />
          Keluar Akun
        </h3>
        <div className="neuro-card p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <LogOut className="h-6 w-6" style={{ color: 'var(--neuro-text-secondary)' }} />
            </div>
            <div className="flex-1">
              <h4 className="font-medium font-inter mb-2" style={{ color: 'var(--neuro-text-primary)' }}>Logout</h4>
              <p className="text-sm font-inter mb-4" style={{ color: 'var(--neuro-text-secondary)' }}>
                Keluar dari akun Anda dan kembali ke halaman login.
              </p>
              <button 
                onClick={handleLogout}
                className="neuro-button font-inter flex items-center space-x-2"
                style={{ backgroundColor: 'var(--neuro-text-secondary)', color: 'white' }}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
  
  const renderAdminTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold font-inter mb-4 flex items-center" style={{ color: 'var(--neuro-text-primary)' }}>
          <Users className="h-5 w-5 mr-2" style={{ color: 'var(--neuro-orange)' }} />
          User Management
        </h3>
        
        {/* Action Messages */}
        {userActionMessage && (
          <div className="mb-4 p-4 neuro-card" style={{ 
            backgroundColor: userActionMessage.includes('Error') || userActionMessage.includes('Failed') 
              ? 'var(--neuro-error-bg)' 
              : 'var(--neuro-success-bg)', 
            borderColor: userActionMessage.includes('Error') || userActionMessage.includes('Failed') 
              ? 'var(--neuro-error)' 
              : 'var(--neuro-success)' 
          }}>
            <p className="font-inter font-medium" style={{ 
              color: userActionMessage.includes('Error') || userActionMessage.includes('Failed') 
                ? 'var(--neuro-error)' 
                : 'var(--neuro-success)' 
            }}>
              {userActionMessage}
            </p>
          </div>
        )}
        
        {/* Users List */}
        <div className="neuro-card p-6">
          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--neuro-orange)' }}></div>
            </div>
          ) : (
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-center font-inter" style={{ color: 'var(--neuro-text-secondary)' }}>
                  No users found
                </p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 neuro-card rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--neuro-orange)' }}>
                          <User className="h-5 w-5" style={{ color: 'white' }} />
                        </div>
                        <div>
                          <p className="font-medium font-inter" style={{ color: 'var(--neuro-text-primary)' }}>
                            {user.username}
                          </p>
                          <p className="text-sm font-inter" style={{ color: 'var(--neuro-text-secondary)' }}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {user.role === 'admin' && (
                          <Crown className="h-4 w-4" style={{ color: 'var(--neuro-orange)' }} />
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium font-inter ${
                          user.role === 'admin' 
                            ? 'text-orange-600 bg-orange-100' 
                            : 'text-blue-600 bg-blue-100'
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="text-sm font-inter" style={{ color: 'var(--neuro-text-secondary)' }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowEditModal(true);
                          }}
                          className="p-2 neuro-button-orange rounded-lg transition-all duration-200"
                          title="Edit Role"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 rounded-lg transition-all duration-200"
                          style={{ 
                            backgroundColor: 'var(--neuro-error-bg)',
                            color: 'var(--neuro-error)',
                            border: '1px solid var(--neuro-error)'
                          }}
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Edit User Role Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="neuro-card p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold font-inter mb-4" style={{ color: 'var(--neuro-text-primary)' }}>
              Edit User Role
            </h3>
            
            <div className="mb-4">
              <p className="font-inter mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
                User: <strong>{editingUser.username}</strong>
              </p>
              <p className="text-sm font-inter mb-4" style={{ color: 'var(--neuro-text-secondary)' }}>
                {editingUser.email}
              </p>
              
              <label className="block text-sm font-medium font-inter mb-2" style={{ color: 'var(--neuro-text-primary)' }}>
                Role
              </label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as 'user' | 'admin' })}
                className="neuro-select w-full"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="px-4 py-2 neuro-card rounded-lg font-inter transition-all duration-200"
                style={{ color: 'var(--neuro-text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateUserRole(editingUser.id, editingUser.role)}
                className="px-4 py-2 neuro-button-orange rounded-lg font-inter"
              >
                Update Role
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'preferences':
        return renderPreferencesTab();
      case 'security':
        return renderSecurityTab();
      case 'system':
        return renderSystemTab();
      case 'admin':
        return renderAdminTab();
      default:
        return renderProfileTab();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--neuro-orange)' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-inter" style={{ color: 'var(--neuro-text-primary)' }}>Settings</h1>
        <p className="font-inter mt-1" style={{ color: 'var(--neuro-text-secondary)' }}>Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-300 font-inter ${
                    activeTab === tab.id
                      ? 'neuro-card-pressed'
                      : 'neuro-card hover:neuro-card-hover'
                  }`}
                  style={{
                    color: activeTab === tab.id ? 'var(--neuro-orange)' : 'var(--neuro-text-primary)'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="h-5 w-5 mr-3" style={{
                    color: activeTab === tab.id ? 'var(--neuro-orange)' : 'var(--neuro-text-secondary)'
                  }} />
                  {tab.label}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="neuro-card p-8">
            {renderTabContent()}
            
            {/* Save Button */}
            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--neuro-border)' }}>
              <div className="flex items-center justify-between">
                {saveMessage && (
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-inter"
                    style={{
                      color: saveMessage.includes('Error') ? 'var(--neuro-error)' : 'var(--neuro-success)'
                    }}
                  >
                    {saveMessage}
                  </motion.p>
                )}
                <motion.button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="neuro-button-orange px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ml-auto font-inter"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Data Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteDataModal}
        onClose={() => setDeleteDataModal(false)}
        onConfirm={() => {
          handleClearData();
          setDeleteDataModal(false);
        }}
        title="Hapus Semua Data"
        message="Apakah Anda yakin ingin menghapus semua data? Tindakan ini akan menghapus semua proyek, pengaturan, dan informasi profil Anda dari database. Tindakan ini tidak dapat dibatalkan!"
        confirmText="Hapus Semua Data"
        cancelText="Batal"
      />

      {/* Delete User Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteUser}
        onConfirm={confirmDeleteUser}
        title="Hapus Pengguna"
        message={`Apakah Anda yakin ingin menghapus pengguna "${userToDelete?.username}"? Tindakan ini akan menghapus semua data terkait pengguna termasuk proyek dan notifikasi. Tindakan ini tidak dapat dibatalkan!`}
        confirmText="Hapus Pengguna"
        cancelText="Batal"
      />
    </div>
  );
}