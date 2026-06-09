'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserProfile, updateUserProfile, isAuthenticated } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    companyName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    website: '',
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      const existingProfile = await fetchUserProfile();
      if (existingProfile) {
        if (!isMounted) return;
        setProfile({
          name: existingProfile.name ?? '',
          phone: existingProfile.phone ?? '',
          companyName: existingProfile.companyName ?? '',
          address: existingProfile.address ?? '',
          city: existingProfile.city ?? '',
          state: existingProfile.state ?? '',
          zipCode: existingProfile.zipCode ?? '',
          country: existingProfile.country ?? '',
          website: existingProfile.website ?? '',
        });
      }
      if (isMounted) {
        setLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const updates: Record<string, string> = {
      name: profile.name,
      phone: profile.phone,
      companyName: profile.companyName,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      zipCode: profile.zipCode,
      country: profile.country,
      website: profile.website,
    };

    const result = await updateUserProfile(updates);
    if (result) {
      setSuccess('Profile updated successfully!');
    } else {
      setError('Failed to update profile');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={profile.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  id="website"
                  type="url"
                  value={profile.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Street Address
                </label>
                <input
                  id="address"
                  type="text"
                  value={profile.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={profile.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State / Province
                </label>
                <input
                  id="state"
                  type="text"
                  value={profile.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                  ZIP / Postal Code
                </label>
                <input
                  id="zipCode"
                  type="text"
                  value={profile.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  value={profile.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
