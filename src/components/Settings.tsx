'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Settings as SettingsIcon
} from 'lucide-react';

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

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  
  // Load settings from API on component mount
  useEffect(() => {
    loadSettings();
  }, []);
  
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System', icon: SettingsIcon },
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
          <img
            src={settings.profile.avatar}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors cursor-pointer">
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
          <h3 className="text-lg font-semibold text-gray-900">Profile Photo</h3>
          <p className="text-sm text-gray-600">Click the camera icon to change your profile photo</p>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Notifications
        </h3>
        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
            { key: 'push', label: 'Push Notifications', description: 'Receive push notifications in browser' },
            { key: 'sms', label: 'SMS Notifications', description: 'Receive notifications via SMS' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.preferences.notifications[key as keyof typeof settings.preferences.notifications]}
                  onChange={(e) => updateNestedSettings('preferences', 'notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Language & Timezone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={settings.preferences.language}
            onChange={(e) => updateSettings('preferences', 'language', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="id">Indonesian</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.preferences.timezone}
            onChange={(e) => updateSettings('preferences', 'timezone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Key className="h-5 w-5 mr-2" />
          Change Password
        </h3>
        
        {/* Password Change Messages */}
        {passwordChangeMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">{passwordChangeMessage}</p>
          </div>
        )}

        {passwordChangeError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">{passwordChangeError}</p>
          </div>
        )}
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-ring"
                placeholder="Enter your current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-ring"
                placeholder="Enter your new password (min. 6 characters)"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus-ring"
                placeholder="Confirm your new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <button 
            type="submit"
            disabled={isChangingPassword}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 btn-animate focus-ring ${
              isChangingPassword
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white`}
          >
            {isChangingPassword ? (
              <>
                <div className="loading-spinner inline-block mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Two-Factor Authentication
        </h3>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable 2FA</p>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Trash2 className="h-5 w-5 mr-2" />
          Bersihkan Data
        </h3>
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-red-900 mb-2">Hapus Semua Data</h4>
              <p className="text-sm text-red-700 mb-4">
                Tindakan ini akan menghapus semua data Anda dari database termasuk proyek, pengaturan, dan informasi profil. 
                <strong>Tindakan ini tidak dapat dibatalkan.</strong>
              </p>
              <button 
                onClick={() => {
                  if (window.confirm('Apakah Anda yakin ingin menghapus semua data? Tindakan ini tidak dapat dibatalkan!')) {
                    handleClearData();
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Hapus Semua Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <LogOut className="h-5 w-5 mr-2" />
          Keluar Akun
        </h3>
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <LogOut className="h-6 w-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">Logout</h4>
              <p className="text-sm text-gray-600 mb-4">
                Keluar dari akun Anda dan kembali ke halaman login.
              </p>
              <button 
                onClick={handleLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
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
      default:
        return renderProfileTab();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
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
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {renderTabContent()}
            
            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                {saveMessage && (
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-sm ${
                      saveMessage.includes('Error') ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {saveMessage}
                  </motion.p>
                )}
                <motion.button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors ml-auto"
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
    </div>
  );
}