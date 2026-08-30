'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Settings as SettingsIcon,
  Users,
  Edit,
  Crown,
  Palette,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  Mail,
  Sparkles,
  Lock
} from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useTheme } from '@/contexts/ThemeContext';

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
    theme?: 'default' | 'clean' | 'white-minimalist';
  };
}

interface CurrentUser {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export default function Settings() {
  const { currentTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [deleteDataModal, setDeleteDataModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  
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
      timezone: 'Asia/Jakarta',
      theme: currentTheme
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
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

  useEffect(() => {
    loadSettings();
    loadCurrentUser();
  }, []);
  
  useEffect(() => {
    if (activeTab === 'admin' && currentUser?.role === 'admin') {
      loadUsers();
    }
  }, [activeTab, currentUser]);
  
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        theme: currentTheme
      }
    }));
  }, [currentTheme]);
  
  const loadCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user || null);
      }
    } catch (error) {
      console.error('Error checking user info:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
          if (data.settings?.preferences?.theme) {
            setTheme(data.settings.preferences.theme);
          }
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
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
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUserActionMessage('Gagal memuat daftar pengguna');
      setTimeout(() => setUserActionMessage(''), 3000);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error(e);
    } finally {
      window.location.href = '/login';
    }
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

  const updateSettings = (section: keyof UserSettings, field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
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
        setSaveMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' });
        
        if (data.settings?.profile?.avatar) {
          window.dispatchEvent(new CustomEvent('profileUpdated', {
            detail: { avatarUrl: data.settings.profile.avatar }
          }));
        }
      } else {
        setSaveMessage({ type: 'error', text: 'Gagal menyimpan pengaturan. Silakan coba lagi.' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3500);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeMessage('');
    setPasswordChangeError('');
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordChangeError('Semua kolom password wajib diisi');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordChangeError('Password baru minimal harus 6 karakter');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordChangeError('Konfirmasi password tidak cocok');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPasswordChangeMessage('Password berhasil diperbarui! Silakan gunakan password baru ini saat login.');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setPasswordChangeMessage(''), 5000);
      } else {
        setPasswordChangeError(data.error || 'Gagal mengubah password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordChangeError('Terjadi kesalahan saat memproses password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSaveMessage({ type: 'error', text: 'Ukuran gambar maksimal 5MB' });
        setTimeout(() => setSaveMessage(null), 4000);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target?.result as string;
        if (base64Data) {
          updateSettings('profile', 'avatar', base64Data);
        }
      };
      reader.readAsDataURL(file);

      try {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch('/api/user/avatar', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.avatarUrl) {
            updateSettings('profile', 'avatar', data.avatarUrl);
            setSaveMessage({ type: 'success', text: 'Foto profil berhasil diperbarui!' });
            window.dispatchEvent(new CustomEvent('profileUpdated', {
              detail: { avatarUrl: data.avatarUrl }
            }));
          }
        }
      } catch (err) {
        console.error('Error uploading avatar:', err);
      } finally {
        setTimeout(() => setSaveMessage(null), 4000);
      }
    }
  };

  const handleClearData = async () => {
    try {
      const response = await fetch('/api/user/clear-data', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Gagal menghapus data.');
      }
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Terjadi kesalahan saat menghapus data.');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil & Akun', icon: User },
    { id: 'security', label: 'Keamanan & Password', icon: Shield },
    { id: 'preferences', label: 'Preferensi', icon: Bell },
    { id: 'appearance', label: 'Tampilan', icon: Palette },
    { id: 'system', label: 'Sistem & Data', icon: SettingsIcon },
    ...(currentUser?.role === 'admin' ? [{ id: 'admin', label: 'Kelola Pengguna', icon: Users }] : []),
  ];

  // ----------------------------------------------------
  // TAB RENDERING FUNCTIONS (MODERN GRAPHITE STUDIO DESIGN)
  // ----------------------------------------------------

  const renderProfileTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Profile Card */}
      <div className="p-6 rounded-2xl bg-[#181A20] border border-white/5 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative group">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-purple-500/40 p-0.5 bg-[#0B0C0E] shadow-xl">
            <Image
              src={settings.profile.avatar || '/api/placeholder/150/150'}
              alt="Profile"
              width={112}
              height={112}
              className="w-full h-full rounded-[14px] object-cover"
            />
          </div>
          <label className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/50 cursor-pointer transition-transform group-hover:scale-110">
            <Camera className="h-4 w-4" />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="text-xl font-bold text-[#F5F5F5]">
              {currentUser?.username || 'Creative User'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 border border-purple-500/30 text-purple-300 uppercase tracking-wider">
              {currentUser?.role || 'User'}
            </span>
          </div>
          <p className="text-xs text-[#9CA3AF] flex items-center justify-center md:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#6B7280]" />
            {currentUser?.email || 'user@studio.io'}
          </p>
          <p className="text-[11px] text-[#6B7280] pt-1">
            Klik ikon kamera pada foto profil untuk mengunggah avatar baru (Maks. 5MB).
          </p>
        </div>
      </div>

      {/* Account Info Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#181A20] border border-white/5 space-y-1">
          <span className="text-[11px] font-medium text-[#6B7280]">Username</span>
          <div className="text-sm font-semibold text-[#F5F5F5]">{currentUser?.username || '-'}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#181A20] border border-white/5 space-y-1">
          <span className="text-[11px] font-medium text-[#6B7280]">Email Terdaftar</span>
          <div className="text-sm font-semibold text-[#F5F5F5]">{currentUser?.email || '-'}</div>
        </div>
      </div>

      {/* Quick Link to Change Password */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-[#181A20] border border-purple-500/20 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-sm font-bold text-[#F5F5F5] flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-purple-400" />
            Kata Sandi & Keamanan
          </div>
          <p className="text-xs text-[#9CA3AF]">Ingin mengganti password akun Anda?</p>
        </div>
        <button
          onClick={() => setActiveTab('security')}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md"
        >
          Ganti Password
        </button>
      </div>
    </motion.div>
  );

  const renderSecurityTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Change Password Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#181A20] border border-white/5 space-y-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
            <Key className="h-4 w-4 text-purple-400" />
            Ganti Password Akun
          </h3>
          <p className="text-xs text-[#9CA3AF]">
            Pastikan password baru minimal 6 karakter dan gunakan kombinasi yang aman.
          </p>
        </div>

        {/* Alerts */}
        <AnimatePresence>
          {passwordChangeMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordChangeMessage}</span>
            </motion.div>
          )}

          {passwordChangeError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordChangeError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold text-[#D4D4D8] mb-1.5">
              Password Saat Ini
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full pl-3.5 pr-10 py-2.5 bg-[#14161A] border border-white/10 rounded-xl text-sm text-[#F5F5F5] placeholder-[#6B7280] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
                placeholder="Masukkan password saat ini"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#F5F5F5] transition-colors"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-[#D4D4D8] mb-1.5">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full pl-3.5 pr-10 py-2.5 bg-[#14161A] border border-white/10 rounded-xl text-sm text-[#F5F5F5] placeholder-[#6B7280] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
                placeholder="Minimal 6 karakter"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#F5F5F5] transition-colors"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-[#D4D4D8] mb-1.5">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full pl-3.5 pr-10 py-2.5 bg-[#14161A] border border-white/10 rounded-xl text-sm text-[#F5F5F5] placeholder-[#6B7280] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50"
                placeholder="Ulangi password baru"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#F5F5F5] transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isChangingPassword}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
          >
            {isChangingPassword ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memperbarui Password...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Perbarui Password</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Two-Factor & Sessions */}
      <div className="p-6 rounded-2xl bg-[#181A20] border border-white/5 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-400" />
            Autentikasi Dua Faktor (2FA)
          </div>
          <p className="text-xs text-[#9CA3AF]">
            Menambahkan lapisan keamanan ekstra untuk login ke workspace Anda.
          </p>
        </div>
        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-[#9CA3AF]">
          Segera Hadir
        </span>
      </div>
    </motion.div>
  );

  const renderPreferencesTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Notifications */}
      <div className="p-6 rounded-2xl bg-[#181A20] border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
          <Bell className="h-4 w-4 text-purple-400" />
          Saluran Notifikasi
        </h3>
        
        <div className="space-y-3">
          {[
            { key: 'email', label: 'Notifikasi Email', desc: 'Terima ringkasan invoice & task via email' },
            { key: 'push', label: 'Push Browser', desc: 'Notifikasi langsung di tab browser realtime' },
            { key: 'sms', label: 'SMS Alert', desc: 'Peringatan deadline kritis via pesan SMS' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-3.5 rounded-xl bg-[#14161A] border border-white/5">
              <div>
                <p className="text-xs font-bold text-[#F5F5F5]">{label}</p>
                <p className="text-[11px] text-[#6B7280]">{desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.preferences.notifications[key as keyof typeof settings.preferences.notifications]}
                  onChange={(e) => updateNestedSettings('preferences', 'notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Language & Timezone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#181A20] border border-white/5 space-y-2">
          <label className="block text-xs font-semibold text-[#D4D4D8]">
            Bahasa Tampilan
          </label>
          <select
            value={settings.preferences.language}
            onChange={(e) => updateSettings('preferences', 'language', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#14161A] border border-white/10 rounded-xl text-xs font-medium text-[#F5F5F5] focus:outline-none focus:border-purple-500"
          >
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English (US)</option>
          </select>
        </div>

        <div className="p-5 rounded-2xl bg-[#181A20] border border-white/5 space-y-2">
          <label className="block text-xs font-semibold text-[#D4D4D8]">
            Zona Waktu
          </label>
          <select
            value={settings.preferences.timezone}
            onChange={(e) => updateSettings('preferences', 'timezone', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#14161A] border border-white/10 rounded-xl text-xs font-medium text-[#F5F5F5] focus:outline-none focus:border-purple-500"
          >
            <option value="Asia/Jakarta">WIB (Jakarta - UTC+7)</option>
            <option value="Asia/Makassar">WITA (Makassar - UTC+8)</option>
            <option value="Asia/Jayapura">WIT (Jayapura - UTC+9)</option>
            <option value="America/New_York">Eastern Time (ET - UTC-5)</option>
          </select>
        </div>
      </div>
    </motion.div>
  );

  const renderAppearanceTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="p-6 rounded-2xl bg-[#181A20] border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
          <Palette className="h-4 w-4 text-purple-400" />
          Pilihan Tema Studio
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Dark Studio OS */}
          <div 
            onClick={() => setTheme('default')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              currentTheme === 'default'
                ? 'bg-purple-600/10 border-purple-500/60 shadow-lg shadow-purple-900/20 ring-1 ring-purple-500/40'
                : 'bg-[#14161A] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-[#F5F5F5]">Dark Studio OS</span>
              {currentTheme === 'default' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
            </div>
            <p className="text-xs text-[#9CA3AF]">
              Tema pitch graphite dengan pendaran aksen ungu violet elegan. (Default)
            </p>
          </div>

          {/* White Minimalist */}
          <div 
            onClick={() => setTheme('white-minimalist')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              currentTheme === 'white-minimalist'
                ? 'bg-purple-600/10 border-purple-500/60 shadow-lg shadow-purple-900/20 ring-1 ring-purple-500/40'
                : 'bg-[#14161A] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-[#F5F5F5]">White Minimalist</span>
              {currentTheme === 'white-minimalist' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
            </div>
            <p className="text-xs text-[#9CA3AF]">
              Ultra-clean white workspace dengan tipografi kontras tinggi & border zinc lembut.
            </p>
          </div>

          {/* Clean Minimal */}
          <div 
            onClick={() => setTheme('clean')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              currentTheme === 'clean'
                ? 'bg-purple-600/10 border-purple-500/60 shadow-lg shadow-purple-900/20 ring-1 ring-purple-500/40'
                : 'bg-[#14161A] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm text-[#F5F5F5]">Clean Minimal</span>
              {currentTheme === 'clean' && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
            </div>
            <p className="text-xs text-[#9CA3AF]">
              Desain minimalis dengan kontras halus dan bayangan lembut.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSystemTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Danger Zone */}
      <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/20 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-bold text-red-300">Pembersihan Data Pribadi</h4>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Tindakan ini akan menghapus seluruh data proyek, tugas, dan histori invoice milik akun Anda. Tindakan ini permanen dan tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setDeleteDataModal(true)}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all"
          >
            Hapus Semua Data Saya
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderAdminTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="p-6 rounded-2xl bg-[#181A20] border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
          <Users className="h-4 w-4 text-purple-400" />
          Daftar Pengguna Sistem
        </h3>

        {isLoadingUsers ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#14161A] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300">
                    {u.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#F5F5F5]">{u.username}</div>
                    <div className="text-[10px] text-[#6B7280]">{u.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    u.role === 'admin' 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                      : 'bg-white/5 text-[#9CA3AF] border border-white/5'
                  }`}>
                    {u.role.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'security':
        return renderSecurityTab();
      case 'preferences':
        return renderPreferencesTab();
      case 'appearance':
        return renderAppearanceTab();
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
      <div className="max-w-5xl mx-auto py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto font-sans pb-12">
      {/* Header */}
      <div className="mb-6 px-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5F5] tracking-tight">Pengaturan</h1>
          <p className="text-xs text-[#9CA3AF] mt-1">Kelola profil akun, keamanan, dan preferensi workspace Anda</p>
        </div>
      </div>

      {/* Mobile Tab Pills (Horizontal Scroll) */}
      <div className="flex lg:hidden overflow-x-auto gap-2 pb-3 mb-4 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                  : 'bg-[#181A20] text-[#9CA3AF] border border-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5 mr-1.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar Navigation */}
        <div className="hidden lg:block lg:w-60 shrink-0">
          <nav className="space-y-1.5 p-2 rounded-2xl bg-[#14161A] border border-white/5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3.5 py-2.5 text-left rounded-xl transition-all duration-150 text-xs font-semibold ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-md'
                      : 'text-[#9CA3AF] hover:text-[#F5F5F5] hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`h-4 w-4 mr-2.5 shrink-0 ${isActive ? 'text-purple-400' : 'text-[#6B7280]'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-white/5 mt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3.5 py-2.5 text-left rounded-xl transition-all duration-150 text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
              >
                <LogOut className="h-4 w-4 mr-2.5 text-red-400 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Content Container */}
        <div className="flex-1 min-w-0">
          <div className="bg-[#14161A] border border-white/10 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
            {renderActiveTabContent()}

            {/* Bottom Save Action Bar */}
            <div className="pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                {saveMessage && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-xs font-medium ${
                      saveMessage.type === 'error' ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {saveMessage.text}
                  </motion.p>
                )}
              </div>
              
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 sm:ml-auto"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
              </button>
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
        message="Apakah Anda yakin ingin menghapus semua data proyek & histori invoice Anda? Tindakan ini tidak dapat dibatalkan!"
        confirmText="Hapus Semua Data"
        cancelText="Batal"
      />
    </div>
  );
}