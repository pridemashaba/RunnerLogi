'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Delivery } from '@/types';
import { deliveriesAPI } from '@/lib/api';
import { showNotification } from '@/services/notificationService';
import { format } from 'date-fns';

export default function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    const fetchDelivery = async () => {
      if (!resolvedParams?.id) return;
      try {
        const response = await deliveriesAPI.getById(resolvedParams.id);
        setDelivery(response.data);
      } catch {
        showNotification('Failed to load delivery', 'error');
        router.push('/deliveries');
      } finally {
        setLoading(false);
      }
    };

    fetchDelivery();
  }, [resolvedParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">Loading delivery...</div>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">Delivery not found.</div>
          <div className="mt-4 text-center">
            <Link href="/deliveries" className="text-blue-600 hover:text-blue-500">
              Back to deliveries
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/deliveries" className="text-sm text-blue-600 hover:text-blue-500">
            ← Back to deliveries
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Delivery Details</h1>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Delivery ID</h3>
                <p className="mt-1 text-sm text-gray-900">{delivery.id}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Tracking Number</h3>
                <p className="mt-1 text-sm text-gray-900">{delivery.trackingNumber || 'N/A'}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer Name</h3>
                <p className="mt-1 text-sm text-gray-900">{delivery.customerName}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer Email</h3>
                <p className="mt-1 text-sm text-gray-900">{delivery.customerEmail}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer Phone</h3>
                <p className="mt-1 text-sm text-gray-900">{delivery.customerPhone}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1 text-sm text-gray-900 capitalize">{delivery.status.replace('_', ' ')}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
                <p className="mt-1 text-sm text-gray-900 capitalize">{delivery.paymentStatus}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Price</h3>
                <p className="mt-1 text-sm text-gray-900">R{delivery.price.toFixed(2)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                <p className="mt-1 text-sm text-gray-900">{format(new Date(delivery.createdAt), 'MMM d, yyyy HH:mm')}</p>
              </div>

              {delivery.estimatedDelivery && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Estimated Delivery</h3>
                  <p className="mt-1 text-sm text-gray-900">{format(new Date(delivery.estimatedDelivery), 'MMM d, yyyy')}</p>
                </div>
              )}

              {delivery.actualDelivery && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Actual Delivery</h3>
                  <p className="mt-1 text-sm text-gray-900">{format(new Date(delivery.actualDelivery), 'MMM d, yyyy')}</p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Addresses</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Pickup Address</h4>
                  <p className="text-sm text-gray-900">
                    {delivery.pickupAddress.street}<br />
                    {delivery.pickupAddress.city}, {delivery.pickupAddress.state} {delivery.pickupAddress.zipCode}<br />
                    {delivery.pickupAddress.country}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Delivery Address</h4>
                  <p className="text-sm text-gray-900">
                    {delivery.deliveryAddress.street}<br />
                    {delivery.deliveryAddress.city}, {delivery.deliveryAddress.state} {delivery.deliveryAddress.zipCode}<br />
                    {delivery.deliveryAddress.country}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Package Details</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Weight</h4>
                  <p className="text-sm text-gray-900">{delivery.packageDetails.weight} kg</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Dimensions</h4>
                  <p className="text-sm text-gray-900">{delivery.packageDetails.dimensions || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Value</h4>
                  <p className="text-sm text-gray-900">R{delivery.packageDetails.value.toFixed(2)}</p>
                </div>
              </div>
              {delivery.packageDetails.description && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                  <p className="text-sm text-gray-900">{delivery.packageDetails.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
