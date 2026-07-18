// app/settings/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/types';
import { showNotification } from '@/services/notificationService';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'business' | 'addresses' | 'api'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

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
  }, []);

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
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }

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
                      />
                    </div>
                  )}
                </div>
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
                <p className="text-sm mt-2">Click Generate New Key to create your first API key</p>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.apiKeys.map((key) => (
                  <div key={key.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-mono text-sm">{key.key}</p>
                      <p className="text-xs text-gray-500">Created just now</p>
                    </div>
                    <button
                      onClick={() => revokeApiKey(key.key)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
