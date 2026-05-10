// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Delivery } from '@/types';
import { deliveriesAPI } from '@/lib/api';
import { format } from 'date-fns';
import { Package, Truck, Clock, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    activeDeliveries: 0,
    completedDeliveries: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    const loadDeliveries = async () => {
      try {
        const response = await deliveriesAPI.getAll();
        const data = response.data;
        setDeliveries(data);

        // Calculate stats
        const active = data.filter(d => !['delivered', 'cancelled'].includes(d.status)).length;
        const completed = data.filter(d => d.status === 'delivered').length;
        const totalSpent = data.reduce((sum, d) => sum + d.price, 0);

        setStats({
          totalDeliveries: data.length,
          activeDeliveries: active,
          completedDeliveries: completed,
          totalSpent: totalSpent,
        });
      } catch (error) {
        console.error('Failed to fetch deliveries:', error);
      }
    };

    loadDeliveries();
  }, []);

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      payment_pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      picked_up: 'bg-purple-100 text-purple-800',
      in_transit: 'bg-indigo-100 text-indigo-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-10">
        <header>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
              Dashboard
            </h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Stats */}
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-blue-500 p-3">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Total Deliveries</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.totalDeliveries}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-yellow-500 p-3">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Active Deliveries</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.activeDeliveries}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Completed</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.completedDeliveries}</dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 rounded-md bg-purple-500 p-3">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">Total Spent</dt>
                      <dd className="text-lg font-semibold text-gray-900">${stats.totalSpent.toFixed(2)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <div className="mt-8">
              <Link
                href="/deliveries/new"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
              >
                + New Delivery
              </Link>
            </div>

            {/* Recent Deliveries */}
            <div className="mt-8">
              <div className="overflow-hidden bg-white shadow sm:rounded-md">
                <ul role="list" className="divide-y divide-gray-200">
                  {deliveries.slice(0, 5).map((delivery) => (
                    <li key={delivery.id}>
                      <Link href={`/deliveries/${delivery.id}`} className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="truncate text-sm font-medium text-blue-600">
                              {delivery.customerName}
                            </p>
                            <div className="ml-2 flex flex-shrink-0">
                              <p className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadge(delivery.status)}`}>
                                {delivery.status.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                {delivery.pickupAddress.city} → {delivery.deliveryAddress.city}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                              <p>
                                {format(new Date(delivery.createdAt), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                  {deliveries.length === 0 && (
                    <li className="px-4 py-8 text-center text-gray-500">
                      No deliveries yet. Create your first delivery!
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
