// components/forms/DeliveryForm.tsx
'use client';

import { useState } from 'react';
import { Delivery, Address, PackageDetails } from '@/types';

interface Props {
  onSubmit: (data: Partial<Delivery>) => void;
  loading: boolean;
}

export function DeliveryForm({ onSubmit, loading }: Props) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    pickupAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    },
    packageDetails: {
      weight: 1,
      dimensions: '10x10x10',
      description: '',
      isFragile: false,
      value: 0,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAddressChange = (type: 'pickup' | 'delivery', field: keyof Address, value: string) => {
    setFormData(prev => ({
      ...prev,
      [`${type}Address`]: {
        ...prev[`${type}Address` as keyof typeof prev] as Address,
        [field]: value,
      },
    }));
  };

  const handlePackageChange = (field: keyof PackageDetails, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      packageDetails: {
        ...prev.packageDetails,
        [field]: value,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Customer Information */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.customerEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.customerPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Pickup Address */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Pickup Address</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Street</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.pickupAddress.street}
              onChange={(e) => handleAddressChange('pickup', 'street', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.pickupAddress.city}
              onChange={(e) => handleAddressChange('pickup', 'city', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.pickupAddress.state}
              onChange={(e) => handleAddressChange('pickup', 'state', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.pickupAddress.zipCode}
              onChange={(e) => handleAddressChange('pickup', 'zipCode', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Street</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.deliveryAddress.street}
              onChange={(e) => handleAddressChange('delivery', 'street', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.deliveryAddress.city}
              onChange={(e) => handleAddressChange('delivery', 'city', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.deliveryAddress.state}
              onChange={(e) => handleAddressChange('delivery', 'state', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.deliveryAddress.zipCode}
              onChange={(e) => handleAddressChange('delivery', 'zipCode', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Package Details */}
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Package Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.packageDetails.weight}
              onChange={(e) => handlePackageChange('weight', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Value ($)</label>
            <input
              type="number"
              step="0.01"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.packageDetails.value}
              onChange={(e) => handlePackageChange('value', parseFloat(e.target.value))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={formData.packageDetails.description}
              onChange={(e) => handlePackageChange('description', e.target.value)}
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                checked={formData.packageDetails.isFragile}
                onChange={(e) => handlePackageChange('isFragile', e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-600">Fragile Item</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
        >
          {loading ? 'Getting Rates...' : 'Get Courier Options'}
        </button>
      </div>
    </form>
  );
}
