<<<<<<< HEAD
'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Save, User, Bell, Shield, Palette, X } from 'lucide-react';
import { fetchUserProfile, getUser, updateUserProfile } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import { showNotification } from '@/services/notificationService';

type SettingsTab = 'profile' | 'notifications' | 'appearance' | 'security';
type ThemeMode = 'light' | 'dark' | 'system';

interface SettingsTabItem {
  id: SettingsTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

interface ProfileState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface NotificationState {
  email: boolean;
  push: boolean;
  weeklyDigest: boolean;
  marketing: boolean;
}

type ColorKey = keyof ThemeColors;

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

const defaultProfile: ProfileState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

const defaultNotifications: NotificationState = {
  email: true,
  push: true,
  weeklyDigest: false,
  marketing: false,
};

const defaultThemeMode: ThemeMode = 'light';

const lightTheme: ThemeColors = {
  primary: '#3b82f6',
  secondary: '#6b7280',
  accent: '#8b5cf6',
  background: '#ffffff',
  surface: '#f3f4f6',
  text: '#111827',
};

const darkTheme: ThemeColors = {
  primary: '#60a5fa',
  secondary: '#94a3b8',
  accent: '#a78bfa',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f8fafc',
};

function getStoredNotifications(): NotificationState {
  if (typeof window === 'undefined') return defaultNotifications;

  try {
    const saved = window.localStorage.getItem('runnerlogi.notifications');
    if (!saved) return defaultNotifications;

    const parsed = JSON.parse(saved) as Partial<NotificationState>;
    if (!parsed || typeof parsed !== 'object') return defaultNotifications;

    return { ...defaultNotifications, ...parsed };
  } catch {
    return defaultNotifications;
  }
}

function getStoredThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return defaultThemeMode;

  const saved = window.localStorage.getItem('runnerlogi.themeMode');
  return saved === 'dark' || saved === 'system' ? saved : 'light';
}

function getStoredCustomTheme(): ThemeColors | null {
  if (typeof window === 'undefined') return null;

  try {
    const saved = window.localStorage.getItem('runnerlogi.customTheme');
    if (!saved) return null;

    const parsed = JSON.parse(saved) as Partial<ThemeColors>;
    if (!parsed || typeof parsed !== 'object') return null;

    return { ...lightTheme, ...parsed };
  } catch {
    return null;
  }
}

function getStoredTwoFactorEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem('runnerlogi.twoFactorEnabled') === 'true';
}

function applyTheme(mode: ThemeMode, customColors: ThemeColors | null = null) {
  if (typeof document === 'undefined') return;

  const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const baseTheme = mode === 'dark' || (mode === 'system' && prefersDark) ? darkTheme : lightTheme;
  const theme = customColors ? { ...baseTheme, ...customColors } : baseTheme;
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-secondary', theme.secondary);
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-background', theme.background);
  root.style.setProperty('--color-surface', theme.surface);
  root.style.setProperty('--color-text', theme.text);
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [profile, setProfile] = useState<ProfileState>(defaultProfile);
  const [notifications, setNotifications] = useState<NotificationState>(getStoredNotifications);
  const [themeMode, setThemeMode] = useState<ThemeMode>(getStoredThemeMode);
  const [customTheme, setCustomTheme] = useState<ThemeColors | null>(getStoredCustomTheme);
  const [selectedColor, setSelectedColor] = useState<ColorKey>('primary');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(getStoredTwoFactorEnabled);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    applyTheme(themeMode, customTheme);
  }, [themeMode, customTheme]);

  const tabs: SettingsTabItem[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const colorLabels: Record<ColorKey, string> = {
    primary: 'Primary',
    secondary: 'Secondary',
    accent: 'Accent',
    background: 'Background',
    surface: 'Surface',
    text: 'Text',
  };

  const handleTabChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    if (tab === 'profile') {
      void loadProfile();
    }
  };

  const loadProfile = async () => {
    if (profileLoaded) return;

    setProfileError('');

    try {
      const user = await getUser();
      const profileData = await fetchUserProfile();

      if (user) {
        const nameParts = user.name.split(' ');
        setProfile({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: user.email,
          phone: (user as { phone?: string }).phone || profileData?.phone || '',
        });
      } else if (profileData) {
        const nameParts = String(profileData.name || '').split(' ');
        setProfile({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: String(profileData.email || ''),
          phone: String(profileData.phone || ''),
        });
      }
    } catch {
      setProfileError('Unable to load profile settings. You can still update Appearance and Notifications.');
    } finally {
      setProfileLoaded(true);
    }
  };

  const updateProfileField = (field: keyof ProfileState, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const updateNotification = (field: keyof NotificationState) => {
    setNotifications((current) => ({ ...current, [field]: !current[field] }));
  };

  const updateThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    window.localStorage.setItem('runnerlogi.themeMode', mode);
    applyTheme(mode, customTheme);
  };

  const updateCustomColor = (key: ColorKey, color: string) => {
    setCustomTheme((current) => {
      const updated = { ...(current || lightTheme), [key]: color };
      window.localStorage.setItem('runnerlogi.customTheme', JSON.stringify(updated));
      applyTheme(themeMode, updated);
      return updated;
    });
  };

  const resetCustomColors = () => {
    setCustomTheme(null);
    window.localStorage.removeItem('runnerlogi.customTheme');
    applyTheme(themeMode, null);
  };

  const toggleTwoFactor = () => {
    const enabled = !twoFactorEnabled;
    setTwoFactorEnabled(enabled);
    window.localStorage.setItem('runnerlogi.twoFactorEnabled', String(enabled));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const fullName = `${profile.firstName.trim()} ${profile.lastName.trim()}`.trim();
      const updates: Record<string, unknown> = {};

      if (fullName) updates.name = fullName;
      if (profile.phone.trim()) updates.phone = profile.phone.trim();

      if (Object.keys(updates).length > 0) {
        await updateUserProfile(updates);
      }

      window.localStorage.setItem('runnerlogi.notifications', JSON.stringify(notifications));
      window.localStorage.setItem('runnerlogi.themeMode', themeMode);
      if (customTheme) {
        window.localStorage.setItem('runnerlogi.customTheme', JSON.stringify(customTheme));
      }
      window.localStorage.setItem('runnerlogi.twoFactorEnabled', String(twoFactorEnabled));
      applyTheme(themeMode, customTheme);

      showNotification('Settings saved successfully', 'success');
    } catch {
      showNotification('Failed to save settings', 'error');
=======
// app/settings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/types';
import { showNotification } from '@/services/notificationService';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'business' | 'addresses' | 'api'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const token = document.cookie.match(/token=([^;]+)/)?.[1];
      if (!token) {
        router.push('/login');
        return;
      }

      // Mock profile data
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockProfile: UserProfile = {
        name: 'John Runner',
        email: 'runner@example.com',
        phone: '+1234567890',
        companyName: 'Speedy Deliveries LLC',
        address: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'US',
        website: 'https://speedy-deliveries.com',
        notificationPreferences: {
          email: true,
          sms: false,
          push: true,
          orderUpdates: true,
          promotions: false,
        },
        businessHours: {
          monday: { enabled: true, start: '09:00', end: '17:00' },
          tuesday: { enabled: true, start: '09:00', end: '17:00' },
          wednesday: { enabled: true, start: '09:00', end: '17:00' },
          thursday: { enabled: true, start: '09:00', end: '17:00' },
          friday: { enabled: true, start: '09:00', end: '17:00' },
          saturday: { enabled: false, start: '10:00', end: '14:00' },
          sunday: { enabled: false, start: '10:00', end: '14:00' },
        },
        defaultAddresses: {
          pickupAddress: 'Warehouse A\n123 Industrial Blvd\nLos Angeles, CA 90001',
          returnAddress: 'Returns Dept\n456 Return Lane\nLos Angeles, CA 90001',
        },
        apiKeys: [],
      };

      setProfile(mockProfile);
    } catch {
      showNotification('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [fetchProfile]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      showNotification('Profile updated successfully', 'success');
    } catch {
      showNotification('Something went wrong', 'error');
>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
    } finally {
      setSaving(false);
    }
  };

<<<<<<< HEAD
  const handleCancel = () => {
    setProfile(defaultProfile);
    setNotifications(getStoredNotifications());
    setThemeMode(getStoredThemeMode());
    const storedCustomTheme = getStoredCustomTheme();
    setCustomTheme(storedCustomTheme);
    setTwoFactorEnabled(getStoredTwoFactorEnabled());
    setShowColorPicker(false);
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    applyTheme(getStoredThemeMode(), storedCustomTheme);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
=======
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
      showNotification('New passwords do not match', 'error');
      return;
    }

<<<<<<< HEAD
    if (passwordForm.newPassword.length < 8) {
      showNotification('Password must be at least 8 characters', 'error');
      return;
    }

    try {
      const client = await getSupabaseClient();
      const { error } = await client.auth.updateUser({ password: passwordForm.newPassword });
      if (error) throw error;

      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showNotification('Password updated successfully', 'success');
    } catch {
      showNotification('Failed to update password', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your account preferences and application settings</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  <p className="text-sm text-gray-500 mt-1">Update your personal details and public profile</p>
                  {profileError && <p className="text-sm text-red-600 mt-2">{profileError}</p>}
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={profile.firstName}
                      onChange={(event) => updateProfileField('firstName', event.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={profile.lastName}
                      onChange={(event) => updateProfileField('lastName', event.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Doe"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profile.email}
                      onChange={(event) => updateProfileField('email', event.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="john.doe@example.com"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={profile.phone}
                      onChange={(event) => updateProfileField('phone', event.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="+1 555 000 0000"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                  <p className="text-sm text-gray-500 mt-1">Choose how you want to receive updates</p>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Email notifications', description: 'Receive updates via email', key: 'email' },
                    { label: 'Push notifications', description: 'Get real-time alerts in your browser', key: 'push' },
                    { label: 'Weekly digest', description: 'Summary of weekly activities', key: 'weeklyDigest' },
                    { label: 'Marketing emails', description: 'Product updates and promotions', key: 'marketing' },
                  ].map((item) => {
                    const enabled = notifications[item.key as keyof NotificationState];

                    return (
                      <div key={item.label} className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{item.label}</h3>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateNotification(item.key as keyof NotificationState)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            enabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                          role="switch"
                          aria-checked={enabled}
                        >
                          <span className="sr-only">Toggle {item.label}</span>
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
                  <p className="text-sm text-gray-500 mt-1">Customize how the application looks</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                  <div className="flex gap-4">
                    {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updateThemeMode(mode)}
                        className={`px-4 py-2 rounded-md border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          themeMode === mode
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">Custom Colors</label>
                    {customTheme && (
                      <button
                        type="button"
                        onClick={resetCustomColors}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Reset Colors
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(Object.keys(lightTheme) as ColorKey[]).map((key) => {
                      const activeTheme = customTheme ? { ...lightTheme, ...customTheme } : lightTheme;
                      const value = activeTheme[key];

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setSelectedColor(key);
                            setShowColorPicker(true);
                          }}
                          className="flex items-center justify-between p-3 rounded-lg border transition-all hover:opacity-90"
                          style={{
                            backgroundColor: selectedColor === key ? `${value}20` : 'white',
                            borderColor: value,
                          }}
                        >
                          <span className="text-sm font-medium text-gray-900">{colorLabels[key]}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-500">{value}</span>
                            <span className="w-8 h-8 rounded-full border-2 border-gray-300" style={{ backgroundColor: value }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {showColorPicker && (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Pick {colorLabels[selectedColor].toLowerCase()} color
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowColorPicker(false)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Close
                        </button>
                      </div>
                      <HexColorPicker
                        color={customTheme?.[selectedColor] || lightTheme[selectedColor]}
                        onChange={(color) => updateCustomColor(selectedColor, color)}
                        style={{ width: '100%', height: '220px' }}
=======
    if (newPassword.length < 6) {
      showNotification('Password must be at least 6 characters', 'error');
      return;
    }

    setSaving(true);

    try {
      showNotification('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      showNotification('Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setSaving(true);

    try {
      showNotification('Notification preferences updated', 'success');
    } catch {
      showNotification('Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  };

  const generateApiKey = async () => {
    try {
      const newKey = {
        key: `rk_${Math.random().toString(36).substring(2, 15)}`,
        secret: `sk_${Math.random().toString(36).substring(2, 40)}`,
      };

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              apiKeys: [...prev.apiKeys, newKey],
            }
          : null
      );
      showNotification('New API key generated', 'success');
    } catch {
      showNotification('Failed to generate API key', 'error');
    }
  };

  const revokeApiKey = async (keyId: string) => {
    if (!confirm('Revoking this API key will break any integrations using it. Continue?')) return;

    try {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              apiKeys: prev.apiKeys.filter((k) => k.key !== keyId),
            }
          : null
      );
      showNotification('API key revoked', 'success');
    } catch {
      showNotification('Failed to revoke API key', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600">Manage your account preferences and configuration</p>
        </div>

        {/* Settings Navigation */}
        <div className="flex space-x-4 mb-8 border-b">
          {(['profile', 'notifications', 'business', 'addresses', 'api'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-b-2 border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl space-y-6">
            <form onSubmit={handleProfileUpdate} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact support for assistance.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company/Business Name</label>
                  <input
                    type="text"
                    value={profile.companyName}
                    onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://your-website.com"
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            <form onSubmit={handlePasswordChange} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Channels</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive updates via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.email}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: { ...profile.notificationPreferences, email: e.target.checked },
                        })
                      }
                      className="toggle-switch"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-500">Receive text message updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.sms}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: { ...profile.notificationPreferences, sms: e.target.checked },
                        })
                      }
                      className="toggle-switch"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-500">Browser push notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.push}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: { ...profile.notificationPreferences, push: e.target.checked },
                        })
                      }
                      className="toggle-switch"
                    />
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Events</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order Updates</p>
                      <p className="text-sm text-gray-500">Status changes, delivery confirmations</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.orderUpdates}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: { ...profile.notificationPreferences, orderUpdates: e.target.checked },
                        })
                      }
                      className="toggle-switch"
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Promotions & Updates</p>
                      <p className="text-sm text-gray-500">Special offers, product updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profile.notificationPreferences.promotions}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          notificationPreferences: { ...profile.notificationPreferences, promotions: e.target.checked },
                        })
                      }
                      className="toggle-switch"
                    />
                  </label>
                </div>
              </div>

              <button
                onClick={handleNotificationUpdate}
                disabled={saving}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}

        {/* Business Hours Tab */}
        {activeTab === 'business' && (
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
            <p className="text-sm text-gray-500 mb-6">Set your operating hours for pickup and delivery services</p>
            <div className="space-y-4">
              {Object.entries(profile.businessHours).map(([day, hours]) => (
                <div key={day} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-32">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={hours.enabled}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            businessHours: {
                              ...profile.businessHours,
                              [day]: { ...hours, enabled: e.target.checked },
                            },
                          })
                        }
                        className="rounded border-gray-300 text-indigo-600"
                      />
                      <span className="font-medium capitalize">{day}</span>
                    </label>
                  </div>
                  {hours.enabled && (
                    <div className="flex space-x-2 flex-1">
                      <input
                        type="time"
                        value={hours.start}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            businessHours: {
                              ...profile.businessHours,
                              [day]: { ...hours, start: e.target.value },
                            },
                          })
                        }
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <span className="self-center">to</span>
                      <input
                        type="time"
                        value={hours.end}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            businessHours: {
                              ...profile.businessHours,
                              [day]: { ...hours, end: e.target.value },
                            },
                          })
                        }
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
                      />
                    </div>
                  )}
                </div>
<<<<<<< HEAD
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage your account security</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Password</h3>
                      <p className="text-sm text-gray-500">Update your account password</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Change
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <button
                      onClick={toggleTwoFactor}
                      className={`text-sm font-medium ${
                        twoFactorEnabled ? 'text-green-600 hover:text-green-700' : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      {twoFactorEnabled ? 'Enabled' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm new password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleChangePassword}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
=======
              ))}
            </div>
            <button
              onClick={handleProfileUpdate}
              disabled={saving}
              className="mt-6 w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Business Hours'}
            </button>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Default Addresses</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Pickup Address</label>
                <textarea
                  rows={3}
                  value={profile.defaultAddresses.pickupAddress}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      defaultAddresses: { ...profile.defaultAddresses, pickupAddress: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Your default warehouse or pickup location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Return Address</label>
                <textarea
                  rows={3}
                  value={profile.defaultAddresses.returnAddress}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      defaultAddresses: { ...profile.defaultAddresses, returnAddress: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Where undeliverable packages should be returned"
                />
              </div>
              <button
                onClick={handleProfileUpdate}
                disabled={saving}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Addresses'}
              </button>
            </div>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'api' && (
          <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">API Keys</h3>
              <button
                onClick={generateApiKey}
                className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700"
              >
                Generate New Key
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              API keys allow third-party applications to access our platform on your behalf. Keep your keys secure and never
              share them publicly.
            </p>

            {profile.apiKeys.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No API keys generated yet</p>
                <p className="text-sm mt-2">Click &quot;Generate New Key&quot; to create your first API key</p>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.apiKeys.map((apiKey, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-mono text-sm bg-gray-100 p-2 rounded">{apiKey.key}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Secret: {apiKey.secret.substring(0, 10)}... (shown only once)
                        </p>
                      </div>
                      <button
                        onClick={() => revokeApiKey(apiKey.key)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Important: Your API secret is only shown once when generated. Make sure to store it securely.
              </p>
            </div>
          </div>
        )}
      </div>
>>>>>>> 3e26547132126c075e46fffc19579da740bdea12
    </div>
  );
}
