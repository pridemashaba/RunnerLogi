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
    } finally {
      setSaving(false);
    }
  };

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
      showNotification('New passwords do not match', 'error');
      return;
    }

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
                      />
                    </div>
                  )}
                </div>
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
    </div>
  );
}
